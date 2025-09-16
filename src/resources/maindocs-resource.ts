import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs/promises';
import path from 'path';

export const registerMainDocsResource = async (mcpServer: McpServer): Promise<void> => {
  const docsPath = 'D:/dev/myGithub/mcp-docs-demo/docs';

  try {
    await fs.access(docsPath);
    console.log(`Scanning markdown files in: ${docsPath}`);
    await registerDocuments(docsPath, mcpServer);
    console.log('Registration completed!');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Cannot access directory ${docsPath}:`, error.message);
    } else {
      console.error(`Cannot access directory ${docsPath}:`, error);
    }
  }
};

// Function to recursively scan directory and register markdown files
const registerDocuments = async (docsPath: string, mcpServer: McpServer): Promise<void> => {
  try {
    const files = await fs.readdir(docsPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(docsPath, file.name);

      if (file.isDirectory()) {
        await registerDocuments(fullPath, mcpServer);
      } else if (file.isFile() && file.name.endsWith('.md')) {
        const resourceId = fullPath.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

        mcpServer.registerResource(
          resourceId,
          new ResourceTemplate(`file://docs/{filename}`, {
            list: undefined,
            complete: {
              filename: async () => [file.name],
            },
          }),
          {
            title: `Document: ${file.name}`,
            description: `Markdown document from ${fullPath}`,
          },
          async (uri, { }) => {
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            return {
              contents: [
                {
                  uri: uri.href,
                  text: fileContent,
                  mimeType: 'text/markdown',
                },
              ],
            };
          },
        );

        console.log(`Registered: ${file.name}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error scanning directory ${docsPath}:`, error.message);
    } else {
      console.error(`Error scanning directory ${docsPath}:`, error);
    }
  }
};
