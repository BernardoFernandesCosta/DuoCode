from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.code_lessons import router as code_lessons_router
from routes.lessons import router as lessons_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lessons_router)
app.include_router(code_lessons_router)


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok", "message": "Servico funcionando"}