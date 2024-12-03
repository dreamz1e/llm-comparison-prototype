export type CodeFile = {
  relativePath: string;
  content: string;
  language: string;
};

export type FolderStructure = {
  files: CodeFile[];
};
