from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import secrets
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn as nn
import pandas as pd
from typing import Optional
from urllib.parse import urlencode

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
class Config:
    REDDIT_CLIENT_ID = "3aHkvg1zTxdOo3fsekvpnw"
    REDDIT_CLIENT_SECRET = "1va7WqM7ZgtXO9X1eI0f0ePgQtrMjA"
    REDDIT_REDIRECT_URI = "http://localhost:8000/auth/callback"
    REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize"
    REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
    REDDIT_API_URL = "https://oauth.reddit.com"
    SESSION_SECRET = secrets.token_urlsafe(32)

# In-memory session storage
sessions = {}

# Load topic mapping
try:
    df = pd.read_excel("Arabic.xlsx")
    topics = df["Topic"].unique()
    topic_to_id = {topic: i for i, topic in enumerate(topics)}
    id_to_topic = {i: topic for topic, i in topic_to_id.items()}
except Exception as e:
    print(f"Error loading topic mapping: {e}")
    topics = []
    topic_to_id = {}
    id_to_topic = {}

# Model setup
try:
    model_name = "aubmindlab/bert-base-arabertv02"
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    class MultiTaskModel(nn.Module):
        def __init__(self, model_name, num_topics):
            super(MultiTaskModel, self).__init__()
            self.bert = AutoModel.from_pretrained(model_name)
            self.hate_speech_classifier = nn.Linear(self.bert.config.hidden_size, 2)
            self.topic_classifier = nn.Linear(self.bert.config.hidden_size, num_topics)

        def forward(self, input_ids, attention_mask):
            bert_outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
            pooled_output = bert_outputs.last_hidden_state[:, 0, :]
            hate_speech_logits = self.hate_speech_classifier(pooled_output)
            topic_logits = self.topic_classifier(pooled_output)
            return hate_speech_logits, topic_logits

    num_topics = len(topics)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MultiTaskModel(model_name, num_topics).to(device)
    model.load_state_dict(torch.load("arabert_hate_speech_topics (1).pth", map_location=device))
    model.eval()
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Request Schema
class TextInput(BaseModel):
    text: str

# OAuth helpers
def generate_state() -> str:
    state = secrets.token_urlsafe(16)
    sessions[state] = True
    return state

def validate_state(state: str) -> bool:
    return state in sessions

def exchange_code_for_token(code: str) -> dict:
    headers = {
        "User-Agent": "ArabicHateSpeechDetector/1.0",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": Config.REDDIT_REDIRECT_URI
    }
    response = requests.post(
        Config.REDDIT_TOKEN_URL,
        data=data,
        auth=(Config.REDDIT_CLIENT_ID, Config.REDDIT_CLIENT_SECRET),
        headers=headers,
        timeout=10
    )
    response.raise_for_status()
    return response.json()

def get_reddit_user_info(access_token: str) -> dict:
    headers = {
        "Authorization": f"bearer {access_token}",
        "User-Agent": "ArabicHateSpeechDetector/1.0"
    }
    response = requests.get(
        f"{Config.REDDIT_API_URL}/api/v1/me",
        headers=headers,
        timeout=10
    )
    response.raise_for_status()
    return response.json()

# Prediction function
def predict(text: str):
    inputs = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        hate_speech_logits, topic_logits = model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"]
        )

    hate_pred = torch.argmax(hate_speech_logits, dim=1).item()
    topic_pred = torch.argmax(topic_logits, dim=1).item()

    return {
        "hate_speech": "Hate Speech" if hate_pred == 1 else "Not Hate Speech",
        "topic": id_to_topic.get(topic_pred, "Unknown")
    }

# FastAPI routes
@app.get("/login/reddit")
async def login_reddit():
    state = generate_state()
    auth_url = (
        f"{Config.REDDIT_AUTH_URL}?"
        f"client_id={Config.REDDIT_CLIENT_ID}&"
        f"response_type=code&"
        f"state={state}&"
        f"redirect_uri={Config.REDDIT_REDIRECT_URI}&"
        f"duration=permanent&"
        f"scope=read identity history"
    )
    return RedirectResponse(url=auth_url)

@app.get("/auth/callback")
async def reddit_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Reddit authorization failed: {error}")
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state parameter")
    if not validate_state(state):
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    token_data = exchange_code_for_token(code)
    user_data = get_reddit_user_info(token_data["access_token"])

    params = {
        "access_token": token_data["access_token"],
        "user_name": user_data.get("name", "reddit_user"),
        "user_id": user_data.get("id"),
        "icon_img": user_data.get("icon_img", "")
    }
    query_string = urlencode(params)
    redirect_url = f"http://localhost:3000/dashboard?{query_string}"

    return RedirectResponse(url=redirect_url)

