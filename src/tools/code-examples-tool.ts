import { createResponse, createError } from '../utils/serverutils.js';
import { getCodeExamples } from './documentationTools';

// Type definition
interface GetCodeExamplesParams {
  useCase: 'getting-started' | 'microfrontend-setup' | 'authentication' | 'configuration' | 'service-integration';
  framework?: 'angular' | 'react' | 'vue' | 'vanilla';
}

// Input schema definition
const inputSchema = {
  useCase: {
    type: 'string',
    description: 'The use case for code examples: "getting-started", "microfrontend-setup", "authentication", "configuration", or "service-integration"',
  },
  framework: {
    type: 'string',
    description: 'Framework for the code examples: "angular", "react", "vue", or "vanilla". Defaults to "react" if not specified',
    optional: true,
  },
};

// Tool definition for external registration
export const getCodeExamplesTool = {
  name: 'getCodeExamples',
  description: 'Get code examples for different use cases and frameworks',
  inputSchema,
  execute: async (args: any) => {
    const { useCase, framework = 'react' } = args as GetCodeExamplesParams;
    try {
      const example = await getCodeExamples(useCase, framework);
      return createResponse(JSON.stringify(example));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving code examples';
      return createError(errorMessage);
    }
  }
};