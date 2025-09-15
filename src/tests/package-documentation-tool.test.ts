import { getPackageDocumentationTool } from '../tools/package-documentation-tool';
import { createResponse, createError } from '../utils/serverutils';
import * as documentationTools from '../tools/documentationTools';

// Mock the documentationTools module
jest.mock('../tools/documentationTools');

// Mock the serverutils module
jest.mock('../utils/serverutils');

const mockedGetPackageDocumentation = documentationTools.getPackageDocumentation as jest.MockedFunction<typeof documentationTools.getPackageDocumentation>;
const mockedCreateResponse = createResponse as jest.MockedFunction<typeof createResponse>;
const mockedCreateError = createError as jest.MockedFunction<typeof createError>;

describe('getPackageDocumentationTool', () => {
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
      expect(getPackageDocumentationTool.name).toBe('getPackageDocumentation');
    });

    it('should have description', () => {
      expect(getPackageDocumentationTool.description).toBe('Get documentation for specific packages');
    });

    it('should have correct input schema', () => {
      expect(getPackageDocumentationTool.inputSchema).toEqual({
        packageName: {
          type: 'string',
          description: 'Package name: "core", "cli", "contracts", "keycloak", or "module-federation"',
        },
        section: {
          type: 'string',
          description: 'Documentation section: "overview", "installation", "api", "examples", or "all" for complete documentation. Defaults to "all" if not specified',
          optional: true,
        },
      });
    });
  });

  describe('execute function', () => {
    const mockPackageDoc = {
      overview: 'Core functionality for FusionKit applications',
      installation: 'npm install fusion-kit-core',
      api: 'API documentation for the core package',
      examples: 'Usage examples for the core package'
    };

    it('should return error when packageName is missing', async () => {
      const result = await getPackageDocumentationTool.execute({});

      expect(mockedGetPackageDocumentation).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "packageName" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "packageName" parameter is required.' }],
        isError: true,
      });
    });

    it('should return error when packageName is null', async () => {
      const result = await getPackageDocumentationTool.execute({
        packageName: null
      });

      expect(mockedGetPackageDocumentation).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "packageName" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "packageName" parameter is required.' }],
        isError: true,
      });
    });

    it('should return error when packageName is empty string', async () => {
      const result = await getPackageDocumentationTool.execute({
        packageName: ''
      });

      expect(mockedGetPackageDocumentation).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('The "packageName" parameter is required.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'The "packageName" parameter is required.' }],
        isError: true,
      });
    });

    it('should execute successfully with required packageName parameter', async () => {
      mockedGetPackageDocumentation.mockResolvedValue(mockPackageDoc);

      const result = await getPackageDocumentationTool.execute({
        packageName: 'core'
      });

      expect(mockedGetPackageDocumentation).toHaveBeenCalledWith('core', 'all');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockPackageDoc));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockPackageDoc) }],
        isError: false,
      });
    });

    it('should execute successfully with packageName and section parameters', async () => {
      const mockSectionResult = { installation: 'npm install fusion-kit-core' };
      mockedGetPackageDocumentation.mockResolvedValue(mockSectionResult);

      const result = await getPackageDocumentationTool.execute({
        packageName: 'core',
        section: 'installation'
      });

      expect(mockedGetPackageDocumentation).toHaveBeenCalledWith('core', 'installation');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockSectionResult));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockSectionResult) }],
        isError: false,
      });
    });

    it('should work with all supported package names', async () => {
      const packages = ['core', 'cli', 'contracts', 'keycloak', 'module-federation'];

      for (const packageName of packages) {
        const mockResult = { overview: `Overview for ${packageName}` };
        mockedGetPackageDocumentation.mockResolvedValue(mockResult);

        await getPackageDocumentationTool.execute({ packageName });

        expect(mockedGetPackageDocumentation).toHaveBeenCalledWith(packageName, 'all');
      }

      expect(mockedGetPackageDocumentation).toHaveBeenCalledTimes(packages.length);
    });

    it('should work with all supported sections', async () => {
      const sections = ['overview', 'installation', 'api', 'examples', 'all'];

      for (const section of sections) {
        const mockResult = { [section]: `Content for ${section}` };
        mockedGetPackageDocumentation.mockResolvedValue(mockResult);

        await getPackageDocumentationTool.execute({
          packageName: 'core',
          section
        });

        expect(mockedGetPackageDocumentation).toHaveBeenCalledWith('core', section);
      }

      expect(mockedGetPackageDocumentation).toHaveBeenCalledTimes(sections.length);
    });

    it('should handle errors from getPackageDocumentation function', async () => {
      const errorMessage = 'Documentation for package "nonexistent" not found';
      mockedGetPackageDocumentation.mockRejectedValue(new Error(errorMessage));

      const result = await getPackageDocumentationTool.execute({
        packageName: 'nonexistent'
      });

      expect(mockedGetPackageDocumentation).toHaveBeenCalledWith('nonexistent', 'all');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle section not found errors', async () => {
      const errorMessage = 'Section "invalidSection" not found for package "core"';
      mockedGetPackageDocumentation.mockRejectedValue(new Error(errorMessage));

      const result = await getPackageDocumentationTool.execute({
        packageName: 'core',
        section: 'invalidSection'
      });

      expect(mockedGetPackageDocumentation).toHaveBeenCalledWith('core', 'invalidSection');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedGetPackageDocumentation.mockRejectedValue('Some string error');

      const result = await getPackageDocumentationTool.execute({
        packageName: 'core'
      });

      expect(mockedCreateError).toHaveBeenCalledWith('Error retrieving package documentation');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error retrieving package documentation' }],
        isError: true,
      });
    });

    it('should handle type validation errors', async () => {
      const errorMessage = 'Package name is required and must be a string, got: number';
      mockedGetPackageDocumentation.mockRejectedValue(new Error(errorMessage));

      const result = await getPackageDocumentationTool.execute({
        packageName: 'core'
      });

      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });
  });
});