import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

# --- 1. Load Data ---
try:
    df = pd.read_csv("data.csv")
    print(f"Data loaded successfully. Shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
except FileNotFoundError:
    print("Error: data.csv not found. Please place it in the same directory.")
    exit()

# --- 2. Data Cleaning & Feature Selection ---
# Select relevant columns for prediction
feature_columns = ['Model_Year', 'Make', 'Model', 'EV_Type', 'CAFV_Eligibility']
target_column = 'Electric_Range'

# Filter data to only include rows with all required columns
df_clean = df[feature_columns + [target_column]].copy()
df_clean = df_clean.dropna()

print(f"Data after cleaning: {df_clean.shape}")
print(f"Target variable (Electric Range) - Min: {df_clean[target_column].min()}, Max: {df_clean[target_column].max()}")

# --- 3. Feature Engineering ---
X = df_clean[feature_columns].copy()
y = df_clean[target_column].copy()

# Store label encoders for later use
label_encoders = {}
categorical_features = ['Make', 'Model', 'EV_Type', 'CAFV_Eligibility']

for col in categorical_features:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

print(f"\nFeatures shape: {X.shape}")
print(f"Target shape: {y.shape}")

# --- 4. Train/Test Split ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- 5. Model Training ---
print("\nTraining Random Forest model...")
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# --- 6. Model Evaluation ---
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Model trained successfully!")
print(f"Train R-squared: {train_score:.4f}")
print(f"Test R-squared: {test_score:.4f}")

# --- 7. Save Model and Encoders ---
model_data = {
    'model': model,
    'label_encoders': label_encoders,
    'feature_columns': feature_columns,
    'target_column': target_column
}

with open('model.pkl', 'wb') as file:
    pickle.dump(model_data, file)

print("\nModel saved successfully as model.pkl")
