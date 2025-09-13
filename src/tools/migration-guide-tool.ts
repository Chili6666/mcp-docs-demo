import { createResponse, createError } from '../utils/serverutils.js';
import { getMigrationGuide } from './documentationTools';

// Type definition
interface GetMigrationGuideParams {
  fromVersion: string;
  toVersion?: string;
}

// Input schema definition
const inputSchema = {
  fromVersion: {
    type: 'string',
    description: 'The version to migrate from (e.g., "1.0.0", "2.1.3")',
  },
  toVersion: {
    type: 'string',
    description: 'The version to migrate to. Defaults to "latest" if not specified',
    optional: true,
  },
};

// Tool definition for external registration
export const getMigrationGuideTool = {
  name: 'getMigrationGuide',
  description: 'Get migration guide between different versions',
  inputSchema,
  execute: async (args: any) => {
    const { fromVersion, toVersion = 'latest' } = args as GetMigrationGuideParams;
    try {
      const guide = await getMigrationGuide(fromVersion, toVersion);
      return createResponse(JSON.stringify(guide));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving migration guide';
      return createError(errorMessage);
    }
  }
};