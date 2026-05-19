PYTHON := .venv/bin/python
UVICORN := .venv/bin/uvicorn

.PHONY: backend frontend dev install clean hf-login hf-upload-model hf-upload-dataset hf-upload

install:
	$(PYTHON) -m pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd /home/ade/MCS/data-science && $(UVICORN) backend.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	@$(MAKE) backend & $(MAKE) frontend

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	rm -rf frontend/node_modules frontend/dist

# ──────────────────────────────────────
# Hugging Face — Upload model & dataset
# ──────────────────────────────────────
# STEP 1: Login (hanya sekali)
#   $ make hf-login
#   Paste token dari https://huggingface.co/settings/tokens (pilih Write)
#
# STEP 2: Upload
#   $ make hf-upload        → upload model + dataset sekaligus
#   $ make hf-upload-model  → hanya model (4 file .pkl)
#   $ make hf-upload-dataset → hanya dataset (gaming_mental_health.csv)
#
# HASIL:
#   Model:   https://huggingface.co/adeputr4/mental-health-gaming-predictor
#   Dataset: https://huggingface.co/datasets/adeputr4/mental-health-gaming-dataset
# ──────────────────────────────────────

hf-login:
	@echo "Buat token di: https://huggingface.co/settings/tokens (pilih Write)"
	@hf auth login

hf-upload-model:
	@echo "Uploading model ke HuggingFace..."
	@$(PYTHON) upload_hf.py

hf-upload-dataset:
	@echo "Uploading dataset ke HuggingFace..."
	@$(PYTHON) upload_dataset_hf.py

hf-upload: hf-upload-model hf-upload-dataset
	@echo ""
	@echo "Done!"
	@echo "  Model:   https://huggingface.co/adeputr4/mental-health-gaming-predictor"
	@echo "  Dataset: https://huggingface.co/datasets/adeputr4/mental-health-gaming-dataset"
