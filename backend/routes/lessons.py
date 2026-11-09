import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class AnswerRequest(BaseModel):
    answer: str

# Localiza o arquivo lessons.json
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "lessons.json"


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
                "options": lesson["options"]
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
                raise HTTPException(
                    status_code=422,
                    detail="Alternativa inválida"
                )

            # Compara com a resposta correta armazenada no backend
            return {
                "is_correct": answer == lesson["correct_answer"]
            }

    # Caso a lição não exista
    raise HTTPException(status_code=404, detail="Lição não encontrada")