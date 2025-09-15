/*
 * CODE EXAMPLES TOOL
 *
 * This tool is triggered when users ask for:
 * - Code examples or samples
 * - "How to use [framework]" questions
 * - Setup guides or getting started examples
 * - Authentication, configuration, or integration examples
 * - Framework-specific implementation examples (React, Angular, Vue, etc.)
 *
 * Example triggers:
 * - "Show me React authentication examples"
 * - "How do I use FusionKit with Angular?"
 * - "Get code examples for microfrontend setup"
 * - "I need configuration examples for Vue"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { getCodeExamples } from './documentationTools';

// Type definition
interface GetCodeExamplesParams {
  useCase: string;
  framework?: 'angular' | 'react' | 'vue' | 'vanilla';
}

// Input schema definition
const inputSchema = {
  useCase: {
    type: 'string',
    description: 'The use case or topic for code examples. Can be one of the predefined cases: "getting-started", "microfrontend-setup", "authentication", "configuration", "service-integration", or describe what you want to see in natural language (e.g., "how to use fusionkit with react", "basic setup", "user login")',
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
    if(!useCase) {
      return createError('The "useCase" parameter is required.');
    }
    try {
      const example = await getCodeExamples(useCase, framework);
      return createResponse(JSON.stringify(example));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving code examples';
      return createError(errorMessage);
    }
  }
};