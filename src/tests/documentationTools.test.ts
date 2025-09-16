import { IndexedDocs } from '../utils/docIndexer';

// Mock the entire module to avoid file system dependencies
const mockIndexedDocs: IndexedDocs = {
  overview: [
    {
      id: 'overview_what_is_fusionkit',
      title: 'What is FusionKit?',
      content: 'FusionKit is a comprehensive framework for building modular applications.',
      filePath: 'overview.md',
      level: 1,
    },
    {
      id: 'overview_key_benefits',
      title: 'Key Benefits',
      content: '- Modular architecture\n- Easy integration\n- Scalable solutions',
      filePath: 'overview.md',
      level: 2,
    },
    {
      id: 'overview_quick_start',
      title: 'Quick Start Guide',
      content: 'Follow these steps to get started with FusionKit quickly.',
      filePath: 'overview.md',
      level: 2,
    },
    {
      id: 'overview_deployment_scenarios',
      title: 'Deployment Scenarios',
      content: '',
      filePath: 'overview.md',
      level: 2,
    },
    {
      id: 'overview_standalone_applications',
      title: 'Standalone Applications',
      content: 'Run independently with full control.',
      filePath: 'overview.md',
      level: 3,
    },
    {
      id: 'overview_microfrontends_shell',
      title: 'Microfrontends in a Shell',
      content: 'Inherit shared services from parent shell.',
      filePath: 'overview.md',
      level: 3,
    },
  ],
  packages: [
    {
      id: 'packages_fusion_kit_core',
      title: 'Fusion Kit Core',
      content: 'Core functionality for FusionKit applications.',
      filePath: 'packages/fusion-kit-core.md',
      level: 1,
    },
    {
      id: 'packages_fusion_kit_cli',
      title: 'Fusion Kit CLI',
      content: 'Command-line interface for FusionKit development.',
      filePath: 'packages/fusion-kit-cli.md',
      level: 1,
    },
  ],
  migration: [
    {
      id: 'migration_v1_to_v2',
      title: 'Migration from v1.0 to v2.0',
      content: 'This guide covers migrating from version 1.0 to 2.0.',
      filePath: 'migration/v1-to-v2.md',
      level: 1,
    },
    {
      id: 'migration_breaking_changes',
      title: 'Breaking Changes',
      content: '- API endpoint changes\n- Configuration format updates',
      filePath: 'migration/v1-to-v2.md',
      level: 2,
    },
    {
      id: 'migration_steps',
      title: 'Migration Steps',
      content: '- Update dependencies\n- Run migration script\n- Test application',
      filePath: 'migration/v1-to-v2.md',
      level: 2,
    },
    {
      id: 'migration_code_changes',
      title: 'Code Changes',
      content: '```javascript\n// Before:\noldApi.method();\n\n// After:\nnewApi.method();\n```',
      filePath: 'migration/v1-to-v2.md',
      level: 2,
    },
  ],
  examples: [
    {
      id: 'examples_react_setup',
      title: 'React Setup Example',
      content: '```jsx\nimport React from "react";\nimport { FusionKit } from "fusion-kit-core";\n\nfunction App() {\n  return <div>Hello FusionKit</div>;\n}\n```',
      filePath: 'examples/react-setup.md',
      level: 1,
    },
  ],
  all: [],
};

// Set up the 'all' array with all sections
mockIndexedDocs.all = [...mockIndexedDocs.overview, ...mockIndexedDocs.packages, ...mockIndexedDocs.migration, ...mockIndexedDocs.examples];

// Mock the DocIndexer class
jest.mock('../utils/docIndexer', () => ({
  DocIndexer: jest.fn().mockImplementation(() => ({
    indexDocs: () => mockIndexedDocs,
  })),
}));

// Import the functions after mocking
import { getFusionKitOverview, getFusionKitPackages, getPackageDocumentation, getCodeExamples, getMigrationGuide } from '../tools/documentationTools';

