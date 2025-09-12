import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerFusionKitOverviewTool } from './tools/fusionkit-overview-tool';
import { registerFusionKitPackagesTool } from './tools/fusionkit-packages-tool';
import { registerPackageDocumentationTool } from './tools/package-documentation-tool';
import { registerCodeExamplesTool } from './tools/code-examples-tool';
import { registerMigrationGuideTool } from './tools/migration-guide-tool';


// create the MCP server
const server = new McpServer({
  name: "Documentation Scraper",
  version: '1.0.0',
});

// register the tools to MCP
registerFusionKitOverviewTool(server);
registerFusionKitPackagesTool(server);
registerPackageDocumentationTool(server);
registerCodeExamplesTool(server);
registerMigrationGuideTool(server);


// wrap everything inside an async init to avoid top-level await
const init = async () => {
  // set transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

// call the initialization
init();
