import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createResponse, createError } from '../helper/utils';
import { getFusionKitOverview } from './documentationTools';
import { GetFusionKitOverviewParams } from '../interfaces/tool-params';

export const registerFusionKitOverviewTool = (server: McpServer) => {
  server.tool(
    'getFusionKitOverview',
    {
      section: {
        type: 'string',
        description: 'Specific section to focus on: "introduction", "keyBenefits", "quickStart", "deploymentScenarios", or "all" for complete overview',
        optional: true,
      },
    },
    async ({ section = 'all' }: GetFusionKitOverviewParams) => {
      try {
        const overview = await getFusionKitOverview(section);
        return createResponse(JSON.stringify(overview));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error retrieving FusionKit overview';
        return createError(errorMessage);
      }
    }
  );
};