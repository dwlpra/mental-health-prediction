"""Upload dataset to Hugging Face Hub."""
from huggingface_hub import HfApi

REPO_NAME = "mental-health-gaming-dataset"
USERNAME = "adeputr4"
REPO_ID = f"{USERNAME}/{REPO_NAME}"

api = HfApi()

# Create dataset repo
api.create_repo(repo_id=REPO_ID, repo_type="dataset", exist_ok=True)

# Upload CSV
api.upload_file(
    path_or_fileobj="notebook/gaming_mental_health.csv",
    path_in_repo="gaming_mental_health.csv",
    repo_id=REPO_ID,
    repo_type="dataset",
)

# Upload dataset card
api.upload_file(
    path_or_fileobj="README_DATASET.md",
    path_in_repo="README.md",
    repo_id=REPO_ID,
    repo_type="dataset",
)

print(f"\nDone! → https://huggingface.co/datasets/{REPO_ID}")
