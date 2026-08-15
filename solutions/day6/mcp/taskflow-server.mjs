#!/usr/bin/env node
// Minimal local stdio MCP server exposing one tool: list_overdue_tasks.
// Requires `npm run build` to have run first (reads from dist/).
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
