import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createResponse, createError } from '../helper/utils';
import { getCodeExamples } from './documentationTools';
import { GetCodeExamplesParams } from '../interfaces/tool-params';

export const registerCodeExamplesTool = (server: McpServer) => {
  server.tool(
    'getCodeExamples',
    'Get code examples for different use cases and frameworks',
    async (args: any) => {
      const { useCase, framework = 'angular' } = args as GetCodeExamplesParams;
      try {
        const example = await getCodeExamples(useCase, framework);
        return createResponse(JSON.stringify(example));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error retrieving code examples';
        return createError(errorMessage);
      }
    }
  );
};