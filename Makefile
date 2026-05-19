PYTHON := .venv/bin/python
UVICORN := .venv/bin/uvicorn

.PHONY: backend frontend dev install clean

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
