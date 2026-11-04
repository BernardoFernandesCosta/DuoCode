import json
from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class AnswerRequest(BaseModel):
    answer: str

# Caminho do arquivo que contém as questões
LESSONS_FILE = Path(__file__).resolve().parent / "data" / "lessons.json"


def load_lessons():
    with open(LESSONS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["lessons"]


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok", "message": "Servico funcionando"}


@app.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int):
    lessons = load_lessons()

    for lesson in lessons:
        if lesson["id"] == lesson_id:
            return {
                "id": lesson["id"],
                "type": lesson["type"],
                "question": lesson["question"],
                "options": lesson["options"]
            }

    raise HTTPException(status_code=404, detail="Lição não encontrada")

@app.post("/lessons/{lesson_id}/validate")
def validate_lesson(lesson_id: int, request: AnswerRequest):
    lessons = load_lessons()

    for lesson in lessons:
        if lesson["id"] == lesson_id:
            is_correct = request.answer == lesson["correct_answer"]

            return {"is_correct": is_correct}

    raise HTTPException(status_code=404, detail="Lição não encontrada")