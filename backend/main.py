from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, characters, calculator, roadmap

from database import Base, engine
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Anime Physique Calculator API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://anime-physique-calculator.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(calculator.router)
app.include_router(roadmap.router)

@app.get("/")
def root():
    return {"message": "Anime Physique Calculator API is running"}