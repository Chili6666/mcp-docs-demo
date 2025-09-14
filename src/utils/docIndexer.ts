import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

/**
 * Represents a documentation section extracted from a markdown file
 */
export interface DocSection {
  /** Unique identifier for the section */
  id: string;
  /** Title of the section (from markdown heading) */
  title: string;
  /** Content of the section */
  content: string;
  /** Relative file path where this section was found */
  filePath: string;
  /** Heading level (1-6) */
  level: number;
}

/**
 * Structure containing categorized documentation sections
 */
export interface IndexedDocs {
  /** Overview and general documentation sections */
  overview: DocSection[];
  /** Package-specific documentation sections */
  packages: DocSection[];
  /** Migration guide sections */
  migration: DocSection[];
  /** Example and tutorial sections */
  examples: DocSection[];
  /** All sections combined */
  all: DocSection[];
}

/**
 * DocIndexer processes markdown files in a documentation directory and creates
 * a searchable index of all content sections organized by category.
 */
export class DocIndexer {
  // Fields
  /** Path to the documentation directory */
  private docsPath: string;
  /** Categorized collection of indexed documentation sections */
  private indexed: IndexedDocs;

  /**
   * Creates a new DocIndexer instance
   * @param docsPath - Path to the directory containing markdown documentation files
   */
  constructor(docsPath: string) {
    this.docsPath = docsPath;
    this.indexed = {
      overview: [],
      packages: [],
      migration: [],
      examples: [],
      all: []
    };
  }

  // Public methods
  /**
   * Processes all markdown files in the documentation directory and builds the index
   * @returns The complete indexed documentation structure
   */
  public indexDocs(): IndexedDocs {
    this.processDirectory(this.docsPath);
    return this.indexed;
  }

  /**
   * Searches for content matching the provided query across all indexed sections
   * @param query - Search term to look for in titles, content, and file paths
   * @returns Array of matching documentation sections
   */
  public findContent(query: string): DocSection[] {
    const queryLower = query.toLowerCase();
    return this.indexed.all.filter(section => 
      section.title.toLowerCase().includes(queryLower) ||
      section.content.toLowerCase().includes(queryLower) ||
      section.filePath.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Retrieves all sections belonging to a specific category
   * @param category - The documentation category to retrieve
   * @returns Array of sections in the specified category
   */
  public getByCategory(category: keyof IndexedDocs): DocSection[] {
    return this.indexed[category];
  }

  // Private methods
  /**
   * Recursively processes a directory, scanning for markdown files and subdirectories
   * @param dirPath - Path to the directory to process
   */
  private processDirectory(dirPath: string): void {
    try {
      const items = readdirSync(dirPath);
      
      // Process each item in the directory
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively process subdirectories
          this.processDirectory(fullPath);
        } else if (stat.isFile() && extname(item) === '.md') {
          // Process markdown files
          this.processMarkdownFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not process directory ${dirPath}:`, error);
    }
  }

  /**
   * Processes a single markdown file, extracting all sections and categorizing them
   * @param filePath - Full path to the markdown file to process
   */
  private processMarkdownFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(this.docsPath, filePath);
      const sections = this.extractSections(content, relativePath);
      
      // Categorize sections based on file path
      const category = this.categorizeByPath(relativePath);
      
      // Add sections to both the 'all' collection and the appropriate category
      sections.forEach(section => {
        this.indexed.all.push(section);
        this.indexed[category].push(section);
      });
      
    } catch (error) {
      console.warn(`Could not process file ${filePath}:`, error);
    }
  }

  /**
   * Parses markdown content and extracts individual sections based on heading structure
   * @param content - Raw markdown content to parse
   * @param filePath - Relative file path for reference
   * @returns Array of extracted documentation sections
   */
  private extractSections(content: string, filePath: string): DocSection[] {
    const sections: DocSection[] = [];
    const lines = content.split('\n');
    let currentSection: Partial<DocSection> | null = null;
    let contentLines: string[] = [];
    let inCodeBlock = false;
    
    for (const line of lines) {
      // Check if we're entering or leaving a code block
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        contentLines.push(line);
        continue;
      }
      
      // Only check for headings if we're not in a code block
      const headingMatch = !inCodeBlock ? line.trim().match(/^(#{1,6})\s+(.+)$/) : null;
      
      if (headingMatch) {
        // Save the previous section if it exists
        if (currentSection && currentSection.title) {
          sections.push({
            ...currentSection,
            content: contentLines.join('\n').trim()
          } as DocSection);
        }
        
        // Start a new section
        const level = headingMatch[1].length; // Count the # characters
        const title = headingMatch[2].trim(); // Extract heading text
        const id = this.generateId(title, filePath);
        
        currentSection = {
          id,
          title,
          filePath,
          level
        };
        contentLines = [];
      } else {
        // Add non-heading lines to current section content
        contentLines.push(line);
      }
    }
    
    // Don't forget to save the last section
    if (currentSection && currentSection.title) {
      sections.push({
        ...currentSection,
        content: contentLines.join('\n').trim()
      } as DocSection);
    }
    
    return sections;
  }

  /**
   * Determines the appropriate category for a documentation file based on its path
   * @param filePath - Relative file path to categorize
   * @returns The category key for organizing the content
   */
  private categorizeByPath(filePath: string): keyof Omit<IndexedDocs, 'all'> {
    const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
    
    // Categorize based on directory structure and file names
    if (normalizedPath.includes('overview') || normalizedPath === 'index.md') {
      return 'overview';
    } else if (normalizedPath.includes('package')) {
      return 'packages';
    } else if (normalizedPath.includes('migration')) {
      return 'migration';
    } else {
      // Default to examples for anything else (tutorials, guides, etc.)
      return 'examples';
    }
  }

  /**
   * Generates a unique identifier for a documentation section
   * @param title - The section title from the markdown heading
   * @param filePath - The file path where the section was found
   * @returns A unique string identifier combining file and title information
   */
  private generateId(title: string, filePath: string): string {
    // Create a file prefix by replacing path separators and removing extension
    const filePrefix = filePath.replace(/[/\\]/g, '_').replace(/\.md$/, '');
    
    // Create a URL-friendly slug from the title
    const titleSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
    
    return `${filePrefix}_${titleSlug}`;
  }
}