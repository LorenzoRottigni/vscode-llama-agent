export const buildRefactorRequest = (
    request: string,
    sourceCode: string
) => `
    Given the following file:
    ${sourceCode}
    
	Process it following these rules:
	- ${request}
    - provide as output the whole updated file
`;

export function extractMarkdownSections(input: string): string[] {
  const regex = /```([\s\S]*?)```/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1].trim());
  }

  return matches;
}