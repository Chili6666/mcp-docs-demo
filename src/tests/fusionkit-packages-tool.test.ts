import { getFusionKitPackagesTool } from '../tools/fusionkit-packages-tool';
import { createResponse, createError } from '../utils/serverutils';
import * as documentationTools from '../tools/documentationTools';

// Mock the documentationTools module
jest.mock('../tools/documentationTools');

// Mock the serverutils module
jest.mock('../utils/serverutils');

const mockedGetFusionKitPackages = documentationTools.getFusionKitPackages as jest.MockedFunction<typeof documentationTools.getFusionKitPackages>;
const mockedCreateResponse = createResponse as jest.MockedFunction<typeof createResponse>;
const mockedCreateError = createError as jest.MockedFunction<typeof createError>;

describe('getFusionKitPackagesTool', () => {
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
      expect(getFusionKitPackagesTool.name).toBe('getFusionKitPackages');
    });

    it('should have description', () => {
      expect(getFusionKitPackagesTool.description).toBe(
        'Get information about FusionKit packages including core, CLI, contracts, keycloak, and module-federation packages. When user asks about FusionKit packages, extract the specific package name if mentioned.',
      );
    });

    it('should have correct input schema', () => {
      expect(getFusionKitPackagesTool.inputSchema).toBeDefined();
      expect(getFusionKitPackagesTool.inputSchema.packageName).toBeDefined();
    });
  });

  describe('execute function', () => {
    const mockAllPackages = {
      'fusion-kit-core': 'Core functionality for FusionKit applications',
      'fusion-kit-cli': 'Command-line interface for FusionKit development',
      'fusion-kit-contracts': 'Type contracts and interfaces',
      'fusion-kit-keycloak': 'Keycloak integration package',
      'fusion-kit-module-federation': 'Module federation utilities',
    };

    it('should return all packages when packageName is missing', async () => {
      mockedGetFusionKitPackages.mockResolvedValue(mockAllPackages);
      const result = await getFusionKitPackagesTool.execute({});

      expect(mockedGetFusionKitPackages).toHaveBeenCalledWith(undefined);
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockAllPackages));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockAllPackages) }],
        isError: false,
      });
    });

    it('should execute successfully with specific package name', async () => {
      const mockSinglePackage = { core: 'Core functionality for FusionKit applications' };
      mockedGetFusionKitPackages.mockResolvedValue(mockSinglePackage);

      const result = await getFusionKitPackagesTool.execute({
        packageName: 'core',
      });

      expect(mockedGetFusionKitPackages).toHaveBeenCalledWith('core');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockSinglePackage));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockSinglePackage) }],
        isError: false,
      });
    });

    it('should work with all supported package names', async () => {
      const packages = ['core', 'cli', 'contracts', 'keycloak', 'module-federation'];

      for (const packageName of packages) {
        const mockPackageResult = { [packageName]: `Description for ${packageName}` };
        mockedGetFusionKitPackages.mockResolvedValue(mockPackageResult);

        await getFusionKitPackagesTool.execute({ packageName });

        expect(mockedGetFusionKitPackages).toHaveBeenCalledWith(packageName);
      }

      expect(mockedGetFusionKitPackages).toHaveBeenCalledTimes(packages.length);
    });

    it('should handle errors from getFusionKitPackages function', async () => {
      const errorMessage = 'Package "nonexistent" not found';
      mockedGetFusionKitPackages.mockRejectedValue(new Error(errorMessage));

      const result = await getFusionKitPackagesTool.execute({
        packageName: 'core',
      });

      expect(mockedGetFusionKitPackages).toHaveBeenCalledWith('core');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedGetFusionKitPackages.mockRejectedValue('Some string error');

      const result = await getFusionKitPackagesTool.execute({
        packageName: 'core',
      });

      expect(mockedCreateError).toHaveBeenCalledWith('Error retrieving package information');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error retrieving package information' }],
        isError: true,
      });
    });

    it('should return error for empty package name', async () => {
      const result = await getFusionKitPackagesTool.execute({
        packageName: '',
      });

      expect(mockedGetFusionKitPackages).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith(
        "Invalid parameters: Invalid enum value. Expected 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation', received ''",
      );
      expect(result.isError).toBe(true);
    });

    it('should return error for null package name', async () => {
      const result = await getFusionKitPackagesTool.execute({
        packageName: null,
      });

      expect(mockedGetFusionKitPackages).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith("Invalid parameters: Expected 'core' | 'cli' | 'contracts' | 'keycloak' | 'module-federation', received null");
      expect(result.isError).toBe(true);
    });

    it('should handle error when no packages found', async () => {
      const errorMessage = 'No package documentation found in indexed content';
      mockedGetFusionKitPackages.mockRejectedValue(new Error(errorMessage));

      const result = await getFusionKitPackagesTool.execute({
        packageName: 'core',
      });

      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });
  });
});
