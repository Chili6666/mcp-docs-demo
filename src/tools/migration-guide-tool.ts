import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createResponse, createError } from '../helper/utils';
import { getMigrationGuide } from './documentationTools';
import { GetMigrationGuideParams } from '../interfaces/tool-params';

export const registerMigrationGuideTool = (server: McpServer) => {
  server.tool(
    'getMigrationGuide',
    'Get migration guide between different versions',
    async (args: any) => {
      const { fromVersion, toVersion = 'latest' } = args as GetMigrationGuideParams;
      try {
        const guide = await getMigrationGuide(fromVersion, toVersion);
        return createResponse(JSON.stringify(guide));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error retrieving migration guide';
        return createError(errorMessage);
      }
    }
  );
};