import warnings
import joblib
import pandas as pd
from pathlib import Path

warnings.filterwarnings("ignore", message=".*InconsistentVersionWarning.*")
warnings.filterwarnings("ignore", message=".*Trying to unpickle.*")


class MentalHealthPipeline:
    def __init__(self, model_dir: str | Path):
        model_dir = Path(model_dir)
        self.scaler = joblib.load(model_dir / "scaler_mental_health.pkl")
        self.model_imputer = joblib.load(model_dir / "model_prediksi_adiksi.pkl")
        self.model_lr = joblib.load(model_dir / "model_regresi_mental_health.pkl")
        self.model_rf = joblib.load(model_dir / "model_rf_tuned.pkl")

    def predict(
        self,
        daily_gaming_hours: float,
        competitive_rank: int,
        addiction_level: float | None = None,
        model_choice: str = "linear_regression",
    ) -> dict:
        # Step 1: Impute addiction_level if not provided by user
        if addiction_level is None:
            input_imputer = pd.DataFrame(
                [[daily_gaming_hours, competitive_rank]],
                columns=["daily_gaming_hours", "competitive_rank"],
            )
            addiction_level = float(self.model_imputer.predict(input_imputer)[0])
            addiction_level = max(0.0, min(10.0, addiction_level))
            addiction_source = "predicted"
        else:
            addiction_source = "user_input"

        # Step 2: Scale — order must be ['addiction_level', 'daily_gaming_hours', 'competitive_rank']
        raw_features = pd.DataFrame(
            [[addiction_level, daily_gaming_hours, competitive_rank]],
            columns=["addiction_level", "daily_gaming_hours", "competitive_rank"],
        )
        scaled_features = self.scaler.transform(raw_features)

        # Step 3: Predict depression score
        model = self.model_rf if model_choice == "random_forest" else self.model_lr
        depression_score = float(model.predict(scaled_features)[0])
        depression_score = max(0.0, min(10.0, depression_score))

        # Step 4: Risk classification — thresholds match notebook
        if depression_score >= 7.5:
            risk_level, risk_label = "high", "BAHAYA — Risiko Tinggi Gangguan Mental"
        elif depression_score >= 5.5:
            risk_level, risk_label = "moderate", "WASPADA — Bermain Terlalu Intens"
        else:
            risk_level, risk_label = "low", "AMAN — Kondisi Mental Diprediksi Stabil"

        return {
            "daily_gaming_hours": daily_gaming_hours,
            "competitive_rank": competitive_rank,
            "addiction_level": round(addiction_level, 2),
            "addiction_source": addiction_source,
            "depression_score": round(depression_score, 2),
            "risk_level": risk_level,
            "risk_label": risk_label,
            "model_used": model_choice,
        }
