import joblib
import shap
import pandas as pd
import json
import numpy as np
import sys
import os
import matplotlib.pyplot as plt
train_df = pd.read_csv("Testing.csv")
X_train = train_df.iloc[:, :-1]
new_column_names = [
    'itching', 'skin rash', 'nodal skin eruptions', 'continuous sneezing', 'shivering', 'chills',
    'joint pain', 'stomach pain', 'acidity', 'ulcers on tongue', 'muscle wasting', 'vomiting',
    'burning micturition', 'spotting urination', 'fatigue', 'weight gain', 'anxiety',
    'cold hands and feets', 'mood swings', 'weight loss', 'restlessness', 'lethargy',
    'patches in throat', 'irregular sugar level', 'cough', 'high fever', 'sunken eyes',
    'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish skin',
    'dark urine', 'nausea', 'loss of appetite', 'pain behind the eyes', 'back pain',
    'constipation', 'abdominal pain', 'diarrhoea', 'mild fever', 'yellow urine',
    'yellowing of eyes', 'acute liver failure', 'fluid overload', 'swelling of stomach',
    'swelled lymph nodes', 'malaise', 'blurred and distorted vision', 'phlegm',
    'throat irritation', 'redness of eyes', 'sinus pressure', 'runny nose', 'congestion',
    'chest pain', 'weakness in limbs', 'fast heart rate', 'pain during bowel movements',
    'pain in anal region', 'bloody stool', 'irritation in anus', 'neck pain', 'dizziness',
    'cramps', 'bruising', 'obesity', 'swollen legs', 'swollen blood vessels',
    'puffy face and eyes', 'enlarged thyroid', 'brittle nails', 'swollen extremeties',
    'excessive hunger', 'extra marital contacts', 'drying and tingling lips', 'slurred speech',
    'knee pain', 'hip joint pain', 'muscle weakness', 'stiff neck', 'swelling joints',
    'movement stiffness', 'spinning movements', 'loss of balance', 'unsteadiness',
    'weakness of one body side', 'loss of smell', 'bladder discomfort', 'foul smell of urine',
    'continuous feel of urine', 'passage of gases', 'internal itching', 'toxic look (typhos)','depression', 'irritability', 'muscle pain', 'altered sensorium', 'red spots over body',
    'belly pain', 'abnormal menstruation', 'dischromic patches', 'watering from eyes',
    'increased appetite', 'polyuria', 'family history', 'mucoid sputum', 'rusty sputum',
    'lack of concentration', 'visual disturbances', 'receiving blood transfusion',
    'receiving unsterile injections', 'coma', 'stomach bleeding', 'distention of abdomen',
    'history of alcohol consumption', 'fluid overload', 'blood in sputum',
    'prominent veins on calf', 'palpitations', 'painful walking', 'pus filled pimples',
    'blackheads', 'scurring', 'skin peeling', 'silver like dusting', 'small dents in nails',
    'inflammatory nails', 'blister', 'red sore around nose', 'yellow crust ooze'
]


# Rename the columns
X_train = X_train.rename(columns=dict(zip(X_train.columns[:], new_column_names[:])))

X_train.head()


def count_files(directory):
    return len([f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))])

def explain_prediction(model, input_array, feature_names, output_path="public/shap_outputs/shap_plot.png"):
    """
    Generates SHAP explanations for the given model and input.
    Args:
    - model: Trained machine learning model
    - input_array: 1D array of symptoms (0s and 1s)
    - feature_names: List of symptom names corresponding to input_array
    """
    # Create SHAP explainer using TreeExplainer (for decision trees like RF, XGBoost, etc.)
    explainer = shap.TreeExplainer(model)

    # Compute SHAP values for the input
    shap_values = explainer.shap_values(input_array)
    
    # Get the predicted class index
    predicted_class_index = np.argmax(model.predict_proba(input_array))

    # Print statements for debugging
   

    # Convert input array into a DataFrame for better visualization
    input_df = pd.DataFrame(input_array, columns=feature_names)

    # Get SHAP values for the predicted class
    shap_values_class = shap_values[predicted_class_index] if isinstance(shap_values, list) else shap_values[0, :, predicted_class_index]

    # Plot the SHAP force plot
    force_plot= shap.force_plot(
        explainer.expected_value[predicted_class_index],
        shap_values_class,
        input_df,
    )
    
    # Save SHAP force plot as an interactive HTML file
    directory_path = "public/shap_outputs"  # Change this to your directory
    file_count = count_files(directory_path)

    output_html_path = f"public/shap_outputs/shap_force_plot_{file_count + 1}.html"
    # shap.save_html(
    #     output_html_path, 
    #     shap.force_plot(
    #         explainer.expected_value[predicted_class_index],
    #         shap_values_class,
    #         input_df
    #     )
    # )
    shap.save_html(output_html_path, force_plot)


    # Display important features in descending order
    importance_df = pd.DataFrame({"Feature": feature_names, "SHAP Value": shap_values_class.flatten()})
    importance_df = importance_df.sort_values(by="SHAP Value", ascending=False)


    plt.close()  # Close the figure to free memory

    return importance_df.head(4),output_html_path

def predict_disease(input_array, model_path="random_forest_model-2.pkl"):
    """
    Predicts the disease based on the given symptom input.

    Args:
    - input_array: 1D NumPy array (length = 132, where 1 = present, 0 = absent)
    - model_path: Path to the trained model file

    Returns:
    - Predicted Disease Name
    """
    # Load trained model
    model = joblib.load(model_path)

    # Load label encoder
    label_encoder = joblib.load("label_encoder-2.pkl")

    # Ensure input is a NumPy array and reshape it for the model
    input_array = np.array(input_array).reshape(1, -1)

    # Make prediction
    prediction = model.predict(input_array)[0]
    disease_name = label_encoder.inverse_transform([prediction])[0]

    # print(f" **Predicted Disease:** {disease_name}")

    # Get SHAP explanations
    symptoms_contribution,image_path=explain_prediction(model, input_array, X_train.columns)

    return symptoms_contribution,image_path

if __name__ == "__main__":
    # Read input symptoms from command line arguments
    symptoms_input = list(map(int, sys.argv[1:]))  # Convert CLI args to integers

    if len(symptoms_input) != 132:
        print("Error: Expected 132 symptom values.", file=sys.stderr)
        sys.exit(1)

    # Predict disease
    symptoms_contribution,image_path = predict_disease(symptoms_input)

    # Print predicted disease so Node.js can capture it
    combined_data = {
    "symptoms_values": symptoms_contribution.to_dict(orient="records"),
    "image_path":image_path
    }

    print(json.dumps({"results": combined_data}))

