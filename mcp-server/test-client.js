#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const serverPath = path.join(__dirname, "hackathon-mcp.js");

const child = spawn(process.execPath, [serverPath], {
  cwd: workspaceRoot,
  env: {
    ...process.env,
    PROJECT_ROOT: workspaceRoot
  },
  stdio: ["pipe", "pipe", "inherit"]
});

let buffer = Buffer.alloc(0);
let nextLength = null;
let currentStep = 0;

const requests = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "hackathon-mcp-test",
        version: "0.1.0"
      }
    }
  },
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  },
  {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "get_project_state",
      arguments: {}
    }
  },
  {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "write_handoff",
      arguments: {
        file: "mcp_test.md",
        content: "# MCP Test\n\nThis file was created by the local test client.\n"
      }
    }
  },
  {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "read_handoff",
      arguments: {
        file: "mcp_test.md"
      }
    }
  },
  {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "list_stage_files",
      arguments: {
        stage: "handoffs",
        recursive: false
      }
    }
  }
];

function send(message) {
  const payload = Buffer.from(JSON.stringify(message), "utf8");
  child.stdin.write(`Content-Length: ${payload.length}\r\n\r\n`);
  child.stdin.write(payload);
}

function processBuffer() {
  while (true) {
    if (nextLength === null) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      const headerText = buffer.subarray(0, headerEnd).toString("utf8");
      const contentLengthHeader = headerText
        .split("\r\n")
        .find((header) => header.toLowerCase().startsWith("content-length:"));

      nextLength = Number(contentLengthHeader.split(":")[1].trim());
      buffer = buffer.subarray(headerEnd + 4);
    }

    if (buffer.length < nextLength) {
      return;
    }

    const body = buffer.subarray(0, nextLength).toString("utf8");
    buffer = buffer.subarray(nextLength);
    nextLength = null;

    const message = JSON.parse(body);
    console.log(JSON.stringify(message, null, 2));

    currentStep += 1;
    if (currentStep < requests.length) {
      send(requests[currentStep]);
      return;
    }

    child.stdin.end();
    return;
  }
}

child.stdout.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  processBuffer();
});

send(requests[0]);