describe('documentationTools', () => {
  describe('getFusionKitOverview', () => {
    it('should return complete overview when no section specified', async () => {
      const result = await getFusionKitOverview();

      expect(result).toEqual({
        introduction: 'FusionKit is a comprehensive framework for building modular applications.',
        keyBenefits: ['Modular architecture', 'Easy integration', 'Scalable solutions'],
        quickStart: 'Follow these steps to get started with FusionKit quickly.',
        deploymentScenarios: ['Standalone Applications: Run independently with full control.', 'Microfrontends in a Shell: Inherit shared services from parent shell.'],
      });
    });

    it('should return specific section when requested', async () => {
      const result = await getFusionKitOverview('keyBenefits');

      expect(result).toEqual({
        keyBenefits: ['Modular architecture', 'Easy integration', 'Scalable solutions'],
      });
    });

    it('should throw error for invalid section', async () => {
      await expect(getFusionKitOverview('invalidSection')).rejects.toThrow('Section "invalidSection" not found');
    });
  });

  describe('getFusionKitPackages', () => {
    it('should return all packages when no package name specified', async () => {
      const result = await getFusionKitPackages();

      expect(result).toEqual({
        'fusion-kit-core': 'Core functionality for FusionKit applications.',
        'fusion-kit-cli': 'Command-line interface for FusionKit development.',
      });
    });

    it('should return specific package when requested', async () => {
      const result = await getFusionKitPackages('core');

      expect(result).toEqual({
        core: 'Core functionality for FusionKit applications.',
      });
    });

    it('should throw error for non-existent package', async () => {
      await expect(getFusionKitPackages('nonexistent')).rejects.toThrow('Package "nonexistent" not found');
    });
  });

  describe('getPackageDocumentation', () => {
    it('should return complete package documentation', async () => {
      const result = await getPackageDocumentation('core');

      expect(result).toEqual({
        overview: 'Core functionality for FusionKit applications.',
        installation: 'Installation instructions not found in documentation',
        api: 'API documentation not found',
        examples: 'Examples not found in documentation',
      });
    });

    it('should return specific section when requested', async () => {
      const result = await getPackageDocumentation('core', 'overview');

      expect(result).toEqual({
        overview: 'Core functionality for FusionKit applications.',
      });
    });

    it('should throw error for invalid package name type', async () => {
      await expect(getPackageDocumentation(123 as any)).rejects.toThrow('Package name is required and must be a string, got: number');
    });

    it('should throw error for non-existent package', async () => {
      await expect(getPackageDocumentation('nonexistent')).rejects.toThrow('Documentation for package "nonexistent" not found');
    });

    it('should throw error for invalid section', async () => {
      await expect(getPackageDocumentation('core', 'invalidSection')).rejects.toThrow('Section "invalidSection" not found for package "core"');
    });
  });

  describe('getCodeExamples', () => {
    it('should return code example for specified use case', async () => {
      const result = await getCodeExamples('react');

      expect(result).toEqual({
        useCase: 'react',
        framework: 'react',
        code: 'import React from "react";\nimport { FusionKit } from "fusion-kit-core";\n\nfunction App() {\n  return <div>Hello FusionKit</div>;\n}',
      });
    });

    it('should return code example with specified framework', async () => {
      const result = await getCodeExamples('setup', 'react');

      expect(result).toEqual({
        useCase: 'setup',
        framework: 'react',
        code: 'import React from "react";\nimport { FusionKit } from "fusion-kit-core";\n\nfunction App() {\n  return <div>Hello FusionKit</div>;\n}',
      });
    });

    it('should throw error for invalid use case type', async () => {
      await expect(getCodeExamples(123 as any)).rejects.toThrow('Use case is required and must be a string, got: number');
    });

    it('should throw error when no examples found', async () => {
      await expect(getCodeExamples('nonexistent')).rejects.toThrow('No examples found for use case "nonexistent"');
    });
  });

  describe('getMigrationGuide', () => {
    it('should return complete migration guide', async () => {
      const result = await getMigrationGuide('v1.0');

      expect(result).toEqual({
        title: 'Migration from v1.0 to v2.0',
        overview: 'This guide covers migrating from version 1.0 to 2.0.',
        breakingChanges: ['API endpoint changes', 'Configuration format updates'],
        steps: ['Update dependencies', 'Run migration script', 'Test application'],
        codeChanges: '```javascript\n// Before:\noldApi.method();\n\n// After:\nnewApi.method();\n```',
      });
    });

    it('should return migration guide with custom to version', async () => {
      const result = await getMigrationGuide('v1.0', 'v3.0');

      // The title comes from the actual title section found in the mock data, not the generated title
      expect(result.title).toBe('Migration from v1.0 to v2.0');
      // But the function should still accept the toVersion parameter without error
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('breakingChanges');
    });

    it('should throw error for invalid from version type', async () => {
      await expect(getMigrationGuide(123 as any)).rejects.toThrow('From version is required and must be a string, got: number');
    });
  });
});
