#!/usr/bin/env node
// Minimal local stdio MCP server exposing one tool: list_overdue_tasks.
//
// This file is provided as a working skeleton (per the Block 1 timing
// mitigation) — you should not need to write MCP protocol boilerplate from
// scratch. Your Block 1 lab exercise is to *register and connect* this
// server via a `.mcp.json` you write yourself, then measure its context
// cost. It is not pre-wired into `.mcp.json` for you.
//
// Requires `npm run build` to have run first — it reads from
// `dist/services/taskService.js`, not from `src/`.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taskServicePath = path.join(__dirname, '..', 'dist', 'services', 'taskService.js');

const server = new Server(
  { name: 'taskflow-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_overdue_tasks',
      description: 'List all TaskFlow tasks that are currently overdue (not done, past their due date).',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'list_overdue_tasks') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const taskService = await import(`file://${taskServicePath.replace(/\\/g, '/')}`);
  const overdue = taskService.overdueTasks();
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(overdue, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
