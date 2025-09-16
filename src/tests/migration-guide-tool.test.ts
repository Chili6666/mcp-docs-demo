import { getMigrationGuideTool } from '../tools/migration-guide-tool';
import { createResponse, createError } from '../utils/serverutils';
import * as documentationTools from '../tools/documentationTools';

// Mock the documentationTools module
jest.mock('../tools/documentationTools');

// Mock the serverutils module
jest.mock('../utils/serverutils');

const mockedGetMigrationGuide = documentationTools.getMigrationGuide as jest.MockedFunction<typeof documentationTools.getMigrationGuide>;
const mockedCreateResponse = createResponse as jest.MockedFunction<typeof createResponse>;
const mockedCreateError = createError as jest.MockedFunction<typeof createError>;

describe('getMigrationGuideTool', () => {
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
      expect(getMigrationGuideTool.name).toBe('getMigrationGuide');
    });

    it('should have description', () => {
      expect(getMigrationGuideTool.description).toBe(
        'Get migration guide between different versions of FusionKit. When user asks about migrating, upgrading, or version changes, extract the source and target versions.',
      );
    });

    it('should have correct input schema', () => {
      expect(getMigrationGuideTool.inputSchema).toBeDefined();
      expect(getMigrationGuideTool.inputSchema.fromVersion).toBeDefined();
      expect(getMigrationGuideTool.inputSchema.toVersion).toBeDefined();
    });
  });

  describe('execute function', () => {
    const mockMigrationGuide = {
      title: 'Migration from v1.0 to v2.0',
      overview: 'This guide covers migrating from version 1.0 to 2.0',
      breakingChanges: ['API endpoint changes', 'Configuration format updates'],
      steps: ['Update dependencies', 'Run migration script', 'Test application'],
      codeChanges: 'Before: oldApi.method(); After: newApi.method();',
    };

    it('should return error when fromVersion is missing', async () => {
      const result = await getMigrationGuideTool.execute({});

      expect(mockedGetMigrationGuide).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('Invalid parameters: Required');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Invalid parameters: Required' }],
        isError: true,
      });
    });

    it('should return error when fromVersion is null', async () => {
      const result = await getMigrationGuideTool.execute({
        fromVersion: null,
      });

      expect(mockedGetMigrationGuide).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('Invalid parameters: Expected string, received null');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Invalid parameters: Expected string, received null' }],
        isError: true,
      });
    });

    it('should return error when fromVersion is empty string', async () => {
      const result = await getMigrationGuideTool.execute({
        fromVersion: '',
      });

      expect(mockedGetMigrationGuide).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('No source version was extracted from your request. This appears to be a parameter extraction issue.');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'No source version was extracted from your request. This appears to be a parameter extraction issue.' }],
        isError: true,
      });
    });

    it('should execute successfully with required fromVersion parameter', async () => {
      mockedGetMigrationGuide.mockResolvedValue(mockMigrationGuide);

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
      });

      expect(mockedGetMigrationGuide).toHaveBeenCalledWith('v1.0', 'latest');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockMigrationGuide));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMigrationGuide) }],
        isError: false,
      });
    });

    it('should execute successfully with fromVersion and toVersion parameters', async () => {
      const customMigrationGuide = {
        ...mockMigrationGuide,
        title: 'Migration from v1.0 to v3.0',
      };
      mockedGetMigrationGuide.mockResolvedValue(customMigrationGuide);

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
        toVersion: 'v3.0',
      });

      expect(mockedGetMigrationGuide).toHaveBeenCalledWith('v1.0', 'v3.0');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(customMigrationGuide));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(customMigrationGuide) }],
        isError: false,
      });
    });

    it('should work with various version formats', async () => {
      const versionFormats = [
        { from: '1.0.0', to: '2.0.0' },
        { from: 'v1', to: 'v2' },
        { from: '1.5', to: 'latest' },
        { from: '2.0', to: '3.0' },
        { from: 'v1.2.3', to: 'v2.0.0' },
      ];

      for (const { from, to } of versionFormats) {
        const mockResult = {
          ...mockMigrationGuide,
          title: `Migration from ${from} to ${to}`,
        };
        mockedGetMigrationGuide.mockResolvedValue(mockResult);

        await getMigrationGuideTool.execute({
          fromVersion: from,
          toVersion: to,
        });

        expect(mockedGetMigrationGuide).toHaveBeenCalledWith(from, to);
      }

      expect(mockedGetMigrationGuide).toHaveBeenCalledTimes(versionFormats.length);
    });

    it('should default toVersion to "latest" when not provided', async () => {
      mockedGetMigrationGuide.mockResolvedValue(mockMigrationGuide);

      await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
      });

      expect(mockedGetMigrationGuide).toHaveBeenCalledWith('v1.0', 'latest');
    });

    it('should handle errors from getMigrationGuide function', async () => {
      const errorMessage = 'No migration guide found for version "v99"';
      mockedGetMigrationGuide.mockRejectedValue(new Error(errorMessage));

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v99',
      });

      expect(mockedGetMigrationGuide).toHaveBeenCalledWith('v99', 'latest');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedGetMigrationGuide.mockRejectedValue('Some string error');

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
      });

      expect(mockedCreateError).toHaveBeenCalledWith('Error retrieving migration guide');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error retrieving migration guide' }],
        isError: true,
      });
    });

    it('should handle type validation errors', async () => {
      const errorMessage = 'From version is required and must be a string, got: number';
      mockedGetMigrationGuide.mockRejectedValue(new Error(errorMessage));

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
      });

      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle empty toVersion parameter', async () => {
      mockedGetMigrationGuide.mockResolvedValue(mockMigrationGuide);

      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
        toVersion: '',
      });

      expect(mockedGetMigrationGuide).toHaveBeenCalledWith('v1.0', '');
      expect(result.isError).toBe(false);
    });

    it('should handle null toVersion parameter', async () => {
      const result = await getMigrationGuideTool.execute({
        fromVersion: 'v1.0',
        toVersion: null,
      });

      expect(mockedGetMigrationGuide).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith('Invalid parameters: Expected string, received null');
      expect(result.isError).toBe(true);
    });
  });
});
