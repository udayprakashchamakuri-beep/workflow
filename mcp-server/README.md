# Hackathon MCP Server

This is a tiny local MCP server for the `Hackathon` workspace.

Tools exposed:
- `write_handoff`
- `read_handoff`
- `list_stage_files`
- `get_project_state`

How it works:
- It runs over stdio
- It only allows file access inside the Hackathon workspace
- Relative handoff file names are resolved under `handoffs/`

Server entrypoint:
- `mcp-server/hackathon-mcp.js`

Antigravity setup:
- `.vscode/mcp.json` points to this script with `node`

Notes:
- The server is intentionally small and local-first.
- It is meant for artifact handoff, not broad filesystem control.

Example tool usage:
- `write_handoff`
  - file: `antigravity_to_codex.md`
  - content: short handoff summary
- `read_handoff`
  - file: `antigravity_to_codex.md`
- `list_stage_files`
  - stage: `05_ui_flow`
- `get_project_state`
  - no arguments

Validation:
- Run `node .\mcp-server\test-client.js` to perform a local handshake and tool check.
