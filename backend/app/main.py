from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import get_settings


class Message(BaseModel):
    role: str
    content: str


class MentorRequest(BaseModel):
    messages: List[Message]


class MentorResponse(BaseModel):
    reply: str
    next_steps: List[str]


settings = get_settings()

app = FastAPI(title="Mentor Bot API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/mentor", response_model=MentorResponse)
async def mentor_endpoint(payload: MentorRequest) -> MentorResponse:
    last_message = payload.messages[-1].content if payload.messages else ""
    reply = (
        "This is a placeholder response. The last thing you said was: "
        f"'{last_message}'."
    )
    next_steps = [
        "Identify the main stakeholders involved.",
        "Draft a quick summary of the challenge.",
        "Outline one actionable step you can take today.",
    ]
    return MentorResponse(reply=reply, next_steps=next_steps)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
