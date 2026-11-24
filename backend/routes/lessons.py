import json
import random
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class AnswerRequest(BaseModel):
    answer: str


# Localiza o arquivo lessons.json
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "lessons.json"


@router.get("/lessons/random")
def get_random_lessons():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    lessons = data["lessons"]

    # Verifica se existem pelo menos 5 questões disponíveis
    if len(lessons) < 5:
        raise HTTPException(
            status_code=400,
            detail="Não existem questões suficientes para iniciar uma partida",
        )

    # Sorteia 5 questões sem repetição
    selected_lessons = random.sample(lessons, 5)

    # Remove as respostas corretas antes de enviar ao frontend
    public_lessons = []

    for lesson in selected_lessons:
        public_lessons.append(
            {
                "id": lesson["id"],
                "type": lesson["type"],
                "question": lesson["question"],
                "options": lesson["options"],
            }
        )

    return {"lessons": public_lessons}


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int):
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Procura a lição pelo ID informado
    for lesson in data["lessons"]:
        if lesson["id"] == lesson_id:
            # Remove a resposta correta antes de retornar
            public_lesson = {
                "id": lesson["id"],
                "type": lesson["type"],
                "question": lesson["question"],
                "options": lesson["options"],
            }
            return public_lesson

    # Caso não encontre a lição
    raise HTTPException(status_code=404, detail="Lição não encontrada")


@router.post("/lessons/{lesson_id}/validate")
def validate_lesson(lesson_id: int, request: AnswerRequest):
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Procura a lição pelo ID informado
    for lesson in data["lessons"]:
        if lesson["id"] == lesson_id:
            # Normaliza a resposta recebida
            answer = request.answer.strip().upper()

            # Verifica se a alternativa existe
            valid_options = [option["id"] for option in lesson["options"]]

            if answer not in valid_options:
                raise HTTPException(status_code=422, detail="Alternativa inválida")

            correct_answer = lesson["correct_answer"]
            correct_option = next(
                option
                for option in lesson["options"]
                if option["id"] == correct_answer
            )
            # Compara com a resposta correta armazenada no backend
            return {
                "is_correct": answer == correct_answer,
                "correct_answer": correct_option["text"],
            }

    # Caso a lição não exista
    raise HTTPException(status_code=404, detail="Lição não encontrada")