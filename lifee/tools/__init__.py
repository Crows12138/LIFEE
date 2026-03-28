"""工具系统 — 为角色提供外部能力（搜索、计算等）"""

from .base import ToolDefinition, ToolResult, ToolExecutor
from . import web_search

# 工具注册表
_TOOLS: dict[str, tuple[ToolDefinition, callable]] = {
    web_search.TOOL_NAME: (web_search.DEFINITION, web_search.execute),
}


def get_tool_definitions(tool_names: list[str]) -> list[ToolDefinition]:
    """根据名称列表返回工具定义"""
    defs = []
    for name in tool_names:
        if name in _TOOLS:
            defs.append(_TOOLS[name][0])
    return defs


async def execute_tool(tool_name: str, tool_input: dict) -> str:
    """执行工具并返回结果"""
    if tool_name not in _TOOLS:
        return f"Unknown tool: {tool_name}"
    _, executor = _TOOLS[tool_name]
    return await executor(tool_input)


class DefaultToolExecutor(ToolExecutor):
    """使用注册表的默认执行器"""

    async def execute(self, tool_name: str, tool_input: dict) -> str:
        return await execute_tool(tool_name, tool_input)
