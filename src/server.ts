import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getCodeExamplesTool } from './tools/code-examples-tool';
import { getFusionKitOverviewTool } from './tools/fusionkit-overview-tool';
import { getFusionKitPackagesTool } from './tools/fusionkit-packages-tool';
import { getMigrationGuideTool } from './tools/migration-guide-tool';
import { getPackageDocumentationTool } from './tools/package-documentation-tool';
import { createCopilotTool } from './tools/copilot-cli-tool';
import { createShellTool } from './tools/shell-cli-tool';
import { registerMainDocsResource } from './resources/maindocs-resource';

// create the MCP server
const server = new McpServer({
  name: 'Documentation Scraper',
  version: '1.0.0',
});

// register the tools to MCP
server.registerTool(
  getFusionKitOverviewTool.name,
  {
    description: getFusionKitOverviewTool.description,
    inputSchema: getFusionKitOverviewTool.inputSchema,
  },
  getFusionKitOverviewTool.execute,
);

server.registerTool(
  getFusionKitPackagesTool.name,
  {
    description: getFusionKitPackagesTool.description,
    inputSchema: getFusionKitPackagesTool.inputSchema,
  },
  getFusionKitPackagesTool.execute,
);

server.registerTool(
  getMigrationGuideTool.name,
  {
    description: getMigrationGuideTool.description,
    inputSchema: getMigrationGuideTool.inputSchema,
  },
  getMigrationGuideTool.execute,
);

server.registerTool(
  getPackageDocumentationTool.name,
  {
    description: getPackageDocumentationTool.description,
    inputSchema: getPackageDocumentationTool.inputSchema,
  },
  getPackageDocumentationTool.execute,
);

server.registerTool(
  getCodeExamplesTool.name,
  {
    description: getCodeExamplesTool.description,
    inputSchema: getCodeExamplesTool.inputSchema,
  },
  getCodeExamplesTool.execute,
);

server.registerTool(
  createCopilotTool.name,
  {
    description: createCopilotTool.description,
    inputSchema: createCopilotTool.inputSchema,
  },
  createCopilotTool.execute,
);

server.registerTool(
  createShellTool.name,
  {
    description: createShellTool.description,
    inputSchema: createShellTool.inputSchema,
  },
  createShellTool.execute,
);

// wrap everything inside an async init to avoid top-level await
const init = async () => {
  // set transport

  // register the main docs resource
  await registerMainDocsResource(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

// call the initialization
init();
