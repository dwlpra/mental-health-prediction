# Mental Health Gaming Predictor

Prediksi risiko kesehatan mental (depression_score 0-10) berdasarkan perilaku bermain game menggunakan arsitektur **Model Chaining**.

Tugas 4: Modeling Experiments — Kelompok 3

## Fitur
- **Model Chaining**: Imputer (prediksi addiction level) → Scaler → Predictor (Linear Regression / Random Forest)
- **Conversational AI**: Chat interface dengan Groq AI yang mengekstrak fitur dari bahasa natural
- **Responsive UI**: Glassmorphism dark mode, mobile-first

## Tech Stack
- **Backend**: FastAPI + scikit-learn + Groq API (Llama 3.3 70B)
- **Frontend**: React + Vite + Tailwind CSS
- **ML Models**: Linear Regression (R²=0.563), Random Forest Tuned (R²=0.565)

## Anggota Kelompok
| Nama | NIM |
|---|---|
| Ade Dwi Putra | 25/574144/PPA/07237 |
| Hikmah Nursidik | 25/573877/PPA/07227 |
| Muhammad Aziiz Pranaja | 25/572885/PPA/07200 |
