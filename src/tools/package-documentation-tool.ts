import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createResponse, createError } from '../helper/utils';
import { getPackageDocumentation } from './documentationTools';
import { GetPackageDocumentationParams } from '../interfaces/tool-params';

export const registerPackageDocumentationTool = (server: McpServer) => {
  server.tool(
    'getPackageDocumentation',
    'Get documentation for specific packages',
    async (args: any) => {
      const { packageName, section = 'all' } = args as GetPackageDocumentationParams;
      try {
        const docs = await getPackageDocumentation(packageName, section);
        return createResponse(JSON.stringify(docs));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error retrieving package documentation';
        return createError(errorMessage);
      }
    }
  );
};