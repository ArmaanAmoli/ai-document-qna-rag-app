from fastapi import FastAPI
import torch
import uvicorn
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel

app = FastAPI()
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer('all-MiniLM-L6-v2' , device=device)
print("Model ready")

class EmbedRequest(BaseModel):
    texts:list[str]

@app.post("/embed")
def embed(req:EmbedRequest):
    print("Embedder Started")
    embeddings = model.encode(
        req.texts,
        normalize_embeddings=True,
        device=device
    )
    return {"embeddings": embeddings.tolist()}
    
if __name__ == '__main__':
    print(f"Server started: http:/localhost:8001")
    uvicorn.run("main:app", host="127.0.0.1" , port=8001 , reload=True)
    