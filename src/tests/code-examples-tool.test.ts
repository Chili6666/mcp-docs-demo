import { getCodeExamplesTool } from '../tools/code-examples-tool';
import { createResponse, createError } from '../utils/serverutils';
import * as documentationTools from '../tools/documentationTools';

// Mock the documentationTools module
jest.mock('../tools/documentationTools');

// Mock the serverutils module
jest.mock('../utils/serverutils');

const mockedGetCodeExamples = documentationTools.getCodeExamples as jest.MockedFunction<typeof documentationTools.getCodeExamples>;
const mockedCreateResponse = createResponse as jest.MockedFunction<typeof createResponse>;
const mockedCreateError = createError as jest.MockedFunction<typeof createError>;

describe('getCodeExamplesTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock implementations
    mockedCreateResponse.mockImplementation((text: string) => ({
      content: [{ type: 'text', text }],
      isError: false,
    }));

    mockedCreateError.mockImplementation((text: string) => ({
      content: [{ type: 'text', text }],
      isError: true,
    }));
  });

  describe('tool metadata', () => {
    it('should have correct name', () => {
      expect(getCodeExamplesTool.name).toBe('getCodeExamples');
    });

    it('should have description', () => {
      expect(getCodeExamplesTool.description).toBe('Get code examples for different use cases and frameworks');
    });

    it('should have correct input schema', () => {
      expect(getCodeExamplesTool.inputSchema).toEqual({
        useCase: {
          type: 'string',
          description: 'The use case or topic for code examples. Can be one of the predefined cases: "getting-started", "microfrontend-setup", "authentication", "configuration", "service-integration", or describe what you want to see in natural language (e.g., "how to use fusionkit with react", "basic setup", "user login")',
        },
        framework: {
          type: 'string',
          description: 'Framework for the code examples: "angular", "react", "vue", or "vanilla". Defaults to "react" if not specified',
          optional: true,
        },
      });
    });
  });

  describe('execute function', () => {
    const mockCodeExample = {
      useCase: 'getting-started',
      framework: 'react',
      code: 'console.log("Hello World");'
    };

    it('should execute successfully with required parameters', async () => {
      mockedGetCodeExamples.mockResolvedValue(mockCodeExample);

      const result = await getCodeExamplesTool.execute({
        useCase: 'getting-started'
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith('getting-started', 'react');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockCodeExample));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockCodeExample) }],
        isError: false,
      });
    });

    it('should execute successfully with useCase and framework parameters', async () => {
      const mockAngularExample = {
        useCase: 'microfrontend-setup',
        framework: 'angular',
        code: 'import { NgModule } from "@angular/core";'
      };

      mockedGetCodeExamples.mockResolvedValue(mockAngularExample);

      const result = await getCodeExamplesTool.execute({
        useCase: 'microfrontend-setup',
        framework: 'angular'
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith('microfrontend-setup', 'angular');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockAngularExample));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockAngularExample) }],
        isError: false,
      });
    });

    it('should default to react framework when framework not specified', async () => {
      mockedGetCodeExamples.mockResolvedValue(mockCodeExample);

      await getCodeExamplesTool.execute({
        useCase: 'authentication'
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith('authentication', 'react');
    });

    it('should return error when useCase is missing', async () => {
      const result = await getCodeExamplesTool.execute({});

      expect(mockedGetCodeExamples).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "useCase" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "useCase" parameter is required.' }],
        isError: true,
      });
    });

    it('should return error when useCase is null', async () => {
      const result = await getCodeExamplesTool.execute({
        useCase: null
      });

      expect(mockedGetCodeExamples).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "useCase" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "useCase" parameter is required.' }],
        isError: true,
      });
    });

    it('should return error when useCase is empty string', async () => {
      const result = await getCodeExamplesTool.execute({
        useCase: ''
      });

      expect(mockedGetCodeExamples).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "useCase" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "useCase" parameter is required.' }],
        isError: true,
      });
    });

    it('should handle errors from getCodeExamples function', async () => {
      const errorMessage = 'No examples found for use case "invalid-case"';
      mockedGetCodeExamples.mockRejectedValue(new Error(errorMessage));

      const result = await getCodeExamplesTool.execute({
        useCase: 'invalid-case'
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith('invalid-case', 'react');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedGetCodeExamples.mockRejectedValue('Some string error');

      const result = await getCodeExamplesTool.execute({
        useCase: 'getting-started'
      });

      expect(mockedCreateError).toHaveBeenCalledWith('Error retrieving code examples');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error retrieving code examples' }],
        isError: true,
      });
    });

    it('should work with all supported use cases', async () => {
      const useCases = [
        'getting-started',
        'microfrontend-setup',
        'authentication',
        'configuration',
        'service-integration'
      ];

      for (const useCase of useCases) {
        mockedGetCodeExamples.mockResolvedValue({
          useCase,
          framework: 'react',
          code: `// Code for ${useCase}`
        });

        await getCodeExamplesTool.execute({ useCase });

        expect(mockedGetCodeExamples).toHaveBeenCalledWith(useCase, 'react');
      }

      expect(mockedGetCodeExamples).toHaveBeenCalledTimes(useCases.length);
    });

    it('should work with all supported frameworks', async () => {
      const frameworks = ['angular', 'react', 'vue', 'vanilla'];

      for (const framework of frameworks) {
        mockedGetCodeExamples.mockResolvedValue({
          useCase: 'getting-started',
          framework,
          code: `// Code for ${framework}`
        });

        await getCodeExamplesTool.execute({
          useCase: 'getting-started',
          framework
        });

        expect(mockedGetCodeExamples).toHaveBeenCalledWith('getting-started', framework);
      }

      expect(mockedGetCodeExamples).toHaveBeenCalledTimes(frameworks.length);
    });

    it('should handle natural language use case queries', async () => {
      const naturalLanguageQuery = 'how to use fusionkit with react';
      const mockResponse = {
        useCase: naturalLanguageQuery,
        framework: 'react',
        code: 'import React from "react";\nimport { FusionKit } from "fusion-kit-core";'
      };

      mockedGetCodeExamples.mockResolvedValue(mockResponse);

      const result = await getCodeExamplesTool.execute({
        useCase: naturalLanguageQuery
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith(naturalLanguageQuery, 'react');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
        isError: false,
      });
    });

    it('should handle natural language with specific framework', async () => {
      const naturalLanguageQuery = 'basic setup guide';
      const mockResponse = {
        useCase: naturalLanguageQuery,
        framework: 'angular',
        code: 'import { NgModule } from "@angular/core";\nimport { FusionKitModule } from "fusion-kit-angular";'
      };

      mockedGetCodeExamples.mockResolvedValue(mockResponse);

      const result = await getCodeExamplesTool.execute({
        useCase: naturalLanguageQuery,
        framework: 'angular'
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith(naturalLanguageQuery, 'angular');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
        isError: false,
      });
    });

    it('should handle complex natural language queries', async () => {
      const complexQuery = 'show me a code example on how to use the fusionkit with react';
      const mockResponse = {
        useCase: complexQuery,
        framework: 'react',
        code: '// React FusionKit integration example\nimport { FusionKit } from "fusion-kit-core";\n\nfunction App() {\n  return <div>FusionKit App</div>;\n}'
      };

      mockedGetCodeExamples.mockResolvedValue(mockResponse);

      const result = await getCodeExamplesTool.execute({
        useCase: complexQuery
      });

      expect(mockedGetCodeExamples).toHaveBeenCalledWith(complexQuery, 'react');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockResponse));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
        isError: false,
      });
    });
  });
});