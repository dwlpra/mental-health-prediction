import json
from openai import OpenAI

from backend.pipeline import MentalHealthPipeline

SYSTEM_INSTRUCTION = """You are a compassionate and professional mental health screening assistant \
specialized in gaming behavior analysis. You collect THREE specific numbers from the user, \
then run a machine learning prediction and explain the results empathetically.

## THREE numbers you MUST ask for
1. **daily_gaming_hours**: Berapa jam per hari bermain game? (angka, misal: 2, 4.5, 8)
2. **competitive_rank**: Dari skala 1-100, di mana posisi skill level Anda? (1=terendah, 100=terbaik)
3. **addiction_level**: Dari skala 0-10, seberapa kecanduan bermain game? (0=tidak sama sekali, 10=sangat kecanduan)

## Conversation flow (STRICT — follow this order)
1. Greet the user warmly. Ask about their gaming habits naturally.
2. Collect all THREE numbers one by one. Always ask for a specific number with the scale clearly explained.
3. You MUST ask about addiction_level too. Phrase it like: \
"Terakhir, dari skala 0 sampai 10, di mana 0 berarti tidak kecanduan sama sekali dan 10 berarti sangat kecanduan, \
angka berapa yang paling menggambarkan diri Anda?"
4. If the user says they don't know their addiction level, say "Tidak apa-apa, sistem kami bisa memperkirakan \
secara otomatis" then proceed with just daily_gaming_hours and competitive_rank.
5. After collecting the numbers, call predict_mental_health. Include addiction_level if the user gave it.
6. Explain the results with empathy.

## CRITICAL RULES
- ALWAYS ask for a specific NUMBER. NEVER ask vague questions like "are you a good player?" or "apakah Anda kecanduan?"
- Every question must include the scale: "dari skala 1-100", "dari skala 0-10", "berapa jam"
- If user answers descriptively ("saya rata-rata", "cukup bagus"), acknowledge then redirect: \
"Terima kasih! Bisa diberi angka perkiraan dari skala 1-100?"
- For game ranks: Iron/Bronze→15, Silver→35, Gold→55, Platinum→65, Diamond→75, Master→87, Radiant→93. \
Confirm with user: "Diamond kira-kira angka 75 ya, benar?"
- Always respond in the user's language (Indonesian or English).
- This is a screening tool, not a medical diagnosis — always include a disclaimer.

## After prediction
- Explain depression_score and risk level in simple terms.
- If high risk: express concern, suggest professional help.
- If moderate: suggest practical tips (breaks, time limits).
- If low: be encouraging.
- Mention whether addiction_level came from user input or system estimation.
- Give practical advice based on the risk level."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "predict_mental_health",
            "description": (
                "Predicts a player's depression risk score (0-10) based on gaming behavior. "
                "Call this ONLY after you have collected at least daily_gaming_hours and competitive_rank. "
                "Include addiction_level if the user provided it."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "daily_gaming_hours": {
                        "type": "number",
                        "description": "Hours per day playing video games (0-24).",
                    },
                    "competitive_rank": {
                        "type": "integer",
                        "description": (
                            "Skill level as percentile 1-100. "
                            "Iron/Bronze=15, Silver=35, Gold=55, Platinum=65, "
                            "Diamond=75, Master=87, Radiant=93. 'average'=50."
                        ),
                    },
                    "addiction_level": {
                        "type": "number",
                        "description": (
                            "Self-reported addiction level 0-10 (0=not addicted, 10=extremely addicted). "
                            "Include ONLY if the user explicitly gave a number. "
                            "If user said they don't know, omit this field."
                        ),
                    },
                },
                "required": ["daily_gaming_hours", "competitive_rank"],
            },
        },
    }
]


class LLMAgent:
    def __init__(self, pipeline: MentalHealthPipeline, api_key: str, base_url: str, model: str):
        self.pipeline = pipeline
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.history: list[dict] = [
            {"role": "system", "content": SYSTEM_INSTRUCTION}
        ]

    def reset(self):
        self.history = [{"role": "system", "content": SYSTEM_INSTRUCTION}]

    def chat(self, user_message: str, model_choice: str = "linear_regression") -> tuple[str, dict | None]:
        self.history.append({"role": "user", "content": user_message})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.history,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.7,
        )

        message = response.choices[0].message

        if message.tool_calls:
            tool_call = message.tool_calls[0]

            if tool_call.function.name == "predict_mental_health":
                args = json.loads(tool_call.function.arguments)

                result = self.pipeline.predict(
                    daily_gaming_hours=float(args["daily_gaming_hours"]),
                    competitive_rank=int(args["competitive_rank"]),
                    addiction_level=(
                        float(args["addiction_level"])
                        if "addiction_level" in args and args["addiction_level"] is not None
                        else None
                    ),
                    model_choice=model_choice,
                )

                self.history.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments,
                        },
                    }],
                })

                self.history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                })

                final = self.client.chat.completions.create(
                    model=self.model,
                    messages=self.history,
                    temperature=0.7,
                )
                reply = final.choices[0].message.content
                self.history.append({"role": "assistant", "content": reply})
                return reply, result

        reply = message.content
        self.history.append({"role": "assistant", "content": reply})
        return reply, None
