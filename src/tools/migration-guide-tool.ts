/*
 * MIGRATION GUIDE TOOL
 *
 * This tool is triggered when users ask for:
 * - Version upgrade instructions
 * - Migration guides between FusionKit versions
 * - Breaking changes between versions
 * - "How do I migrate from X to Y?" questions
 * - Upgrade paths and compatibility info
 * - Version-specific change documentation
 *
 * Example triggers:
 * - "How do I migrate from v1 to v2?"
 * - "Show me the migration guide from version 2.0 to latest"
 * - "What breaking changes are there between v1 and v3?"
 * - "Help me upgrade from v1.5 to v2.0"
 * - "Migration instructions for FusionKit v3"
 */

import { createResponse, createError } from "../utils/serverutils.js";
import { getMigrationGuide } from "./documentationTools";

// Type definition
interface GetMigrationGuideParams {
  fromVersion: string;
  toVersion?: string;
}

// Input schema definition
const inputSchema = {
  fromVersion: {
    type: "string",
    description: 'The version to migrate from (e.g., "1.0.0", "2.1.3")',
  },
  toVersion: {
    type: "string",
    description:
      'The version to migrate to. Defaults to "latest" if not specified',
    optional: true,
  },
};

// Tool definition for external registration
export const getMigrationGuideTool = {
  name: "getMigrationGuide",
  description: "Get migration guide between different versions",
  inputSchema,
  execute: async (args: any) => {
    const { fromVersion, toVersion = "latest" } =
      args as GetMigrationGuideParams;

    if (!fromVersion) {
      return createError('The "fromVersion" parameter is required.');
    }
    try {
      const guide = await getMigrationGuide(fromVersion, toVersion);
      return createResponse(JSON.stringify(guide));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error retrieving migration guide";
      return createError(errorMessage);
    }
  },
};
