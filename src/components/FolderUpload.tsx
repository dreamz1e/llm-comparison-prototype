"use client";

import { useState, useCallback } from "react";
import { CodeFile, FolderStructure } from "../types/FileTypes";

interface FolderUploadProps {
  onStructureUpdate: (files: CodeFile[]) => void;
}

const FolderUpload = ({ onStructureUpdate }: FolderUploadProps) => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({
    files: [],
  });
  const [isDragging, setIsDragging] = useState(false);

  const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const languageMap: { [key: string]: string } = {
      js: "JavaScript",
      jsx: "JavaScript (React)",
      ts: "TypeScript",
      tsx: "TypeScript (React)",
      json: "JSON",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      md: "Markdown",
      yml: "YAML",
      yaml: "YAML",
    };
    return languageMap[extension] || "Plain Text";
  };

  const processFiles = async (items: DataTransferItemList) => {
    const files: CodeFile[] = [];

    const readFile = async (
      entry: FileSystemEntry,
      path: string = ""
    ): Promise<void> => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          fileEntry.file(async (file) => {
            const relativePath = path ? `${path}/${file.name}` : file.name;
            const content = await file.text();
            files.push({
              relativePath,
              content,
              language: getFileLanguage(file.name),
            });
            resolve();
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const dirReader = dirEntry.createReader();
          dirReader.readEntries(async (entries) => {
            const promises = entries.map((subEntry) =>
              readFile(subEntry, path ? `${path}/${entry.name}` : entry.name)
            );
            await Promise.all(promises);
            resolve();
          });
        }
      });
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          promises.push(readFile(entry));
        }
      }
    }

    await Promise.all(promises);
    setFolderStructure({ files });
    onStructureUpdate(files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.items) {
        await processFiles(e.dataTransfer.items);
      }
    },
    [onStructureUpdate]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop folder here"
      >
        <div className="text-lg mb-2 text-gray-900 font-medium">
          {isDragging ? "Drop your folder here" : "Drag and drop a folder here"}
        </div>
        <p className="text-sm text-gray-600">
          Your folder will be processed and its structure will be analyzed
        </p>
      </div>

      {folderStructure.files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Processed Files ({folderStructure.files.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {folderStructure.files.map((file, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-900">{file.relativePath}</p>
                <p className="text-sm text-gray-600">
                  Language: {file.language}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderUpload;
