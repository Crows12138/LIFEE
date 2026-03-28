"""Web 搜索工具"""

from .base import ToolDefinition


TOOL_NAME = "web_search"

DEFINITION = ToolDefinition(
    name=TOOL_NAME,
    description="Search the web for current information. Use when you need recent data, facts you're unsure about, or information beyond your training data.",
    input_schema={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query",
            },
        },
        "required": ["query"],
    },
)


async def execute(tool_input: dict) -> str:
    """执行 web 搜索"""
    query = tool_input.get("query", "")
    if not query:
        return "Error: empty query"

    try:
        from ddgs import DDGS

        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))

        if not results:
            return f"No results found for: {query}"

        lines = []
        for r in results:
            title = r.get("title", "")
            body = r.get("body", "")
            href = r.get("href", "")
            lines.append(f"**{title}**\n{body}\n{href}")

        return "\n\n".join(lines)

    except ImportError:
        return "Error: duckduckgo-search not installed. Run: pip install duckduckgo-search"
    except Exception as e:
        return f"Search error: {e}"
