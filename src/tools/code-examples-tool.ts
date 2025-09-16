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
 * - "Show me FusionKit React authentication examples"
 * - "How do I use FusionKit with Angular?"
 * - "Get FusionKit code examples for microfrontend setup"
 * - "I need FusionKit configuration examples for Vue"
 * - "Show me how to integrate FusionKit in my project"
 * - "FusionKit getting started examples"
 */

import { createResponse, createError } from '../utils/serverutils.js';
import { getCodeExamples } from './documentationTools';
import { z } from 'zod';

// Define Zod schema for Code Examples parameters
const CodeExamplesParamsSchema = z.object({
  useCase: z
    .string()
    .describe(
      'The use case or topic for FusionKit code examples. Can be one of the predefined cases: "getting-started", "microfrontend-setup", "authentication", "configuration", "service-integration", or describe what you want to see in natural language (e.g., "how to use fusionkit with react", "fusionkit basic setup", "fusionkit user login", "fusionkit integration examples")',
    ),
  framework: z
    .enum(['angular', 'react', 'vue', 'vanilla'])
    .optional()
    .default('react')
    .describe('Framework for the code examples: "angular", "react", "vue", or "vanilla". Defaults to "react" if not specified'),
});

type CodeExamplesParams = z.infer<typeof CodeExamplesParamsSchema>;

// Tool definition for external registration
export const getCodeExamplesTool = {
  name: 'getCodeExamples',
  description:
    'Get FusionKit code examples for different use cases and frameworks. When user asks for FusionKit code examples, setup guides, authentication examples, or framework-specific implementations, extract the use case and framework and pass them as parameters.',
  inputSchema: CodeExamplesParamsSchema.shape,
  execute: async (args: any) => {
    try {
      // Validate and parse arguments with Zod
      const parseResult = CodeExamplesParamsSchema.safeParse(args);

      if (!parseResult.success) {
        return createError(`Invalid parameters: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
      }

      const { useCase, framework } = parseResult.data;

      // If no useCase provided, this indicates Claude didn't extract the parameter
      if (!useCase) {
        return createError('No use case was extracted from your request. This appears to be a parameter extraction issue.');
      }

      // Call the actual implementation
      const example = await getCodeExamples(useCase, framework);

      return createResponse(JSON.stringify(example));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving code examples';
      return createError(errorMessage);
    }
  },
};
