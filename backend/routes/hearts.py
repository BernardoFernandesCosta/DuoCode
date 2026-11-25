import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "hearts_state.json"
)

MAX_LIVES = 5
REGENERATION_MINUTES = 30


def _load_state():
    if not DATA_FILE.exists():
        state = {
            "lives": MAX_LIVES,
            "next_regeneration_at": None,
        }
        _save_state(state)
        return state

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            state = json.load(file)

        if not isinstance(state, dict):
            raise ValueError("Estado de vidas inválido.")

        if "lives" not in state or "next_regeneration_at" not in state:
            raise ValueError("Dados de vidas incompletos.")

        return state

    except (json.JSONDecodeError, ValueError):
        state = {
            "lives": MAX_LIVES,
            "next_regeneration_at": None,
        }
        _save_state(state)
        return state


def _save_state(state):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)


def _update_regeneration(state):
    now = datetime.now(timezone.utc)
    next_regeneration = state["next_regeneration_at"]

    if next_regeneration is None:
        return state

    next_time = datetime.fromisoformat(next_regeneration)

    while state["lives"] < MAX_LIVES and now >= next_time:
        state["lives"] += 1
        next_time += timedelta(minutes=REGENERATION_MINUTES)

    if state["lives"] >= MAX_LIVES:
        state["next_regeneration_at"] = None
    else:
        state["next_regeneration_at"] = next_time.isoformat()

    return state


def _get_hearts_response(state):
    now = datetime.now(timezone.utc)
    next_time = state["next_regeneration_at"]

    seconds_remaining = 0

    if next_time is not None:
        next_time = datetime.fromisoformat(next_time)
        seconds_remaining = max(0, int((next_time - now).total_seconds()))

    return {
        "lives": state["lives"],
        "max_lives": MAX_LIVES,
        "is_blocked": state["lives"] == 0,
        "next_regeneration_at": state["next_regeneration_at"],
        "next_regeneration_seconds": seconds_remaining,
    }


def get_current_hearts():
    state = _load_state()
    state = _update_regeneration(state)
    _save_state(state)
    return state

def ensure_lives_available():
    state = get_current_hearts()

    if state["lives"] <= 0:
        raise HTTPException(
            status_code=403,
            detail="Você está sem vidas. Aguarde a regeneração.",
        )

    return state

def consume_life():
    state = get_current_hearts()

    if state["lives"] <= 0:
        raise HTTPException(
            status_code=403,
            detail="Você está sem vidas. Aguarde a regeneração.",
        )

    state["lives"] -= 1

    if state["next_regeneration_at"] is None:
        next_time = datetime.now(timezone.utc) + timedelta(
            minutes=REGENERATION_MINUTES
        )
        state["next_regeneration_at"] = next_time.isoformat()

    _save_state(state)

    return _get_hearts_response(state)


@router.get("/hearts")
def get_hearts():
    state = get_current_hearts()
    return _get_hearts_response(state)


@router.post("/hearts/lose")
def lose_heart():
    return consume_life()



def restore_life_after_review():
    state = get_current_hearts()

    if state["lives"] < MAX_LIVES:
        state["lives"] += 1

    if state["lives"] >= MAX_LIVES:
        state["lives"] = MAX_LIVES
        state["next_regeneration_at"] = None

    _save_state(state)

    return _get_hearts_response(state)
