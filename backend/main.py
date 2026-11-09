from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS: permite que o frontend (Vite em dev) chame a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gabarito vive no backend (o frontend nunca deve conhecê-lo antes da validação).
# Se a Issue #3 já tiver um banco/estrutura própria, substitua este dicionário.
EXERCISES = {
    1: "<class 'int'>",
    2: "<class 'int'>",
    3: "<class 'int'>",
    4: "<class 'int'>",
    5: "<class 'int'>",
}


class ValidateRequest(BaseModel):
    answer: str


class ValidateResponse(BaseModel):
    correct: bool
    correct_answer: str


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok", "message": "Servico funcionando"}


@app.post("/api/exercises/{exercise_id}/validate", response_model=ValidateResponse)
def validate_exercise(exercise_id: int, payload: ValidateRequest):
    correct_answer = EXERCISES.get(exercise_id)
    if correct_answer is None:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")

    return ValidateResponse(
        correct=payload.answer == correct_answer,
        correct_answer=correct_answer,
    )