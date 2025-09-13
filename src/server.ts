import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getFusionKitOverviewTool } from './tools/fusionkit-overview-tool';
import { getFusionKitPackagesTool } from './tools/fusionkit-packages-tool';
import { getPackageDocumentationTool } from './tools/package-documentation-tool';
import { getCodeExamplesTool } from './tools/code-examples-tool';
import { getMigrationGuideTool } from './tools/migration-guide-tool';


// create the MCP server
const server = new McpServer({
  name: "Documentation Scraper",
  version: '1.0.0',
});

// register the tools to MCP
server.tool(
  getFusionKitOverviewTool.name,
  getFusionKitOverviewTool.description,
  getFusionKitOverviewTool.inputSchema ?? {},
  getFusionKitOverviewTool.execute
);
server.tool(
  getFusionKitPackagesTool.name,
  getFusionKitPackagesTool.description,
  getFusionKitPackagesTool.inputSchema ?? {},
  getFusionKitPackagesTool.execute
);
server.tool(
  getPackageDocumentationTool.name,
  getPackageDocumentationTool.description,
  getPackageDocumentationTool.inputSchema ?? {},
  getPackageDocumentationTool.execute
);
server.tool(
  getCodeExamplesTool.name,
  getCodeExamplesTool.description,
  getCodeExamplesTool.inputSchema ?? {},
  getCodeExamplesTool.execute
);
server.tool(
  getMigrationGuideTool.name,
  getMigrationGuideTool.description,
  getMigrationGuideTool.inputSchema ?? {},
  getMigrationGuideTool.execute
);


// wrap everything inside an async init to avoid top-level await
const init = async () => {
  // set transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

// call the initialization
init();
