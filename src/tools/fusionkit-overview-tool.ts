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
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { getFusionKitOverview } from './documentationTools';

// Type definition
interface GetFusionKitOverviewParams {
  section?: 'introduction' | 'keyBenefits' | 'quickStart' | 'deploymentScenarios' | 'all';
}

// Input schema definition
const inputSchema = {
  section: {
    type: 'string',
    description: 'Specific section to focus on: "introduction", "keyBenefits", "quickStart", "deploymentScenarios", or "all" for complete overview',
    optional: true,
  },
};

// Tool definition for external registration
export const getFusionKitOverviewTool = {
  name: 'getFusionKitOverview',
  description: 'Get overview information about FusionKit including introduction, key benefits, quick start guide, and deployment scenarios',
  inputSchema,
  execute: async (args: any) => {
    const { section = 'all' } = args as GetFusionKitOverviewParams;
    try {
      const overview = await getFusionKitOverview(section);
      return createResponse(JSON.stringify(overview));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving FusionKit overview';
      return createError(errorMessage);
    }
  }
};