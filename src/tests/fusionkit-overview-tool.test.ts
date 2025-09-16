import { getFusionKitOverviewTool } from '../tools/fusionkit-overview-tool';
import { createResponse, createError } from '../utils/serverutils';
import * as documentationTools from '../tools/documentationTools';

// Mock the documentationTools module
jest.mock('../tools/documentationTools');

// Mock the serverutils module
jest.mock('../utils/serverutils');

const mockedGetFusionKitOverview = documentationTools.getFusionKitOverview as jest.MockedFunction<typeof documentationTools.getFusionKitOverview>;
const mockedCreateResponse = createResponse as jest.MockedFunction<typeof createResponse>;
const mockedCreateError = createError as jest.MockedFunction<typeof createError>;

describe('getFusionKitOverviewTool', () => {
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
      expect(getFusionKitOverviewTool.name).toBe('getFusionKitOverview');
    });

    it('should have description', () => {
      expect(getFusionKitOverviewTool.description).toBe(
        'Get overview information about FusionKit including introduction, key benefits, quick start guide, and deployment scenarios. When user asks about FusionKit overview, introduction, benefits, or deployment info, extract the specific section they want.',
      );
    });

    it('should have correct input schema', () => {
      expect(getFusionKitOverviewTool.inputSchema).toBeDefined();
      expect(getFusionKitOverviewTool.inputSchema.section).toBeDefined();
    });
  });

  describe('execute function', () => {
    const mockOverview = {
      introduction: 'FusionKit is a comprehensive framework',
      keyBenefits: ['Modular', 'Scalable'],
      quickStart: 'Quick start guide',
      deploymentScenarios: ['Standalone', 'Microfrontends'],
    };

    it('should execute successfully with no parameters (default behavior)', async () => {
      mockedGetFusionKitOverview.mockResolvedValue(mockOverview);

      const result = await getFusionKitOverviewTool.execute({});

      expect(mockedGetFusionKitOverview).toHaveBeenCalledWith('all');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockOverview));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockOverview) }],
        isError: false,
      });
    });

    it('should execute successfully with specific section', async () => {
      const mockSectionResult = { keyBenefits: ['Modular', 'Scalable'] };
      mockedGetFusionKitOverview.mockResolvedValue(mockSectionResult);

      const result = await getFusionKitOverviewTool.execute({
        section: 'keyBenefits',
      });

      expect(mockedGetFusionKitOverview).toHaveBeenCalledWith('keyBenefits');
      expect(mockedCreateResponse).toHaveBeenCalledWith(JSON.stringify(mockSectionResult));
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockSectionResult) }],
        isError: false,
      });
    });

    it('should work with all supported sections', async () => {
      const sections = ['introduction', 'keyBenefits', 'quickStart', 'deploymentScenarios', 'all'];

      for (const section of sections) {
        const mockSectionResult = { [section]: `Content for ${section}` };
        mockedGetFusionKitOverview.mockResolvedValue(mockSectionResult);

        await getFusionKitOverviewTool.execute({ section });

        expect(mockedGetFusionKitOverview).toHaveBeenCalledWith(section);
      }

      expect(mockedGetFusionKitOverview).toHaveBeenCalledTimes(sections.length);
    });

    it('should handle errors from getFusionKitOverview function', async () => {
      const errorMessage = 'Section "invalidSection" not found';
      mockedGetFusionKitOverview.mockRejectedValue(new Error(errorMessage));

      const result = await getFusionKitOverviewTool.execute({
        section: 'introduction',
      });

      expect(mockedGetFusionKitOverview).toHaveBeenCalledWith('introduction');
      expect(mockedCreateError).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual({
        content: [{ type: 'text', text: errorMessage }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockedGetFusionKitOverview.mockRejectedValue('Some string error');

      const result = await getFusionKitOverviewTool.execute({});

      expect(mockedCreateError).toHaveBeenCalledWith('Error retrieving FusionKit overview');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error retrieving FusionKit overview' }],
        isError: true,
      });
    });

    it('should handle empty args object', async () => {
      mockedGetFusionKitOverview.mockResolvedValue(mockOverview);

      const result = await getFusionKitOverviewTool.execute({});

      expect(mockedGetFusionKitOverview).toHaveBeenCalledWith('all');
      expect(result.isError).toBe(false);
    });

    it('should handle null section parameter', async () => {
      const result = await getFusionKitOverviewTool.execute({
        section: null,
      });

      expect(mockedGetFusionKitOverview).not.toHaveBeenCalled();
      expect(mockedCreateError).toHaveBeenCalledWith("Invalid parameters: Expected 'introduction' | 'keyBenefits' | 'quickStart' | 'deploymentScenarios' | 'all', received null");
      expect(result.isError).toBe(true);
    });
  });
});
