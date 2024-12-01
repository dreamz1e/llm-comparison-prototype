export interface ProcessedFile {
    path: string;
    content: string;
    language?: string;
}

export function getFileLanguage(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
    };
    
    return languageMap[extension || ''] || 'plaintext';
  }
  
  export function formatFilesForLLM(files: ProcessedFile[]): string {
    return files.map(file => 
      `\`\`\`${file.language}:${file.path}\n${file.content}\n\`\`\`\n\n`
    ).join('\n\n-------\n\n');
  }