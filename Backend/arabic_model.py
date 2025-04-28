import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.preprocessing import LabelEncoder
from camel_tools.utils.normalize import (
    normalize_unicode,
    normalize_alef_ar,
    normalize_teh_marbuta_ar,
)
from camel_tools.utils.dediac import dediac_ar
from camel_tools.tokenizers.word import simple_word_tokenize
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HateSpeechDetector:
    def __init__(self):
        try:
            # Paths to models
            binary_model_path = r"C:\Users\Soundous\Desktop\hate-wanlp\Backend\models\fine_tuned_model"
            multi_class_model_path = r"C:\Users\Soundous\Desktop\hate-wanlp\Backend\models\hate_speech_model_multi"

            # Check if model paths exist
            if not os.path.isdir(binary_model_path):
                raise ValueError(f"Binary model path not found: {binary_model_path}")
            if not os.path.isdir(multi_class_model_path):
                raise ValueError(f"Multi-class model path not found: {multi_class_model_path}")

            # Initialize models
            self.binary_tokenizer = AutoTokenizer.from_pretrained(binary_model_path)
            self.binary_model = AutoModelForSequenceClassification.from_pretrained(binary_model_path)
            
            self.multi_class_tokenizer = AutoTokenizer.from_pretrained(multi_class_model_path)
            self.multi_class_model = AutoModelForSequenceClassification.from_pretrained(multi_class_model_path)

            # Initialize label encoder with your specific labels
            self.label_encoder = LabelEncoder()
            self.label_encoder.classes_ = np.array([
                'bullying',
                'insult',
                'misogyny',
                'none',
                'political_hate',
                'racism',
                'religious_hate',
                'violence_incitement'
            ])
            
            logger.info("Models and label encoder initialized successfully.")
            
        except Exception as e:
            logger.error(f"Initialization failed: {str(e)}", exc_info=True)
            raise

    def preprocess_text(self, text):
       
        try:
            text = normalize_unicode(text)
            text = dediac_ar(text)
            text = normalize_alef_ar(text)
            text = normalize_teh_marbuta_ar(text)
            tokens = simple_word_tokenize(text)
            return " ".join(tokens)
        except Exception as e:
            logger.error(f"Text preprocessing failed: {str(e)}", exc_info=True)
            raise

    def detect(self, text):
       
        try:
           
            preprocessed_text = self.preprocess_text(text)
            logger.debug(f"Preprocessed text: {preprocessed_text[:100]}...")

            
            binary_inputs = self.binary_tokenizer(
                preprocessed_text, 
                return_tensors="pt", 
                padding=True, 
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                binary_outputs = self.binary_model(**binary_inputs)
            
            binary_probs = torch.nn.functional.softmax(binary_outputs.logits, dim=-1)
            binary_prediction = torch.argmax(binary_probs, dim=-1).item()
            binary_confidence = binary_probs[0][binary_prediction].item()
            
            binary_label = "hate" if binary_prediction == 1 else "no_hate"

            
            if binary_label == "hate":
                multi_class_inputs = self.multi_class_tokenizer(
                    preprocessed_text, 
                    return_tensors="pt", 
                    padding=True, 
                    truncation=True,
                    max_length=512
                )
                
                with torch.no_grad():
                    multi_class_outputs = self.multi_class_model(**multi_class_inputs)
                
                multi_class_probs = torch.nn.functional.softmax(multi_class_outputs.logits, dim=-1)
                multi_class_prediction = torch.argmax(multi_class_probs, dim=-1).item()

              
                try:
                    multi_class_label = self.label_encoder.inverse_transform([multi_class_prediction])[0]
                except Exception as e:
                    logger.error(f"Label decoding failed for prediction {multi_class_prediction}: {str(e)}", exc_info=True)
                    multi_class_label = "unknown"
                
                return {
                    "result": binary_label,
                    "binary_confidence": float(binary_confidence),
                    "type": str(multi_class_label),
                    "type_confidence": float(multi_class_probs[0][multi_class_prediction].item()),
                    "hate_types_distribution": {
                        label: float(prob) for label, prob in zip(
                            self.label_encoder.classes_, 
                            multi_class_probs[0].tolist()
                        )
                    }
                }
            else:
                return {
                    "result": binary_label,
                    "binary_confidence": float(binary_confidence)
                }
                
        except Exception as e:
            logger.error(f"Detection failed: {str(e)}", exc_info=True)
            raise

# Singleton instance
hate_speech_detector = HateSpeechDetector()
