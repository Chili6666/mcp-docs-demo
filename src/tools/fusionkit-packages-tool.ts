/*
 * FUSIONKIT PACKAGES TOOL
 *
 * This tool is triggered when users ask for:
 * - List of available FusionKit packages
 * - Information about specific packages (core, CLI, contracts, etc.)
 * - Package comparisons or recommendations
 * - "What packages does FusionKit have?" questions
 * - Package descriptions or purposes
 *
 * Example triggers:
 * - "What FusionKit packages are available?"
 * - "Tell me about the fusion-kit-core package"
 * - "List all FusionKit packages"
 * - "What does the CLI package do?"
 * - "Show me information about the keycloak package"
 */

import { createResponse, createError } from '../utils/serverutils.js';
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
  execute: async (args: any) => {
    const { packageName } = args as GetFusionKitPackagesParams;

    if(!packageName) {
      return createError('The "packageName" parameter is required.');
    }

    
    try {
      const packages = await getFusionKitPackages(packageName);
      return createResponse(JSON.stringify(packages));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving package information';
      return createError(errorMessage);
    }
  }
};