"""Upload model files to Hugging Face Hub."""
from huggingface_hub import HfApi

REPO_NAME = "mental-health-gaming-predictor"
USERNAME = "adeputr4"
REPO_ID = f"{USERNAME}/{REPO_NAME}"

api = HfApi()

# Create repo (exist_ok=True kalau sudah ada)
api.create_repo(repo_id=REPO_ID, repo_type="model", exist_ok=True)

# Upload model files
for f in [
    "models/model_prediksi_adiksi.pkl",
    "models/scaler_mental_health.pkl",
    "models/model_regresi_mental_health.pkl",
    "models/model_rf_tuned.pkl",
]:
    api.upload_file(path_or_fileobj=f, path_in_repo=f.split("/")[-1], repo_id=REPO_ID, repo_type="model")

# Upload model card
api.upload_file(path_or_fileobj="README_HF.md", path_in_repo="README.md", repo_id=REPO_ID, repo_type="model")

print(f"\nDone! → https://huggingface.co/{REPO_ID}")
