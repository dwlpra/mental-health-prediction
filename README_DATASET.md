---
license: mit
task_categories:
  - tabular-regression
  - tabular-classification
tags:
  - mental-health
  - gaming
  - depression
  - tabular
  - survey
language:
  - en
pretty_name: Mental Health Gaming Behavior
size_categories:
  - 100K<n<1M
---

# Mental Health Gaming Behavior Dataset

Dataset of gaming behavior and mental health indicators used to predict **depression_score (0–10)** through model chaining.

> **Tugas 4: Modeling Experiments — Kelompok 3**

## Dataset Summary

- **Size**: ~400,000 rows
- **File**: `gaming_mental_health.csv`
- **Target**: `depression_score` (0–10, continuous)

## Key Columns

| Column | Type | Description |
|---|---|---|
| `daily_gaming_hours` | float | Average hours spent gaming per day |
| `competitive_rank` | int | Competitive rank percentile (1–100) |
| `addiction_level` | float | Gaming addiction score (0–10) |
| `depression_score` | float | Depression score (0–10) — target variable |

## Use Case

This dataset is used with a **Model Chaining** architecture:
1. Imputer predicts `addiction_level` from `daily_gaming_hours` + `competitive_rank`
2. Scaled features fed to predictor (Linear Regression / Random Forest)
3. Output: `depression_score` prediction

## Models

Trained models are available at: [adeputr4/mental-health-gaming-predictor](https://huggingface.co/adeputr4/mental-health-gaming-predictor)

## Team

| Name | Student ID |
|---|---|
| Ade Dwi Putra | 25/574144/PPA/07237 |
| Hikmah Nursidik | 25/573877/PPA/07227 |
| Muhammad Aziiz Pranaja | 25/572885/PPA/07200 |
