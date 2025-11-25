from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

# --- MODEL LOADING (Serverless Optimization) ---
MODEL = None
LABEL_ENCODERS = None
FEATURE_COLUMNS = None

try:
    # Model.pkl should be in root directory (same level as 'api' folder)
    model_path = os.path.join(os.path.dirname(__file__), '..', 'model.pkl')
    if os.path.exists(model_path):
        with open(model_path, 'rb') as file:
            model_data = pickle.load(file)
        MODEL = model_data['model']
        LABEL_ENCODERS = model_data['label_encoders']
        FEATURE_COLUMNS = model_data['feature_columns']
        print("✓ Model loaded successfully!")
    else:
        print("⚠ Model file not found - API will return error until model is uploaded")
except Exception as e:
    print(f"✗ Error loading model: {e}")

# --- FLASK APP INITIALIZATION ---
app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    """Simple check to see if the API is running."""
    return jsonify({
        "status": "API is Running",
        "message": "Send a POST request to /predict with your EV parameters.",
        "model_loaded": MODEL is not None
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'EV Range Prediction API is running'
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Handles prediction requests."""
    
    if MODEL is None:
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
            if col in LABEL_ENCODERS:
                try:
                    input_df[col] = LABEL_ENCODERS[col].transform(input_df[col].astype(str))
                except ValueError:
                    # If value not seen during training, use a default encoding
                    input_df[col] = 0
        
        # Make prediction
        prediction = MODEL.predict(input_df)[0]
        
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
    if MODEL is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'modelType': 'RandomForestRegressor',
        'features': FEATURE_COLUMNS,
        'targetVariable': 'Electric Range (miles)',
        'status': 'ready'
    }), 200

# Error handlers
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
