import requests
import secrets
import logging
from fastapi import HTTPException
from urllib.parse import urlencode

class Config:
    REDDIT_CLIENT_ID = "3aHkvg1zTxdOo3fsekvpnw"
    REDDIT_CLIENT_SECRET = "1va7WqM7ZgtXO9X1eI0f0ePgQtrMjA"
    REDDIT_REDIRECT_URI = "http://localhost:8000/auth/callback"
    REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize"
    REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
    REDDIT_API_URL = "https://oauth.reddit.com"


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


sessions = {}

def generate_state() -> str:
    
    state = secrets.token_urlsafe(16)
    sessions[state] = True
    logger.info(f"Generated state: {state}")
    return state

def validate_state(state: str) -> bool:
    
    if state in sessions:
        del sessions[state]
        logger.info(f"State validated and removed: {state}")
        return True
    logger.warning(f"Invalid state detected: {state}")
    return False


def exchange_code_for_token(authorization_code):
   
    try:
        token_url = "https://www.reddit.com/api/v1/access_token"
        client_id = Config.REDDIT_CLIENT_ID
        client_secret = Config.REDDIT_CLIENT_SECRET
        redirect_uri = Config.REDDIT_REDIRECT_URI

       
        response = requests.post(
            token_url,
            auth=(client_id, client_secret),  
            data={
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": redirect_uri,
            },
            headers={"User-Agent": "HateSpeechDetector/1.0"},
            timeout=10
        )

       
        token_data = response.json()
        if response.status_code != 200:
            raise Exception(f"Error fetching access token: {token_data.get('message')}")

       
        print(f"Access token fetched successfully: {token_data}")

        return token_data  
    except Exception as e:
        print(f"Error exchanging code for token: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to obtain access token")
def get_reddit_user_info(token):
    
    try:
        response = requests.get(
            "https://oauth.reddit.com/api/v1/me",
            headers={"Authorization": f"Bearer {token}", "User-Agent": "ArabicHateSpeechDetector/1.0"},
            timeout=10
        )

        user_info = response.json()
        logger.info(f"Reddit user info fetched successfully: {user_info}")
        return user_info
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Reddit user info: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")