from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is protected behind Nginx!"}