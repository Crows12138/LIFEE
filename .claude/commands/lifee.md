# LIFEE 角色咨询

咨询 LIFEE 的 AI/CS 先驱角色（Turing、Shannon、Von Neumann、Lacan 等）。
角色带有完整人格和知识库，基于他们的实际著作。

每次调用必须指定 `--session` 参数来隔离不同场景的对话历史。

## 使用方式

| 用户输入 | 执行命令 |
|---------|---------|
| `/lifee -s emogpt turing 这个架构合理吗？` | `python -m lifee.cli.ask -s emogpt turing "这个架构合理吗？"` |
| `/lifee -s emogpt turing,shannon gate机制怎么改进？` | `python -m lifee.cli.ask -s emogpt turing,shannon "gate机制怎么改进？"` |

## 规则

- **必须传 `--session` 或 `-s` 参数**，用于隔离对话历史
- **首次调用前**，先运行 `python -m lifee.cli.ask --list-sessions` 查看已有 session，选择匹配的继续；没有匹配的才新建
- 单个角色名 → `python -m lifee.cli.ask -s <session> <角色> "<问题>"`
- 多个角色名（逗号分隔）→ `python -m lifee.cli.ask -s <session> <角色1,角色2> "<问题>"`
- 问题用双引号包裹
- 工作目录必须是 LIFEE 项目根目录
- 每个角色大约需要 10-15 秒回答

## 可用角色

- `turing` — 🧮 图灵，计算机科学之父
- `shannon` — 📡 香农，信息论之父
- `vonneumann` — ⚛️ 冯·诺依曼，数学与计算通才
- `lacan` — 拉康，精神分析学家
- 其他角色可通过 `python -m lifee.cli.ask --help` 查看

## 参数说明

`$ARGUMENTS` 格式为 `<-s session> <角色> <问题>`。

解析 `$ARGUMENTS`：
1. 如果包含 `-s` 或 `--session`，提取 session 名称
2. 如果不包含，先运行 `--list-sessions` 查看已有 session，选择或新建
3. 角色名和问题按空格分割
