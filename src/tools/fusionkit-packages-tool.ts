import { createResponse, createError } from '../helper/utils';
import { getFusionKitPackages } from './documentationTools';

// Type definition
interface GetFusionKitPackagesParams {
  packageName?: 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation';
}

// Input schema definition
const inputSchema = {
  packageName: {
    type: 'string',
    description: 'Specific package to get details for: "core", "cli", "contracts", "keycloak", "module-federation", or leave empty for all packages',
    optional: true,
  },
};

// Tool definition for external registration
export const getFusionKitPackagesTool = {
  name: 'getFusionKitPackages',
  description: 'Get information about FusionKit packages including core, CLI, contracts, keycloak, and module-federation packages',
  inputSchema,
  execute: async ({ packageName }: GetFusionKitPackagesParams) => {
    try {
      const packages = await getFusionKitPackages(packageName);
      return createResponse(JSON.stringify(packages));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving package information';
      return createError(errorMessage);
    }
  }
};