import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()

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