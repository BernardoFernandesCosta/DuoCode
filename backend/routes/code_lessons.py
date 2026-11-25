import json
import subprocess
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from routes.hearts import ensure_lives_available, consume_life
router = APIRouter()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "code_lessons.json"
EXECUTION_TIMEOUT_SECONDS = 1.5


class CodeSubmission(BaseModel):
    code: str


def _load_code_lessons() -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)
    return data["code_lessons"]

def _add_hearts_to_response(response):
    if not response["is_correct"]:
        response["hearts"] = consume_life()
    else:
        from routes.hearts import get_current_hearts, _get_hearts_response
        response["hearts"] = _get_hearts_response(get_current_hearts())

    return response


def _format_friendly_error(stderr: str) -> str:
    if "SyntaxError" in stderr:
        return (
            "Erro de sintaxe: verifique se esqueceu dois-pontos (:), "
            "parênteses ou aspas."
        )
    if "IndentationError" in stderr:
        return (
            "Erro de indentação: verifique os espaços no início das linhas "
            "do seu código."
        )
    if "NameError" in stderr:
        return (
            "Erro de nome: você usou uma variável ou função que ainda não "
            "foi definida."
        )
    if "TypeError" in stderr:
        return (
            "Erro de tipo: você tentou combinar tipos incompatíveis "
            "(ex.: somar texto com número)."
        )
    if "ZeroDivisionError" in stderr:
        return "Erro matemático: não é possível dividir um número por zero."
    if "ValueError" in stderr:
        return "Erro de valor: o valor informado não pôde ser convertido."

    last_line = stderr.strip().splitlines()[-1] if stderr.strip() else ""
    return f"Erro ao executar o código: {last_line}"


@router.get("/code-lessons")
def list_code_lessons():
    ensure_lives_available()
    lessons = _load_code_lessons()
    return {
        "code_lessons": [
            {
                "id": lesson["id"],
                "type": lesson["type"],
                "title": lesson["title"],
                "question": lesson["question"],
                "starter_code": lesson["starter_code"],
            }
            for lesson in lessons
        ]
    }


@router.get("/code-lessons/{lesson_id}")
def get_code_lesson(lesson_id: int):
    ensure_lives_available()
    for lesson in _load_code_lessons():
        if lesson["id"] == lesson_id:
            return {
                "id": lesson["id"],
                "type": lesson["type"],
                "title": lesson["title"],
                "question": lesson["question"],
                "starter_code": lesson["starter_code"],
            }

    raise HTTPException(status_code=404, detail="Exercício de código não encontrado")


@router.post("/lessons/{lesson_id}/run-code")
def run_code_lesson(lesson_id: int, submission: CodeSubmission):
    ensure_lives_available()
    lesson = next(
        (item for item in _load_code_lessons() if item["id"] == lesson_id),
        None,
    )
    if not lesson:
        raise HTTPException(
            status_code=404, detail="Exercício de código não encontrado"
        )

    if not submission.code.strip():
        return _add_hearts_to_response({
            "is_correct": False,
            "output": "",
            "error": "Digite algum código antes de executar.",
            "passed_tests": 0,
            "total_tests": len(lesson["test_cases"]),
        })

    test_cases = lesson["test_cases"]
    passed_tests = 0
    last_output = ""

    for test_case in test_cases:
        try:
            result = subprocess.run(
                [sys.executable, "-c", submission.code],
                input=test_case["input"],
                capture_output=True,
                text=True,
                timeout=EXECUTION_TIMEOUT_SECONDS,
            )
        except subprocess.TimeoutExpired:
            return  _add_hearts_to_response({
                "is_correct": False,
                "output": "",
                "error": (
                    "Tempo limite excedido (mais de 1.5s). "
                    "Verifique se há um laço infinito no seu código."
                ),
                "passed_tests": passed_tests,
                "total_tests": len(test_cases),
            })

        if result.returncode != 0:
            return  _add_hearts_to_response({
                "is_correct": False,
                "output": result.stdout.strip(),
                "error": _format_friendly_error(result.stderr),
                "passed_tests": passed_tests,
                "total_tests": len(test_cases),
            })

        actual_output = result.stdout.strip()
        last_output = actual_output

        if actual_output == test_case["expected_output"].strip():
            passed_tests += 1

    is_correct = passed_tests == len(test_cases)
    error_message = (
        None
        if is_correct
        else (
            f"Seu código rodou, mas passou em {passed_tests} de "
            f"{len(test_cases)} testes. Revise a lógica e tente novamente."
        )
    )

    return  _add_hearts_to_response({
        "is_correct": is_correct,
        "output": last_output,
        "error": error_message,
        "passed_tests": passed_tests,
        "total_tests": len(test_cases),
    })