#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(process.env.PROJECT_ROOT || process.cwd());
const handoffsDir = path.join(workspaceRoot, "handoffs");
const stageDirectoryPattern = /^(00_intake|01_prd|02_pitch|03_research_qa|04_build_plan|05_ui_flow|06_build|07_review|08_release|approvals|handoffs|prompts)$/;

let buffer = Buffer.alloc(0);
let nextMessageLength = null;
let initialized = false;

function sendMessage(message) {
  const json = JSON.stringify(message);
  const payload = Buffer.from(json, "utf8");
  process.stdout.write(`Content-Length: ${payload.length}\r\n\r\n`);
  process.stdout.write(payload);
}

function sendResult(id, result) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    result
  });
}

function sendError(id, code, message, data) {
  sendMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data
    }
  });
}

function asToolText(label, value) {
  return {
    content: [
      {
        type: "text",
        text: `${label}\n${value}`
      }
    ]
  };
}

function ensureInsideWorkspace(targetPath) {
  const resolved = path.resolve(targetPath);
  const relativePath = path.relative(workspaceRoot, resolved);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Path must stay inside the Hackathon workspace.");
  }
  return resolved;
}

function resolveHandoffPath(file) {
  if (!file || typeof file !== "string") {
    throw new Error("`file` is required.");
  }
  const handoffPath = path.isAbsolute(file)
    ? file
    : path.join(handoffsDir, file);
  return ensureInsideWorkspace(handoffPath);
}

function resolveStagePath(stage) {
  if (!stage || typeof stage !== "string") {
    throw new Error("`stage` is required.");
  }
  if (!stageDirectoryPattern.test(stage)) {
    throw new Error("Unknown stage directory.");
  }
  return ensureInsideWorkspace(path.join(workspaceRoot, stage));
}

function listFilesRecursively(directoryPath) {
  const results = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(workspaceRoot, fullPath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      results.push(`${relativePath}/`);
      results.push(...listFilesRecursively(fullPath));
      continue;
    }
    const size = fs.statSync(fullPath).size;
    results.push(`${relativePath} (${size} bytes)`);
  }
  return results;
}

function handleWriteHandoff(argumentsObject) {
  const filePath = resolveHandoffPath(argumentsObject.file);
  const content = typeof argumentsObject.content === "string" ? argumentsObject.content : "";
  const append = Boolean(argumentsObject.append);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (append) {
    fs.appendFileSync(filePath, content, "utf8");
  } else {
    fs.writeFileSync(filePath, content, "utf8");
  }

  return asToolText(
    "Handoff written successfully.",
    path.relative(workspaceRoot, filePath).replaceAll("\\", "/")
  );
}

function handleReadHandoff(argumentsObject) {
  const filePath = resolveHandoffPath(argumentsObject.file);
  if (!fs.existsSync(filePath)) {
    throw new Error("Handoff file not found.");
  }
  const content = fs.readFileSync(filePath, "utf8");
  return asToolText(
    `Contents of ${path.relative(workspaceRoot, filePath).replaceAll("\\", "/")}:`,
    content
  );
}

function handleListStageFiles(argumentsObject) {
  const stagePath = resolveStagePath(argumentsObject.stage);
  const recursive = argumentsObject.recursive !== false;

  if (!fs.existsSync(stagePath)) {
    throw new Error("Stage path does not exist.");
  }

  let lines = [];
  if (recursive) {
    lines = listFilesRecursively(stagePath);
  } else {
    const entries = fs.readdirSync(stagePath, { withFileTypes: true });
    lines = entries.map((entry) => {
      const fullPath = path.join(stagePath, entry.name);
      const relativePath = path.relative(workspaceRoot, fullPath).replaceAll("\\", "/");
      return entry.isDirectory() ? `${relativePath}/` : `${relativePath} (${fs.statSync(fullPath).size} bytes)`;
    });
  }

  return asToolText(
    `Files in ${path.relative(workspaceRoot, stagePath).replaceAll("\\", "/")}:`,
    lines.length > 0 ? lines.join("\n") : "(empty)"
  );
}

