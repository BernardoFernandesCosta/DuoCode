from fastapi import FastAPI
from routes.lessons import router as lessons_router

app = FastAPI()

app.include_router(lessons_router)


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok", "message": "Servico funcionando"}
