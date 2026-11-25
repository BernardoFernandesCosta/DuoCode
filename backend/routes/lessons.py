import json
import random
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from routes.hearts import (
    consume_life,
    get_current_hearts,
    _get_hearts_response,
    ensure_lives_available,
    restore_life_after_review,
)
router = APIRouter()


class AnswerRequest(BaseModel):
    lesson_id: int
    answer: str

class ReviewAnswerRequest(BaseModel):
    session_id: str
    lesson_id: int
    answer: str

# Localiza o arquivo lessons.json
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "lessons.json"
REVIEW_SESSIONS = {}


@router.get("/lessons/random")
def get_random_lessons():
    ensure_lives_available()
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

@router.get("/lessons/review")
def get_review_lessons():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    lessons = data["lessons"]

    if len(lessons) < 3:
        raise HTTPException(
            status_code=400,
            detail="Não existem questões suficientes para revisão",
        )

    selected_lessons = random.sample(lessons, 3)

    session_id = str(random.randint(100000, 999999))

    REVIEW_SESSIONS[session_id] = {
        "lesson_ids": [lesson["id"] for lesson in selected_lessons],
        "answered": [],
        "completed": False,
    }

    public_lessons = []

    for lesson in selected_lessons:
        public_lessons.append({
            "id": lesson["id"],
            "type": lesson["type"],
            "question": lesson["question"],
            "options": lesson["options"],
        })

    return {
        "session_id": session_id,
        "lessons": public_lessons,
    }

@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int):
    ensure_lives_available()
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


@router.post("/lessons/review/validate")
def validate_review(request: ReviewAnswerRequest):
    session = REVIEW_SESSIONS.get(request.session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão de revisão não encontrada",
        )

    if session["completed"]:
        raise HTTPException(
            status_code=400,
            detail="Esta revisão já foi concluída",
        )

    if request.lesson_id not in session["lesson_ids"]:
        raise HTTPException(
            status_code=403,
            detail="Esta questão não pertence à sessão de revisão",
        )

    if request.lesson_id in session["answered"]:
        raise HTTPException(
            status_code=400,
            detail="Esta questão já foi respondida corretamente",
        )

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    lesson = next(
        (item for item in data["lessons"] if item["id"] == request.lesson_id),
        None,
    )

    if not lesson:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    answer = request.answer.strip().upper()
    valid_options = [option["id"] for option in lesson["options"]]

    if answer not in valid_options:
        raise HTTPException(status_code=422, detail="Alternativa inválida")

    is_correct = answer == lesson["correct_answer"]

    if is_correct:
        session["answered"].append(request.lesson_id)

    if len(session["answered"]) == 3:
        session["completed"] = True

    return {
        "is_correct": is_correct,
        "lesson_id": lesson["id"],
        "answered_count": len(session["answered"]),
        "completed": session["completed"],
    }

@router.post("/lessons/review/complete")
def finish_review(session_id: str):
    session = REVIEW_SESSIONS.get(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão de revisão não encontrada",
        )

    if not session["completed"]:
        raise HTTPException(
            status_code=400,
            detail="Você precisa responder corretamente às três questões",
        )

    if session.get("rewarded", False):
        raise HTTPException(
            status_code=409,
            detail="Esta revisão já concedeu uma vida",
        )

    hearts = restore_life_after_review()

    session["rewarded"] = True

    return {
        "message": "Revisão concluída! Você recuperou uma vida.",
        "hearts": hearts,
    }


@router.post("/lessons/{lesson_id}/validate")
def validate_lesson(lesson_id: int, request: AnswerRequest):
    ensure_lives_available()
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

            is_correct = answer == correct_answer

            if not is_correct:
                hearts = consume_life()
            else:
                hearts = _get_hearts_response(get_current_hearts())

            return {
                "is_correct": is_correct,
                "correct_answer": correct_option["text"],
                "hearts": hearts,
            }

    # Caso a lição não exista
    raise HTTPException(status_code=404, detail="Lição não encontrada")