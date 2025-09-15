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
 * - "How do I migrate FusionKit from v1 to v2?"
 * - "Show me the FusionKit migration guide from version 2.0 to latest"
 * - "What FusionKit breaking changes are there between v1 and v3?"
 * - "Help me upgrade FusionKit from v1.5 to v2.0"
 * - "FusionKit migration instructions for v3"
 * - "How to update my FusionKit project to the latest version?"
 */

import { createResponse, createError } from "../utils/serverutils.js";
import { getMigrationGuide } from "./documentationTools";
import { z } from 'zod';

// Define Zod schema for Migration Guide parameters
const MigrationGuideParamsSchema = z.object({
  fromVersion: z.string().describe('The version to migrate from (e.g., "1.0.0", "2.1.3", "v1", "v2")'),
  toVersion: z.string().optional().default("latest").describe('The version to migrate to. Defaults to "latest" if not specified')
});

type MigrationGuideParams = z.infer<typeof MigrationGuideParamsSchema>;

// Tool definition for external registration
export const getMigrationGuideTool = {
  name: "getMigrationGuide",
  description: "Get migration guide between different versions of FusionKit. When user asks about migrating, upgrading, or version changes, extract the source and target versions.",
  inputSchema: MigrationGuideParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = MigrationGuideParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { fromVersion, toVersion } = parseResult.data;

      // If no fromVersion provided, this indicates Claude didn't extract the parameter
      if (!fromVersion) {
        return createError("No source version was extracted from your request. This appears to be a parameter extraction issue.");
      }

      // Call the actual implementation
      const guide = await getMigrationGuide(fromVersion, toVersion);

      return createResponse(JSON.stringify(guide));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error retrieving migration guide";
      return createError(errorMessage);
    }
  },
};