@app.post("/predict/")
async def predict_endpoint(data: TextInput):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        prediction = predict(data.text)
        return {
            "text": data.text,
            "hate_speech": prediction["hate_speech"],
            "topic": prediction["topic"],
            "timestamp": pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/analyze-me/")
async def analyze_reddit_user(request: Request, limit: int = 10):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    access_token = auth_header.split(" ")[1]

    try:
        headers = {
            "Authorization": f"bearer {access_token}",
            "User-Agent": "ArabicHateSpeechDetector/1.0"
        }

        user_info = get_reddit_user_info(access_token)
        username = user_info.get("name")
        if not username:
            raise HTTPException(status_code=400, detail="Username not found")

        posts_response = requests.get(
            f"{Config.REDDIT_API_URL}/user/{username}/submitted",
            headers=headers,
            params={"limit": limit}
        )
        posts_response.raise_for_status()

        comments_response = requests.get(
            f"{Config.REDDIT_API_URL}/user/{username}/comments",
            headers=headers,
            params={"limit": limit}
        )
        comments_response.raise_for_status()

        posts_with_comments = []
        for post in posts_response.json().get("data", {}).get("children", []):
            post_data = post["data"]
            post_id = post_data["id"]

            comments_for_post = requests.get(
                f"{Config.REDDIT_API_URL}/comments/{post_id}",
                headers=headers
            )
            comments_for_post.raise_for_status()

            post_prediction = predict(post_data.get("selftext", ""))
            post_item = {
                "type": "post",
                "text": post_data.get("selftext", ""),
                "title": post_data.get("title", ""),
                "url": f"https://reddit.com{post_data.get('permalink', '')}",
                "hate_speech": post_prediction["hate_speech"],
                "topic": post_prediction["topic"]
            }

            post_comments = []
            hate_comments = []

            for comment in comments_for_post.json()[1]["data"]["children"]:
                if comment["kind"] != "t1":
                    continue
                comment_data = comment["data"]
                comment_prediction = predict(comment_data.get("body", ""))
                comment_item = {
                    "type": "comment",
                    "text": comment_data.get("body", ""),
                    "url": f"https://reddit.com{comment_data.get('permalink', '')}",
                    "hate_speech": comment_prediction["hate_speech"],
                    "topic": comment_prediction["topic"]
                }
                post_comments.append(comment_item)
                if comment_prediction["hate_speech"] == "Hate Speech":
                    hate_comments.append(comment_item)

            posts_with_comments.append({
                "post": post_item,
                "comments": post_comments,
                "hate_comments": hate_comments
            })

        standalone_comments = []
        for item in comments_response.json().get("data", {}).get("children", []):
            comment_data = item["data"]
            prediction = predict(comment_data.get("body", ""))
            standalone_comments.append({
                "type": "comment",
                "text": comment_data.get("body", ""),
                "url": f"https://reddit.com{comment_data.get('permalink', '')}",
                "hate_speech": prediction["hate_speech"],
                "topic": prediction["topic"]
            })

        all_content = []
        hate_speech_count = 0

        for item in posts_with_comments:
            all_content.append(item["post"])
            if item["post"]["hate_speech"] == "Hate Speech":
                hate_speech_count += 1
            all_content.extend(item["comments"])
            hate_speech_count += len([c for c in item["comments"] if c["hate_speech"] == "Hate Speech"])

        all_content.extend(standalone_comments)
        hate_speech_count += len([c for c in standalone_comments if c["hate_speech"] == "Hate Speech"])

        total_analyzed = len(all_content)
        hate_speech_percentage = (hate_speech_count / total_analyzed * 100) if total_analyzed > 0 else 0

        topics_distribution = {}
        for item in all_content:
            topic = item["topic"]
            topics_distribution[topic] = topics_distribution.get(topic, 0) + 1

        return {
            "total_posts": len(posts_with_comments),
            "total_comments": len(standalone_comments) + sum(len(p["comments"]) for p in posts_with_comments),
            "total_analyzed": total_analyzed,
            "hate_speech_count": hate_speech_count,
            "hate_speech_percentage": hate_speech_percentage,
            "topics_distribution": topics_distribution,
            "posts_with_comments": posts_with_comments,
            "standalone_comments": standalone_comments
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch Reddit content: {str(e)}")
@app.post("/reddit/approve-comment/")
async def approve_comment(request: Request):
    try:
        access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
        body = await request.json()
        comment_id = body.get("comment_id")

        if not comment_id:
            raise HTTPException(status_code=400, detail="Missing comment_id")

        if not comment_id.startswith('t1_'):
            comment_id = f't1_{comment_id}'

        headers = {
            "Authorization": f"bearer {access_token}",
            "User-Agent": "ArabicHateSpeechDetector/1.0",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        response = requests.post(
            "https://oauth.reddit.com/api/approve",
            headers=headers,
            data={"id": comment_id},
            timeout=10
        )

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Reddit error: {response.text}")

        return {"status": "success", "message": "Comment approved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Arabic Hate Speech & Topic Detection API is live."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)