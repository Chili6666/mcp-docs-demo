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
 * - "Show me the documentation for fusion-kit-core"
 * - "How do I install the CLI package?"
 * - "Get the API documentation for the keycloak package"
 * - "I need examples for the module-federation package"
 * - "Show me all documentation for the contracts package"
 */

import { createResponse, createError } from "../utils/serverutils.js";
import { getPackageDocumentation } from "./documentationTools";

// Type definition
interface GetPackageDocumentationParams {
  packageName: "core" | "cli" | "contracts" | "keycloak" | "module-federation";
  section?: "overview" | "installation" | "api" | "examples" | "all";
}

// Input schema definition
const inputSchema = {
  packageName: {
    type: "string",
    description:
      'Package name: "core", "cli", "contracts", "keycloak", or "module-federation"',
  },
  section: {
    type: "string",
    description:
      'Documentation section: "overview", "installation", "api", "examples", or "all" for complete documentation. Defaults to "all" if not specified',
    optional: true,
  },
};

// Tool definition for external registration
export const getPackageDocumentationTool = {
  name: "getPackageDocumentation",
  description: "Get documentation for specific packages",
  inputSchema,
  execute: async (args: any) => {
    const { packageName, section = "all" } =
      args as GetPackageDocumentationParams;

    if (!packageName) {
      return createError('The "packageName" parameter is required.');
    }

    try {
      const docs = await getPackageDocumentation(packageName, section);
      return createResponse(JSON.stringify(docs));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error retrieving package documentation";
      return createError(errorMessage);
    }
  },
};
