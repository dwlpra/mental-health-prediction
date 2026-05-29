---
license: mit
task_categories:
  - tabular-regression
tags:
  - mental-health
  - gaming
  - scikit-learn
  - model-chaining
  - depression-prediction
language:
  - en
pretty_name: Mental Health Gaming Predictor
---

# Mental Health Gaming Predictor

Predicts **depression_score (0–10)** based on gaming behavior using a **Model Chaining** architecture.

> **Tugas 4: Modeling Experiments — Kelompok 3**

## Architecture

```
daily_gaming_hours + competitive_rank
        ↓
   Imputer (predict addiction_level)
        ↓
   [addiction_level, daily_gaming_hours, competitive_rank]
        ↓
      Scaler (StandardScaler)
        ↓
   Predictor (Linear Regression / Random Forest)
        ↓
   depression_score (0–10)
```

## Models

| File | Description |
|---|---|
| `model_prediksi_adiksi.pkl` | Random Forest imputer — predicts `addiction_level` from `daily_gaming_hours` + `competitive_rank` |
| `scaler_mental_health.pkl` | StandardScaler fitted on `[addiction_level, daily_gaming_hours, competitive_rank]` |
| `model_regresi_mental_health.pkl` | **Linear Regression** — primary model |
| `model_rf_tuned.pkl` | Random Forest (50 trees, max_depth=10) — comparison model |

## Performance

| Model | R² Score | Inference Time |
|---|---|---|
| Linear Regression | 0.563 | ~0.1s |
| Random Forest (Tuned) | 0.565 | ~7.2s |

Linear Regression is the recommended model — nearly identical R² with 70× faster inference.

## Risk Classification

| Score | Level | Label |
|---|---|---|
| ≥ 7.5 | High | BAHAYA |
| 5.5 – 7.5 | Moderate | WASPADA |
| < 5.5 | Low | AMAN |

## Usage

```python
import joblib
import numpy as np
import pandas as pd

# Load models
imputer = joblib.load("model_prediksi_adiksi.pkl")
scaler = joblib.load("scaler_mental_health.pkl")
predictor = joblib.load("model_regresi_mental_health.pkl")

# Input
daily_gaming_hours = 6.0
competitive_rank = 80  # percentile 1-100

# Step 1: Predict addiction level (if unknown)
addiction_level = imputer.predict(pd.DataFrame({
    "daily_gaming_hours": [daily_gaming_hours],
    "competitive_rank": [competitive_rank]
}))[0]

# Step 2: Scale features
features = pd.DataFrame({
    "addiction_level": [addiction_level],
    "daily_gaming_hours": [daily_gaming_hours],
    "competitive_rank": [competitive_rank]
})
scaled = scaler.transform(features)

# Step 3: Predict depression score
score = predictor.predict(scaled)[0]
print(f"Depression Score: {score:.2f}")
```

## Dataset

Synthetic gaming behavior and mental health dataset from Kaggle (968,287 rows, 39 columns).
Available at: [adeputr4/mental-health-gaming-dataset](https://huggingface.co/datasets/adeputr4/mental-health-gaming-dataset)

## Team

| Name | Student ID |
|---|---|
| Ade Dwi Putra | 25/574144/PPA/07237 |
| Hikmah Nursidik | 25/573877/PPA/07227 |
| Muhammad Aziiz Pranaja | 25/572885/PPA/07200 |
