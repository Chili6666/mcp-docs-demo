/*
 * FUSIONKIT OVERVIEW TOOL
 *
 * This tool is triggered when users ask for:
 * - General information about FusionKit
 * - "What is FusionKit?" questions
 * - Overview, introduction, or summary requests
 * - Key benefits or features of FusionKit
 * - Quick start guide requests
 * - Deployment scenarios or architecture info
 *
 * Example triggers:
 * - "What is FusionKit?"
 * - "Tell me about FusionKit's key benefits"
 * - "Show me the FusionKit overview"
 * - "What deployment scenarios does FusionKit support?"
 * - "Give me a quick start guide for FusionKit"
 * - "How does FusionKit work?"
 * - "FusionKit introduction and features"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { getFusionKitOverview } from './documentationTools';
import { z } from 'zod';

// Define Zod schema for FusionKit Overview parameters
const FusionKitOverviewParamsSchema = z.object({
  section: z
    .enum(['introduction', 'keyBenefits', 'quickStart', 'deploymentScenarios', 'all'])
    .optional()
    .default('all')
    .describe('Specific section to focus on: "introduction", "keyBenefits", "quickStart", "deploymentScenarios", or "all" for complete overview'),
});

type FusionKitOverviewParams = z.infer<typeof FusionKitOverviewParamsSchema>;

// Tool definition for external registration
export const getFusionKitOverviewTool = {
  name: 'getFusionKitOverview',
  description:
    'Get overview information about FusionKit including introduction, key benefits, quick start guide, and deployment scenarios. When user asks about FusionKit overview, introduction, benefits, or deployment info, extract the specific section they want.',
  inputSchema: FusionKitOverviewParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = FusionKitOverviewParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { section } = parseResult.data;

      // Call the actual implementation
      const overview = await getFusionKitOverview(section);

      return createResponse(JSON.stringify(overview));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving FusionKit overview';
      return createError(errorMessage);
    }
  },
};
