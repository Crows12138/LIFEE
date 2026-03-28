"""Tool 抽象定义"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ToolDefinition:
    """发送给 LLM 的工具定义"""

    name: str
    description: str
    input_schema: dict  # JSON Schema


@dataclass
class ToolResult:
    """工具执行结果"""

    tool_use_id: str
    content: str
    is_error: bool = False


class ToolExecutor(ABC):
    """工具执行器基类"""

    @abstractmethod
    async def execute(self, tool_name: str, tool_input: dict) -> str:
        """执行工具，返回文本结果"""
        ...
