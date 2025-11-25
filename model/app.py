from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- 1. Load Model and Encoders ---
MODEL_PATH = 'model.pkl'

def load_model():
    """Load the trained model and encoders"""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run model_train.py first.")
    
    with open(MODEL_PATH, 'rb') as file:
        model_data = pickle.load(file)
    
    return model_data

try:
    model_data = load_model()
    model = model_data['model']
    label_encoders = model_data['label_encoders']
    feature_columns = model_data['feature_columns']
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None
    label_encoders = None
    feature_columns = None

# --- 2. API Routes ---

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'EV Range Prediction API is running'
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict electric vehicle range based on input parameters
    
    Expected JSON body:
    {
        "county": "King County",
        "city": "Seattle",
        "modelYear": 2024,
        "make": "Tesla",
        "model": "Model 3",
        "evType": "BEV",
        "cafvEligibility": "Eligible",
        "electricUtility": "Seattle City Light"
    }
    """
    
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['modelYear', 'make', 'model', 'evType', 'cafvEligibility']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare input data with correct column names from training
        input_dict = {
            'Model_Year': int(data.get('modelYear', 2024)),
            'Make': str(data.get('make', '')),
            'Model': str(data.get('model', '')),
            'EV_Type': str(data.get('evType', '')),
            'CAFV_Eligibility': str(data.get('cafvEligibility', ''))
        }
        
        # Create DataFrame with same columns as training data
        input_df = pd.DataFrame([input_dict])
        
        # Encode categorical features
        for col in ['Make', 'Model', 'EV_Type', 'CAFV_Eligibility']:
            if col in label_encoders:
                try:
                    input_df[col] = label_encoders[col].transform(input_df[col].astype(str))
                except ValueError:
                    # If value not seen during training, use a default encoding
                    input_df[col] = 0
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        # Ensure prediction is non-negative
        prediction = max(0, prediction)
        
        return jsonify({
            'success': True,
            'prediction': {
                'electricRange': round(prediction, 2),
                'unit': 'miles',
                'inputData': {
                    'county': data.get('county', 'N/A'),
                    'city': data.get('city', 'N/A'),
                    'modelYear': input_dict['Model_Year'],
                    'make': data.get('make', ''),
                    'model': data.get('model', ''),
                    'evType': data.get('evType', ''),
                    'cafvEligibility': data.get('cafvEligibility', ''),
                    'electricUtility': data.get('electricUtility', 'N/A')
                }
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the model"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'modelType': 'RandomForestRegressor',
        'features': feature_columns,
        'targetVariable': 'Electric Range (miles)',
        'status': 'ready'
    }), 200

# --- 3. Error Handlers ---

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

# --- 4. Run the app ---
if __name__ == '__main__':
    print("Starting EV Range Prediction API...")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /predict - Make a prediction")
    print("  GET  /model-info - Get model information")
    print("\nServer running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
