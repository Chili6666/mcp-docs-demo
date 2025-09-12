import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createResponse, createError } from '../helper/utils';
import { getFusionKitPackages } from './documentationTools';
import { GetFusionKitPackagesParams } from '../interfaces/tool-params';

export const registerFusionKitPackagesTool = (server: McpServer) => {
  server.tool(
    'getFusionKitPackages',
    {
      packageName: {
        type: 'string',
        description: 'Specific package to get details for: "core", "cli", "contracts", "keycloak", "module-federation", or leave empty for all packages',
        optional: true,
      },
    },
    async ({ packageName }: GetFusionKitPackagesParams) => {
      try {
        const packages = await getFusionKitPackages(packageName);
        return createResponse(JSON.stringify(packages));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error retrieving package information';
        return createError(errorMessage);
      }
    }
  );
};