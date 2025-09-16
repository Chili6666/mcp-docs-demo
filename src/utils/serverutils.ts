import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Creates a successful response.
 * @param text - text content of the response
 * @returns CallToolResult
 */
export const createResponse = (text: string): CallToolResult => {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    isError: false,
  };
};

/**
 * Creates an error response.
 * @param text - error text
 * @returns CallToolResult
 */
export const createError = (text: string): CallToolResult => {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    isError: true,
  };
};
