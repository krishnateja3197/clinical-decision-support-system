import sys
import json
import numpy as np
import pickle
from joblib import load  # Import joblib
from sklearn.preprocessing import LabelEncoder  # Import LabelEncoder
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

import os

# Suppress TensorFlow oneDNN logs
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppresses unnecessary TensorFlow logs

# Now import TensorFlow
import tensorflow as tf

import warnings
warnings.filterwarnings("ignore")  # Suppress all warnings from sklearn

import sys
sys.stderr = open(os.devnull, 'w')  # Redirects all stderr logs to null (hides all logs)

# Your remaining code...



# Define model path
model_path = "final_biobert_model-1"

# Load the BioBERT tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForTokenClassification.from_pretrained(model_path)

# Define label mapping
id2label = {0: "O", 1: "B-SYMPTOM", 2: "I-SYMPTOM"}
label2id = {"O": 0, "B-SYMPTOM": 1, "I-SYMPTOM": 2}

# Create an NER pipeline
nlp_ner = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

def extract_symptoms(text):
    """Extracts symptoms from the model's NER predictions."""
    ner_results = nlp_ner(text)
    symptoms = []
    current_symptom = ""

    for i, entity in enumerate(ner_results):
        word = entity["word"]
        
        # Merge subword tokens (e.g., ##ness in "dizziness")
        if word.startswith("##"):
            current_symptom += word[2:]
        else:
            if current_symptom:
                if i > 0 and ner_results[i - 1]["end"] == entity["start"]:
                    current_symptom += " " + word  # Merge adjacent symptoms
                else:
                    symptoms.append(current_symptom)
                    current_symptom = word
            else:
                current_symptom = word
    
    if current_symptom:
        symptoms.append(current_symptom)
    
    return list(set(symptoms))  # Remove duplicates

try:
    text_input = sys.stdin.read().strip()
    if not text_input:
        print(json.dumps({"error": "Text input is required"}))
        sys.exit(1)
    
    data = json.loads(text_input)
    extracted_text = data.get("text", "").strip()
    
    if not extracted_text:
        print(json.dumps({"error": "Text field is missing or empty"}))
        sys.exit(1)
    
    predicted_symptoms = extract_symptoms(extracted_text)

    
    # Step 1: Given list of all symptoms (132 symptoms)
    all_symptoms = [
        'itching', 'skin rash', 'nodal skin eruptions', 'continuous sneezing', 'shivering', 'chills', 'joint pain',
        'stomach pain', 'acidity', 'ulcers on tongue', 'muscle wasting', 'vomiting', 'burning micturition',
        'spotting urination', 'fatigue', 'weight gain', 'anxiety', 'cold hands and feets', 'mood swings', 'weight loss',
        'restlessness', 'lethargy', 'patches in throat', 'irregular sugar level', 'cough', 'high fever', 'sunken eyes',
        'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish skin', 'dark urine', 'nausea',
        'loss of appetite', 'pain behind the eyes', 'back pain', 'constipation', 'abdominal pain', 'diarrhoea',
        'mild fever', 'yellow urine', 'yellowing of eyes', 'acute liver failure', 'fluid overload', 'swelling of stomach',
        'swelled lymph nodes', 'malaise', 'blurred and distorted vision', 'phlegm', 'throat irritation', 'redness of eyes',
        'sinus pressure', 'runny nose', 'congestion', 'chest pain', 'weakness in limbs', 'fast heart rate',
        'pain during bowel movements', 'pain in anal region', 'bloody stool', 'irritation in anus', 'neck pain', 'dizziness',
        'cramps', 'bruising', 'obesity', 'swollen legs', 'swollen blood vessels', 'puffy face and eyes', 'enlarged thyroid',
        'brittle nails', 'swollen extremities', 'excessive hunger', 'extra marital contacts', 'drying and tingling lips',
        'slurred speech', 'knee pain', 'hip joint pain', 'muscle weakness', 'stiff neck', 'swelling joints',
        'movement stiffness', 'spinning movements', 'loss of balance', 'unsteadiness', 'weakness of one body side',
        'loss of smell', 'bladder discomfort', 'foul smell of urine', 'continuous feel of urine', 'passage of gases',
        'internal itching', 'toxic look (typhos)', 'depression', 'irritability', 'muscle pain', 'altered sensorium',
        'red spots over body', 'belly pain', 'abnormal menstruation', 'dischromic patches', 'watering from eyes',
        'increased appetite', 'polyuria', 'family history', 'mucoid sputum', 'rusty sputum', 'lack of concentration',
        'visual disturbances', 'receiving blood transfusion', 'receiving unsterile injections', 'coma', 'stomach bleeding',
        'distention of abdomen', 'history of alcohol consumption', 'fluid overload', 'blood in sputum',
        'prominent veins on calf', 'palpitations', 'painful walking', 'pus filled pimples', 'blackheads', 'scurrying',
        'skin peeling', 'silver like dusting', 'small dents in nails', 'inflammatory nails', 'blister',
        'red sore around nose', 'yellow crust ooze'
    ]
    
    symptom_array = np.zeros(len(all_symptoms), dtype=int)
    for predicted_symptom in predicted_symptoms:
       for i, symptom in enumerate(all_symptoms):
          if predicted_symptom in symptom:
              symptom_array[i] = 1
              break  # Mark only the first match for this predicted_symptom
   
    with open("random_forest_model-3.pkl", "rb") as model_file:
        loaded_rf_model = load(model_file)
    
    predicted_disease_index = loaded_rf_model.predict([symptom_array])[0]
    
    with open("label_encoder-3.pkl", "rb") as encoder_file:
        label_encoder = pickle.load(encoder_file)
        if isinstance(label_encoder, np.ndarray):
            temp_encoder = LabelEncoder()
            temp_encoder.classes_ = label_encoder
            label_encoder = temp_encoder
    
    predicted_disease = label_encoder.inverse_transform([predicted_disease_index])[0]
    
    print(json.dumps({
    "text_input": extracted_text, 
    "extracted_symptoms": predicted_symptoms,  
    "symptoms_array": symptom_array.tolist() if isinstance(symptom_array, np.ndarray) else symptom_array,  
    "disease": predicted_disease
    }))
    
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)