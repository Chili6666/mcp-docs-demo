// FusionKit Documentation Tools
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DocIndexer, IndexedDocs } from '../utils/docIndexer.js';

interface FusionKitOverview {
  introduction: string;
  keyBenefits: string[];
  quickStart: string;
  deploymentScenarios: string[];
}

interface PackageDocumentation {
  overview: string;
  installation: string;
  api: string;
  examples: string;
}

interface MigrationGuide {
  title: string;
  overview: string;
  breakingChanges: string[];
  steps: string[];
  codeChanges: string;
}

interface CodeExample {
  useCase: string;
  framework: string;
  code: string;
}

// Initialize the doc indexer with absolute path
// The MCP server might run from a different working directory, so we use absolute path
const docsPath = 'D:/dev/myGithub/mcp-docs-demo/docs';
const docIndexer = new DocIndexer(docsPath);

// Get fresh docs every time (no caching for development)
const getIndexedDocs = (): IndexedDocs => {
  return docIndexer.indexDocs();
};

// Helper function to extract list items from markdown content
const extractListItems = (content: string): string[] => {
  const lines = content.split('\n');
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      items.push(
        trimmed
          .substring(2)
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .trim(),
      );
    }
  }

  return items.length > 0 ? items : [];
};

// Helper function to extract code blocks from markdown content
const extractCodeBlocks = (content: string): string[] => {
  const codeBlocks: string[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        if (currentBlock.length > 0) {
          codeBlocks.push(currentBlock.join('\n'));
        }
        currentBlock = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  // Handle unclosed code block
  if (inCodeBlock && currentBlock.length > 0) {
    codeBlocks.push(currentBlock.join('\n'));
  }

  return codeBlocks;
};

export const getFusionKitOverview = async (section?: string): Promise<FusionKitOverview | Partial<FusionKitOverview>> => {
  const docs = getIndexedDocs();
  const overviewSections = docs.overview;

  // Extract key information from indexed content
  const introSection = overviewSections.find(s => s.title.toLowerCase().includes('what is fusionkit'));
  const benefitsSection = overviewSections.find(s => s.title.toLowerCase().includes('key benefits'));
  const quickStartSection = overviewSections.find(s => s.title.toLowerCase().includes('quick start'));
  const deploymentSection = overviewSections.find(s => s.title.toLowerCase().includes('deployment scenarios'));

  // Get deployment scenarios from subsections since the main section has no direct content
  const standaloneSection = overviewSections.find(s => s.title.toLowerCase().includes('standalone applications'));
  const microfrontendSection = overviewSections.find(s => s.title.toLowerCase().includes('microfrontends in a shell'));

  const deploymentScenarios: string[] = [];
  if (standaloneSection) {
    deploymentScenarios.push(`Standalone Applications: ${standaloneSection.content.split('\n')[0] || 'Run independently'}`);
  }
  if (microfrontendSection) {
    deploymentScenarios.push(`Microfrontends in a Shell: ${microfrontendSection.content.split('\n')[0] || 'Inherit shared services'}`);
  }

  const overview: FusionKitOverview = {
    introduction: introSection?.content || 'No introduction found in documentation',
    keyBenefits: benefitsSection ? extractListItems(benefitsSection.content) : [],
    quickStart: quickStartSection?.content || 'No quick start guide found in documentation',
    deploymentScenarios: deploymentScenarios,
  };

  if (!section || section === 'all') {
    return overview;
  }

  if (section in overview) {
    return { [section]: overview[section as keyof FusionKitOverview] };
  }

  throw new Error(`Section "${section}" not found`);
};

export const getFusionKitPackages = async (packageName?: string): Promise<Record<string, string> | { [key: string]: string }> => {
  const docs = getIndexedDocs();
  const packageSections = docs.packages;

  const packages: Record<string, string> = {};

  // Extract package information from indexed docs
  for (const section of packageSections) {
    if (section.level === 1) {
      const title = section.title.toLowerCase();
      // Match various title formats for packages
      if (title.startsWith('fusion-kit-') || title.includes('fusion kit')) {
        let packageKey = section.title;

        // Normalize package keys to consistent format
        if (title.includes('cli')) {
          packageKey = 'fusion-kit-cli';
        } else if (title.includes('module federation')) {
          packageKey = 'fusion-kit-module-federation';
        } else if (title.includes('contracts')) {
          packageKey = 'fusion-kit-contracts';
        } else if (title.includes('keycloak')) {
          packageKey = 'fusion-kit-keycloak';
        } else if (title.includes('core')) {
          packageKey = 'fusion-kit-core';
        }

        const description = section.content.split('\n')[0] || 'FusionKit package';
        packages[packageKey] = description;
      }
    }
  }

  // If no packages found in docs, return empty object
  if (Object.keys(packages).length === 0) {
    throw new Error('No package documentation found in indexed content');
  }

  if (packageName) {
    const key = `fusion-kit-${packageName}`;
    const packageInfo = packages[key] || packages[packageName];
    if (packageInfo) {
      return { [packageName]: packageInfo };
    } else {
      throw new Error(`Package "${packageName}" not found`);
    }
  }

  return packages;
};

export const getPackageDocumentation = async (packageName: string, section?: string): Promise<PackageDocumentation | Partial<PackageDocumentation>> => {
  if (!packageName || typeof packageName !== 'string') {
    throw new Error(`Package name is required and must be a string, got: ${typeof packageName}`);
  }

  const docs = getIndexedDocs();
  const packageSections = docs.packages;

  // Find the package file sections
  const packageFileName = `fusion-kit-${packageName}`;
  const packageFileSections = packageSections.filter(
    s => s.filePath.toLowerCase().includes(packageFileName.toLowerCase()) || s.filePath.toLowerCase().includes(packageName.toLowerCase()),
  );

  if (packageFileSections.length === 0) {
    throw new Error(`Documentation for package "${packageName}" not found`);
  }

  // Extract different sections of documentation
  const overviewSection = packageFileSections.find(s => s.title.toLowerCase().includes('purpose') || s.level === 1 || s.content.length > 100);

  // Prioritize sections with actual npm install commands
  let installationSection = packageFileSections.find(s => s.content.includes('npm install'));
  if (!installationSection) {
    // Fallback to sections with "install" in content
    installationSection = packageFileSections.find(s => s.content.includes('install'));
  }

  const installationContent = installationSection?.content.match(/npm install[^\n]*/)?.[0] || 'Installation instructions not found in documentation';

  const apiSection = packageFileSections.find(
    s =>
      s.title.toLowerCase().includes('api') ||
      s.title.toLowerCase().includes('interface') ||
      s.title.toLowerCase().includes('features') ||
      s.title.toLowerCase().includes('commands'),
  );

  const exampleSection = packageFileSections.find(s => s.title.toLowerCase().includes('example') || s.title.toLowerCase().includes('usage') || s.content.includes('```'));

  const packageDoc: PackageDocumentation = {
    overview: overviewSection?.content || 'Package overview not found in documentation',
    installation: installationContent,
    api: apiSection?.content || 'API documentation not found',
    examples: exampleSection?.content || 'Examples not found in documentation',
  };

  if (!section || section === 'all') {
    return packageDoc;
  }

  if (section in packageDoc) {
    return { [section]: packageDoc[section as keyof PackageDocumentation] };
  }

  throw new Error(`Section "${section}" not found for package "${packageName}"`);
};

export const getCodeExamples = async (useCase: string, framework?: string): Promise<CodeExample> => {
  if (!useCase || typeof useCase !== 'string') {
    throw new Error(`Use case is required and must be a string, got: ${typeof useCase}`);
  }

  const docs = getIndexedDocs();

  const useFramework = framework || 'react';

  // Search all sections for the use case since examples might be embedded anywhere
  const relevantSections = docs.all.filter(
    section =>
      section.content.includes('```') &&
      (section.title.toLowerCase().includes(useCase.toLowerCase()) ||
        section.content.toLowerCase().includes(useCase.toLowerCase()) ||
        section.filePath.toLowerCase().includes(useCase.toLowerCase())),
  );

  if (relevantSections.length === 0) {
    throw new Error(`No examples found for use case "${useCase}"`);
  }

  // Look for framework-specific examples first
  let selectedSection = relevantSections.find(
    section => section.title.toLowerCase().includes(useFramework.toLowerCase()) || section.content.toLowerCase().includes(useFramework.toLowerCase()),
  );

  // If no framework-specific example found, use the first relevant section
  if (!selectedSection) {
    selectedSection = relevantSections[0];
  }

  // Extract code blocks from the content
  const codeBlocks = extractCodeBlocks(selectedSection.content);
  const code = codeBlocks.length > 0 ? codeBlocks.join('\n\n') : selectedSection.content;

  return {
    useCase,
    framework: useFramework,
    code: code || 'No code examples found in documentation',
  };
};

export const getMigrationGuide = async (fromVersion: string, toVersion?: string): Promise<MigrationGuide> => {
  if (!fromVersion || typeof fromVersion !== 'string') {
    throw new Error(`From version is required and must be a string, got: ${typeof fromVersion}`);
  }

  const docs = getIndexedDocs();
  const migrationSections = docs.migration;

  // Find relevant migration guide sections
  const titleSection = migrationSections.find(s => s.title.toLowerCase().includes(fromVersion) || s.title.toLowerCase().includes('migration'));

  const overviewSection = migrationSections.find(s => s.title.toLowerCase().includes('overview') || s.content.length > 50);

  const breakingChangesSection = migrationSections.find(s => s.title.toLowerCase().includes('breaking') || s.title.toLowerCase().includes('changes'));

  const stepsSection = migrationSections.find(s => s.title.toLowerCase().includes('steps') || s.title.toLowerCase().includes('migration guide'));

  const codeChangesSection = migrationSections.find(s => s.content.includes('```') || s.content.includes('Before:') || s.content.includes('After:'));

  const guide: MigrationGuide = {
    title: titleSection?.title || `Migration from ${fromVersion} to ${toVersion || 'latest'}`,
    overview: overviewSection?.content || 'No migration guide overview found in documentation',
    breakingChanges: breakingChangesSection ? extractListItems(breakingChangesSection.content) : [],
    steps: stepsSection ? extractListItems(stepsSection.content) : [],
    codeChanges: codeChangesSection?.content || 'No code changes documentation found',
  };

  return guide;
};
