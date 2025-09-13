// FusionKit Documentation Tools
import { join } from 'path';
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

// Initialize the doc indexer
const docsPath = join(process.cwd(), 'docs');
const docIndexer = new DocIndexer(docsPath);
let indexedDocs: IndexedDocs;

// Initialize docs on first use
const getIndexedDocs = (): IndexedDocs => {
  if (!indexedDocs) {
    indexedDocs = docIndexer.indexDocs();
  }
  return indexedDocs;
};

// Helper function to extract list items from markdown content
const extractListItems = (content: string): string[] => {
  const lines = content.split('\n');
  const items: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      items.push(trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '$1').trim());
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
  
  const overview: FusionKitOverview = {
    introduction: introSection?.content || 'No introduction found in documentation',
    keyBenefits: benefitsSection ? extractListItems(benefitsSection.content) : [],
    quickStart: quickStartSection?.content || 'No quick start guide found in documentation',
    deploymentScenarios: deploymentSection ? extractListItems(deploymentSection.content) : []
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
    if (section.level === 1 && section.title.startsWith('fusion-kit-')) {
      const packageKey = section.title;
      const description = section.content.split('\n')[0] || 'FusionKit package';
      packages[packageKey] = description;
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
  const docs = getIndexedDocs();
  const packageSections = docs.packages;
  
  // Find the package file sections
  const packageFileName = `fusion-kit-${packageName}`;
  const packageFileSections = packageSections.filter(s => 
    s.filePath.toLowerCase().includes(packageFileName.toLowerCase()) ||
    s.filePath.toLowerCase().includes(packageName.toLowerCase())
  );
  
  if (packageFileSections.length === 0) {
    throw new Error(`Documentation for package "${packageName}" not found`);
  }
  
  // Extract different sections of documentation
  const overviewSection = packageFileSections.find(s => 
    s.title.toLowerCase().includes('purpose') || 
    s.level === 1 ||
    s.content.length > 100
  );
  
  const installationContent = packageFileSections.find(s => 
    s.content.includes('npm install') || 
    s.content.includes('install')
  )?.content.match(/npm install[^\n]*/)?.[0] || 'Installation instructions not found in documentation';
  
  const apiSection = packageFileSections.find(s => 
    s.title.toLowerCase().includes('api') ||
    s.title.toLowerCase().includes('interface') ||
    s.title.toLowerCase().includes('features')
  );
  
  const exampleSection = packageFileSections.find(s => 
    s.title.toLowerCase().includes('example') ||
    s.title.toLowerCase().includes('usage') ||
    s.content.includes('```')
  );
  
  const packageDoc: PackageDocumentation = {
    overview: overviewSection?.content || 'Package overview not found in documentation',
    installation: installationContent,
    api: apiSection?.content || 'API documentation not found',
    examples: exampleSection?.content || 'Examples not found in documentation'
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
  const docs = getIndexedDocs();
  const exampleSections = docs.examples;
  
  const useFramework = framework || 'react';
  
  // Find sections that match the use case
  const relevantSections = exampleSections.filter(section => 
    section.title.toLowerCase().includes(useCase.toLowerCase()) ||
    section.content.toLowerCase().includes(useCase.toLowerCase()) ||
    section.filePath.toLowerCase().includes(useCase.toLowerCase())
  );
  
  if (relevantSections.length === 0) {
    // Fallback: search in all sections for the use case
    const allSections = docs.all.filter(section =>
      section.content.includes('```') && (
        section.title.toLowerCase().includes(useCase.toLowerCase()) ||
        section.content.toLowerCase().includes(useCase.toLowerCase())
      )
    );
    
    if (allSections.length === 0) {
      throw new Error(`No examples found for use case "${useCase}"`);
    }
    
    relevantSections.push(...allSections);
  }
  
  // Look for framework-specific examples first
  let selectedSection = relevantSections.find(section => 
    section.title.toLowerCase().includes(useFramework.toLowerCase()) ||
    section.content.toLowerCase().includes(useFramework.toLowerCase())
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
    code: code || 'No code examples found in documentation'
  };
};

export const getMigrationGuide = async (fromVersion: string, toVersion?: string): Promise<MigrationGuide> => {
  const docs = getIndexedDocs();
  const migrationSections = docs.migration;
  
  // Find relevant migration guide sections
  const titleSection = migrationSections.find(s => 
    s.title.toLowerCase().includes(fromVersion) || 
    s.title.toLowerCase().includes('migration')
  );
  
  const overviewSection = migrationSections.find(s => 
    s.title.toLowerCase().includes('overview') ||
    s.content.length > 50
  );
  
  const breakingChangesSection = migrationSections.find(s => 
    s.title.toLowerCase().includes('breaking') ||
    s.title.toLowerCase().includes('changes')
  );
  
  const stepsSection = migrationSections.find(s => 
    s.title.toLowerCase().includes('steps') ||
    s.title.toLowerCase().includes('migration guide')
  );
  
  const codeChangesSection = migrationSections.find(s => 
    s.content.includes('```') ||
    s.content.includes('Before:') ||
    s.content.includes('After:')
  );
  
  const guide: MigrationGuide = {
    title: titleSection?.title || `Migration from ${fromVersion} to ${toVersion || 'latest'}`,
    overview: overviewSection?.content || 'No migration guide overview found in documentation',
    breakingChanges: breakingChangesSection ? extractListItems(breakingChangesSection.content) : [],
    steps: stepsSection ? extractListItems(stepsSection.content) : [],
    codeChanges: codeChangesSection?.content || 'No code changes documentation found'
  };

  return guide;
};