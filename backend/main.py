import warnings

warnings.filterwarnings("ignore")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.config import LLM_API_KEYS, LLM_BASE_URL, LLM_MODEL, MODEL_DIR, CORS_ORIGINS
from backend.pipeline import MentalHealthPipeline
from backend.llm_agent import LLMAgent
from prometheus_fastapi_instrumentator import Instrumentator

# ── Custom Business Metrics ──────────────────────
from prometheus_client import Counter, Histogram, Gauge

prediction_total = Counter(
    "mh_prediction_total",
    "Total mental health predictions run",
    ["model_used", "risk_level"]
)
depression_score = Histogram(
    "mh_depression_score",
    "Depression score distribution (0-10)",
    buckets=[0, 2, 4, 5, 6, 7, 8, 10]
)
risk_level_counter = Counter(
    "mh_risk_level_total",
    "Count of predictions by risk level",
    ["risk_level"]
)
chat_total = Counter(
    "mh_chat_messages_total",
    "Total chat messages processed"
)
# ── End Custom Metrics ────────────────────────────

app = FastAPI(title="Mental Health Gaming Predictor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
Instrumentator().instrument(app).expose(app)

pipeline: MentalHealthPipeline | None = None
agent: LLMAgent | None = None


@app.on_event("startup")
def startup():
    global pipeline, agent
    pipeline = MentalHealthPipeline(MODEL_DIR)
    agent = LLMAgent(pipeline, LLM_API_KEYS, LLM_BASE_URL, LLM_MODEL)


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
        chat_total.inc()
        reply, prediction = agent.chat(req.message, model_choice=req.model_choice)
        resp = {"reply": reply}
        if prediction:
            model = prediction.get("model_used", "unknown")
            risk = prediction.get("risk_level", "unknown")
            score = prediction.get("depression_score", 0)
            prediction_total.labels(model_used=model, risk_level=risk).inc()
            depression_score.observe(score)
            risk_level_counter.labels(risk_level=risk).inc()
            resp["prediction"] = prediction
        return resp
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/chat/reset")
def reset():
    agent.reset()
    return {"status": "reset"}