function handleGetProjectState() {
  const statePath = ensureInsideWorkspace(path.join(workspaceRoot, "project_state.md"));
  const content = fs.existsSync(statePath) ? fs.readFileSync(statePath, "utf8") : "(missing)";
  return asToolText("Project state:", content);
}

function handleToolCall(name, argumentsObject = {}) {
  switch (name) {
    case "write_handoff":
      return handleWriteHandoff(argumentsObject);
    case "read_handoff":
      return handleReadHandoff(argumentsObject);
    case "list_stage_files":
      return handleListStageFiles(argumentsObject);
    case "get_project_state":
      return handleGetProjectState();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function getTools() {
  return [
    {
      name: "write_handoff",
      description: "Write or append a handoff file inside the Hackathon handoffs directory.",
      inputSchema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "File name or workspace-relative path for the handoff file. Relative names are written under handoffs/."
          },
          content: {
            type: "string",
            description: "Text content to write."
          },
          append: {
            type: "boolean",
            description: "When true, append instead of overwrite."
          }
        },
        required: ["file", "content"],
        additionalProperties: false
      }
    },
    {
      name: "read_handoff",
      description: "Read a handoff file from the Hackathon handoffs directory.",
      inputSchema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "File name or workspace-relative path to read. Relative names are resolved under handoffs/."
          }
        },
        required: ["file"],
        additionalProperties: false
      }
    },
    {
      name: "list_stage_files",
      description: "List files in one Hackathon stage directory.",
      inputSchema: {
        type: "object",
        properties: {
          stage: {
            type: "string",
            description: "One of the top-level workflow directories, such as 01_prd or 05_ui_flow."
          },
          recursive: {
            type: "boolean",
            description: "When true, include nested files and directories."
          }
        },
        required: ["stage"],
        additionalProperties: false
      }
    },
    {
      name: "get_project_state",
      description: "Read the project_state.md file for the Hackathon workspace.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  ];
}

function handleRequest(message) {
  const { id, method, params } = message;

  try {
    if (method === "initialize") {
      initialized = true;
      sendResult(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "hackathon-mcp",
          version: "0.1.0"
        }
      });
      return;
    }

    if (!initialized) {
      sendError(id, -32002, "Server not initialized.");
      return;
    }

    if (method === "tools/list") {
      sendResult(id, { tools: getTools() });
      return;
    }

    if (method === "tools/call") {
      const toolName = params && params.name;
      const toolArgs = params && params.arguments ? params.arguments : {};
      const result = handleToolCall(toolName, toolArgs);
      sendResult(id, result);
      return;
    }

    if (id !== undefined && id !== null) {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (error) {
    if (id !== undefined && id !== null) {
      sendError(id, -32000, error.message);
    }
  }
}

function processBuffer() {
  while (true) {
    if (nextMessageLength === null) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      const headerText = buffer.subarray(0, headerEnd).toString("utf8");
      const headers = headerText.split("\r\n");
      const contentLengthHeader = headers.find((header) => header.toLowerCase().startsWith("content-length:"));

      if (!contentLengthHeader) {
        buffer = buffer.subarray(headerEnd + 4);
        continue;
      }

      nextMessageLength = Number(contentLengthHeader.split(":")[1].trim());
      buffer = buffer.subarray(headerEnd + 4);
    }

    if (buffer.length < nextMessageLength) {
      return;
    }

    const body = buffer.subarray(0, nextMessageLength).toString("utf8");
    buffer = buffer.subarray(nextMessageLength);
    nextMessageLength = null;

    if (body.trim().length === 0) {
      continue;
    }

    let message;
    try {
      message = JSON.parse(body);
    } catch {
      continue;
    }

    if (message && typeof message.method === "string") {
      handleRequest(message);
    }
  }
}

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  processBuffer();
});

process.stdin.on("end", () => {
  process.exit(0);
});

