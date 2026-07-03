from fastapi import FastAPI

app = FastAPI(title="Cartographer Extraction Service")


@app.get("/health")
def health():
    return {"status": "ok"}
