"""命令行工具 — 让 Claude Code 通过 Bash 调用 LIFEE 角色"""

import asyncio
import sys
from pathlib import Path

# 确保 lifee 包可导入
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


async def ask(role: str, question: str):
    """问单个角色"""
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env")

    import os
    from lifee.cli.app import create_provider
    from lifee.roles import RoleManager
    from lifee.debate.participant import Participant
    from lifee.debate.moderator import Moderator
    from lifee.sessions import Session, DebateSessionStore

    rm = RoleManager()
    provider = create_provider()
    available = rm.list_roles()

    matched = next((a for a in available if a.lower() == role.lower()), None)
    if not matched:
        print(f"角色 '{role}' 不存在。可用: {', '.join(available)}", file=sys.stderr)
        sys.exit(1)

    # 加载当前 session 上下文（最近 20 条）
    store = DebateSessionStore()
    data = store.load()
    if data:
        session = store.restore_session(data)
        if len(session.history) > 20:
            session.history = session.history[-20:]
    else:
        session = Session()

    # 创建参与者
    google_key = os.getenv("GOOGLE_API_KEY")
    km = await rm.get_knowledge_manager(matched, google_api_key=google_key) if google_key else None
    participant = Participant(matched, provider, rm, knowledge_manager=km)

    # 运行
    moderator = Moderator([participant], session)
    async for p, chunk, is_skip in moderator.run(question, max_turns=1):
        if not is_skip and chunk:
            sys.stdout.write(chunk)
            sys.stdout.flush()
    print()


async def consult(roles: list[str], question: str):
    """多角色讨论"""
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env")

    import os
    from lifee.cli.app import create_provider
    from lifee.roles import RoleManager
    from lifee.debate.participant import Participant
    from lifee.debate.moderator import Moderator
    from lifee.debate import moderator as mod_module
    from lifee.sessions import Session, DebateSessionStore

    rm = RoleManager()
    provider = create_provider()
    available = rm.list_roles()

    # 验证角色
    valid_roles = []
    for r in roles:
        matched = next((a for a in available if a.lower() == r.lower()), None)
        if matched:
            valid_roles.append(matched)
    if not valid_roles:
        print(f"没有有效角色。可用: {', '.join(available)}", file=sys.stderr)
        sys.exit(1)

    # 加载当前 session
    store = DebateSessionStore()
    data = store.load()
    if data:
        session = store.restore_session(data)
        if len(session.history) > 20:
            session.history = session.history[-20:]
    else:
        session = Session()

    # 创建参与者
    participants = []
    for role_name in valid_roles:
        google_key = os.getenv("GOOGLE_API_KEY")
        km = await rm.get_knowledge_manager(role_name, google_api_key=google_key) if google_key else None
        p = Participant(role_name, provider, rm, knowledge_manager=km)
        participants.append(p)

    # 去掉角色间延迟
    original_delay = mod_module.SPEAKER_DELAY
    mod_module.SPEAKER_DELAY = 0.0

    try:
        moderator = Moderator(participants, session)
        current_name = ""
        async for participant, chunk, is_skip in moderator.run(question, max_turns=len(participants)):
            if is_skip:
                continue
            if participant.info.display_name != current_name:
                if current_name:
                    print("\n")
                current_name = participant.info.display_name
                sys.stdout.write(f"**{current_name}:**\n")
            sys.stdout.write(chunk)
            sys.stdout.flush()
        print()
    finally:
        mod_module.SPEAKER_DELAY = original_delay


def main():
    if len(sys.argv) < 3:
        print("用法:")
        print("  python -m lifee.cli.ask <角色> <问题>")
        print("  python -m lifee.cli.ask --consult <角色1,角色2,...> <问题>")
        print()
        print("示例:")
        print("  python -m lifee.cli.ask turing \"什么是图灵机？\"")
        print("  python -m lifee.cli.ask --consult turing,shannon \"信息和计算的关系？\"")
        sys.exit(1)

    if sys.argv[1] == "--consult":
        if len(sys.argv) < 4:
            print("用法: python -m lifee.cli.ask --consult <角色1,角色2,...> <问题>", file=sys.stderr)
            sys.exit(1)
        roles = sys.argv[2].split(",")
        question = sys.argv[3]
        asyncio.run(consult(roles, question))
    else:
        role = sys.argv[1]
        question = sys.argv[2]
        asyncio.run(ask(role, question))


if __name__ == "__main__":
    main()
