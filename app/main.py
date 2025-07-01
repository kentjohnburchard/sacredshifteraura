from fastapi import FastAPI
from pydantic import BaseModel
from model_loader import load_model

app = FastAPI()
model, tokenizer = load_model()          # lazy-load your HF model

class GenRequest(BaseModel):
    prompt: str
    max_tokens: int = 128
    temperature: float = 0.7

@app.post("/generate")
async def generate(req: GenRequest):
    inputs = tokenizer(req.prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        max_new_tokens=req.max_tokens,
        temperature=req.temperature
    )
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"completion": text}
