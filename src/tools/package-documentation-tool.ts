/*
 * PACKAGE DOCUMENTATION TOOL
 *
 * This tool is triggered when users ask for:
 * - Detailed documentation for specific packages
 * - Installation instructions for packages
 * - API documentation or reference guides
 * - Package usage examples
 * - "How do I install/use [package]?" questions
 * - Deep-dive into package features and functionality
 *
 * Example triggers:
 * - "Show me the FusionKit core package documentation"
 * - "How do I install the FusionKit CLI package?"
 * - "Get the API documentation for the FusionKit keycloak package"
 * - "I need examples for the FusionKit module-federation package"
 * - "Show me all FusionKit contracts package documentation"
 * - "FusionKit package installation guide"
 * - "How to use FusionKit packages in my project?"
 */

import { createResponse, createError } from "../utils/serverutils.js";
import { getPackageDocumentation } from "./documentationTools";
import { z } from 'zod';

// Define Zod schema for Package Documentation parameters
const PackageDocumentationParamsSchema = z.object({
  packageName: z.enum(['core', 'cli', 'contracts', 'keycloak', 'module-federation']).describe('Package name: "core", "cli", "contracts", "keycloak", or "module-federation"'),
  section: z.enum(['overview', 'installation', 'api', 'examples', 'all']).optional().default('all').describe('Documentation section: "overview", "installation", "api", "examples", or "all" for complete documentation. Defaults to "all" if not specified')
});

type PackageDocumentationParams = z.infer<typeof PackageDocumentationParamsSchema>;

// Tool definition for external registration
export const getPackageDocumentationTool = {
  name: "getPackageDocumentation",
  description: "Get documentation for specific FusionKit packages including installation, API reference, and usage examples. When user asks for package documentation, extract the package name and specific section if mentioned.",
  inputSchema: PackageDocumentationParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = PackageDocumentationParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { packageName, section } = parseResult.data;

      // If no packageName provided, this indicates Claude didn't extract the parameter
      if (!packageName) {
        return createError("No package name was extracted from your request. This appears to be a parameter extraction issue.");
      }

      // Call the actual implementation
      const docs = await getPackageDocumentation(packageName, section);

      return createResponse(JSON.stringify(docs));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error retrieving package documentation";
      return createError(errorMessage);
    }
  },
};