import { createResponse, createError } from '../helper/utils';
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
  execute: async ({ section = 'all' }: GetFusionKitOverviewParams) => {
    try {
      const overview = await getFusionKitOverview(section);
      return createResponse(JSON.stringify(overview));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving FusionKit overview';
      return createError(errorMessage);
    }
  }
};