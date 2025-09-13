import { createResponse, createError } from '../helper/utils';
import { getPackageDocumentation } from './documentationTools';

// Type definition
interface GetPackageDocumentationParams {
  packageName: 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation';
  section?: 'overview' | 'installation' | 'api' | 'examples' | 'all';
}

// Input schema definition
const inputSchema = {
  packageName: {
    type: 'string',
    description: 'Package name: "core", "cli", "contracts", "keycloak", or "module-federation"',
  },
  section: {
    type: 'string',
    description: 'Documentation section: "overview", "installation", "api", "examples", or "all" for complete documentation. Defaults to "all" if not specified',
    optional: true,
  },
};

// Tool definition for external registration
export const getPackageDocumentationTool = {
  name: 'getPackageDocumentation',
  description: 'Get documentation for specific packages',
  inputSchema,
  execute: async ({ packageName, section = 'all' }: GetPackageDocumentationParams) => {
    try {
      const docs = await getPackageDocumentation(packageName, section);
      return createResponse(JSON.stringify(docs));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving package documentation';
      return createError(errorMessage);
    }
  }
};