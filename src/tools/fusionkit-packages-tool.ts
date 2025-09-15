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
 * - "Tell me about the FusionKit core package"
 * - "List all FusionKit packages"
 * - "What does the FusionKit CLI package do?"
 * - "Show me information about the FusionKit keycloak package"
 * - "Which FusionKit package should I use for microfrontends?"
 * - "FusionKit module federation package details"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { getFusionKitPackages } from './documentationTools';
import { z } from 'zod';

// Define Zod schema for FusionKit Packages parameters
const FusionKitPackagesParamsSchema = z.object({
  packageName: z.enum(['core', 'cli', 'contracts', 'keycloak', 'module-federation']).optional().describe('Specific package to get details for: "core", "cli", "contracts", "keycloak", "module-federation", or leave empty for all packages')
});

type FusionKitPackagesParams = z.infer<typeof FusionKitPackagesParamsSchema>;

// Tool definition for external registration
export const getFusionKitPackagesTool = {
  name: 'getFusionKitPackages',
  description: 'Get information about FusionKit packages including core, CLI, contracts, keycloak, and module-federation packages. When user asks about FusionKit packages, extract the specific package name if mentioned.',
  inputSchema: FusionKitPackagesParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = FusionKitPackagesParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { packageName } = parseResult.data;

      // Call the actual implementation
      const packages = await getFusionKitPackages(packageName);

      return createResponse(JSON.stringify(packages));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving package information';
      return createError(errorMessage);
    }
  }
};