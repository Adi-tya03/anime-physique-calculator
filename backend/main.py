from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, characters, calculator, roadmap


app = FastAPI(
    title="Anime Physique Calculator API"
)


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://anime-physique-calculator.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers

app.include_router(auth.router)

app.include_router(characters.router)

app.include_router(calculator.router)

app.include_router(roadmap.router)


@app.get("/")

def root():

    return {

        "message":

        "Anime Physique Calculator API is running"

    }