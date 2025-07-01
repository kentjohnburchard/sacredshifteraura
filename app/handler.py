# app/handler.py

from model_loader import load_model
from fastapi import FastAPI
from pydantic import BaseModel

model = load_model()

app = FastAPI()

class Input(BaseModel):
    prompt: str

@app.post("/run")
def run(input: Input):
    response = model.generate(input.prompt)
    return {"output": response}
