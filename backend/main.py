import warnings

warnings.filterwarnings("ignore")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, MODEL_DIR, CORS_ORIGINS
from backend.pipeline import MentalHealthPipeline
from backend.llm_agent import LLMAgent

app = FastAPI(title="Mental Health Gaming Predictor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline: MentalHealthPipeline | None = None
agent: LLMAgent | None = None


@app.on_event("startup")
def startup():
    global pipeline, agent
    pipeline = MentalHealthPipeline(MODEL_DIR)
    agent = LLMAgent(pipeline, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL)


class ChatRequest(BaseModel):
    message: str
    model_choice: str = "linear_regression"


@app.get("/api/health")
def health():
    return {"status": "ok", "models_loaded": pipeline is not None}


@app.post("/api/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        return JSONResponse({"error": "message is required"}, status_code=400)
    try:
        reply, prediction = agent.chat(req.message, model_choice=req.model_choice)
        resp = {"reply": reply}
        if prediction:
            resp["prediction"] = prediction
        return resp
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/chat/reset")
def reset():
    agent.reset()
    return {"status": "reset"}
