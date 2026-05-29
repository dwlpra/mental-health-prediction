import warnings
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

warnings.filterwarnings("ignore", message=".*InconsistentVersionWarning.*")
warnings.filterwarnings("ignore", message=".*Trying to unpickle.*")

MODEL_FILES = {
    "linear_regression": "model_lr_v3.pkl",
    "xgboost": "model_xgb_v3.pkl",
    "lightgbm": "model_lgbm_v3.pkl",
}


class MentalHealthPipeline:
    BASE_FEATURES = [
        "addiction_level",
        "daily_gaming_hours",
        "stress_level",
        "screen_time_total",
        "anxiety_score",
        "loneliness_score",
    ]

    def __init__(self, model_dir: str | Path):
        model_dir = Path(model_dir)
        self.models = {name: joblib.load(model_dir / fname) for name, fname in MODEL_FILES.items()}
        self.scaler = joblib.load(model_dir / "scaler_v3.pkl")
        self.feature_names: list[str] = joblib.load(model_dir / "features_v3.pkl")
        self.medians: dict = joblib.load(model_dir / "medians_v3.pkl")

    def _engineer_features(self, base: dict) -> dict:
        al = base.get("addiction_level", self.medians.get("addiction_level", 0))
        dh = base.get("daily_gaming_hours", self.medians.get("daily_gaming_hours", 0))
        sl = base.get("stress_level", self.medians.get("stress_level", 0))
        st = base.get("screen_time_total", self.medians.get("screen_time_total", 0))
        ax = base.get("anxiety_score", self.medians.get("anxiety_score", 0))
        ln = base.get("loneliness_score", self.medians.get("loneliness_score", 0))
        sh = base.get("sleep_hours", self.medians.get("sleep_hours", 7))
        eh = base.get("exercise_hours", self.medians.get("exercise_hours", 0))
        si = base.get("social_interaction_score", self.medians.get("social_interaction_score", 0))
        hp = base.get("happiness_score", self.medians.get("happiness_score", 0))
        rs = base.get("relationship_satisfaction", self.medians.get("relationship_satisfaction", 0))
        tx = base.get("toxic_exposure", self.medians.get("toxic_exposure", 0))
        ag = base.get("aggression_score", self.medians.get("aggression_score", 0))

        engineered = {}
        pairs = [
            ("addiction_x_hours", al * dh), ("addiction_x_stress", al * sl),
            ("addiction_x_anxiety", al * ax), ("addiction_x_lonely", al * ln),
            ("stress_x_anxiety", sl * ax), ("stress_x_lonely", sl * ln),
            ("anxiety_x_lonely", ax * ln), ("stress_plus_anxiety", sl + ax),
            ("lonely_x_social", ln * si), ("happy_x_stress", hp * sl),
            ("relation_x_lonely", rs * ln), ("gaming_to_sleep", dh / (sh + 1e-6)),
            ("sleep_x_exercise", sh * eh),
            ("toxic_x_aggression", tx * ag), ("toxic_x_stress", tx * sl),
            ("toxic_x_anxiety", tx * ax),
        ]
        for name, val in pairs:
            if name in self.feature_names:
                engineered[name] = val

        for col, val in [("addiction_level", al), ("stress_level", sl),
                          ("anxiety_score", ax), ("loneliness_score", ln),
                          ("happiness_score", hp), ("daily_gaming_hours", dh)]:
            if f"{col}_sq" in self.feature_names:
                engineered[f"{col}_sq"] = val ** 2
            if f"{col}_cb" in self.feature_names:
                engineered[f"{col}_cb"] = val ** 3

        return engineered

    def predict(self, model_choice: str = "linear_regression", **kwargs) -> dict:
        if model_choice not in self.models:
            model_choice = "linear_regression"
        model = self.models[model_choice]

        base = {feat: kwargs.get(feat, self.medians.get(feat, 0.0)) for feat in self.BASE_FEATURES}
        for feat in ["sleep_hours", "exercise_hours", "social_interaction_score",
                      "happiness_score", "relationship_satisfaction",
                      "toxic_exposure", "aggression_score"]:
            if feat in kwargs:
                base[feat] = kwargs[feat]

        engineered = self._engineer_features(base)

        row = {}
        for feat in self.feature_names:
            if feat in engineered:
                row[feat] = engineered[feat]
            elif feat in base:
                row[feat] = base[feat]
            else:
                row[feat] = self.medians.get(feat, 0.0)

        X_input = pd.DataFrame([row])[self.feature_names]
        X_scaled = self.scaler.transform(X_input)

        depression_score = float(model.predict(X_scaled)[0])
        depression_score = max(0.0, min(10.0, depression_score))

        if depression_score >= 7.5:
            risk_level, risk_label = "high", "BAHAYA — Risiko Tinggi Gangguan Mental"
        elif depression_score >= 5.5:
            risk_level, risk_label = "moderate", "WASPADA — Bermain Terlalu Intens"
        else:
            risk_level, risk_label = "low", "AMAN — Kondisi Mental Diprediksi Stabil"

        inputs = {k: v for k, v in kwargs.items() if k in self.BASE_FEATURES}

        return {
            **inputs,
            "depression_score": round(depression_score, 2),
            "risk_level": risk_level,
            "risk_label": risk_label,
            "model_used": model_choice,
        }
