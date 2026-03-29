"""LIFEE API — FastAPI wrapper for the CLI debate engine

Exposes the same interface as the Cloudflare Worker so the existing
frontend can connect directly.
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LIFEE API")

# CORS — allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PersonaInput(BaseModel):
    id: str
    name: str
    knowledge: str = ""


class DecisionRequest(BaseModel):
    situation: str = ""
    userInput: str = ""
    personas: list[PersonaInput] = []
    context: str = ""


def _get_provider():
    from lifee.cli.app import create_provider
    return create_provider()


def _match_role(persona_id: str, persona_name: str) -> Optional[str]:
    """将前端的 persona id/name 映射到 CLI 的 role name"""
    from lifee.roles import RoleManager
    rm = RoleManager()
    available = rm.list_roles()

    # 直接匹配 role 目录名
    for role in available:
        if persona_id.lower() == role.lower() or persona_name.lower() == role.lower():
            return role

    # 模糊匹配（display name）
    for role in available:
        info = rm.get_role_info(role)
        display = info.get("display_name", "").lower()
        if persona_name.lower() in display or display in persona_name.lower():
            return role

    return None


@app.get("/")
async def root():
    return {"status": "ok", "service": "LIFEE API"}


@app.post("/decision")
async def decision(req: DecisionRequest, request: Request):
    """处理辩论请求 — 兼容前端的 /decision 接口"""
    from lifee.roles import RoleManager
    from lifee.debate.participant import Participant
    from lifee.debate.moderator import Moderator
    from lifee.debate import moderator as mod_module
    from lifee.sessions import Session

    # 检查是否请求 SSE 流式
    stream = request.query_params.get("stream") == "1"

    rm = RoleManager()
    provider = _get_provider()

    # 构建问题
    question = req.userInput or req.situation or ""
    if req.context:
        question = f"{question}\n\nContext:\n{req.context}"

    # 映射角色
    participants = []
    google_key = os.getenv("GOOGLE_API_KEY")
    for persona in req.personas:
        role_name = _match_role(persona.id, persona.name)
        if not role_name:
            continue
        km = None
        if google_key:
            try:
                km = await rm.get_knowledge_manager(role_name, google_api_key=google_key)
            except Exception:
                pass
        p = Participant(role_name, provider, rm, knowledge_manager=km)
        participants.append((persona.id, p))

    if not participants:
        return {"messages": [{"personaId": "system", "text": "No matching roles found."}], "options": []}

    # 去掉角色间延迟
    original_delay = mod_module.SPEAKER_DELAY
    mod_module.SPEAKER_DELAY = 0.5  # API 模式保留短延迟避免 rate limit

    try:
        session = Session()
        all_participants = [p for _, p in participants]
        moderator = Moderator(all_participants, session)

        if stream:
            return StreamingResponse(
                _stream_sse(moderator, participants, question),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )
        else:
            # 非流式：收集所有回复后返回 JSON
            messages = []
            current_pid = ""
            current_text = ""

            async for participant, chunk, is_skip in moderator.run(question, max_turns=len(all_participants)):
                if is_skip:
                    continue
                pid = _find_persona_id(participant, participants)
                if pid != current_pid:
                    if current_text:
                        messages.append({"personaId": current_pid, "text": current_text.strip()})
                    current_pid = pid
                    current_text = chunk
                else:
                    current_text += chunk

            if current_text:
                messages.append({"personaId": current_pid, "text": current_text.strip()})

            return {"messages": messages, "options": []}

    finally:
        mod_module.SPEAKER_DELAY = original_delay


def _find_persona_id(participant, participants_map):
    """从 participant 找到对应的前端 persona id"""
    for pid, p in participants_map:
        if p is participant:
            return pid
    return "unknown"


async def _stream_sse(moderator, participants, question):
    """生成 SSE 事件流"""
    all_participants = [p for _, p in participants]
    current_pid = ""
    current_text = ""

    async for participant, chunk, is_skip in moderator.run(question, max_turns=len(all_participants)):
        if is_skip:
            continue
        pid = _find_persona_id(participant, participants)
        if pid != current_pid:
            if current_text:
                msg = {"personaId": current_pid, "text": current_text.strip()}
                yield f"event: message\ndata: {json.dumps(msg, ensure_ascii=False)}\n\n"
            current_pid = pid
            current_text = chunk
        else:
            current_text += chunk

    if current_text:
        msg = {"personaId": current_pid, "text": current_text.strip()}
        yield f"event: message\ndata: {json.dumps(msg, ensure_ascii=False)}\n\n"

    yield f"event: options\ndata: {json.dumps({'options': []})}\n\n"
    yield f"event: done\ndata: {{}}\n\n"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
