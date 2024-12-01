import { useState, useCallback } from 'react';
import { ProcessedFile, getFileLanguage, formatFilesForLLM } from '@/types/fileProcessing';

interface FileUploadProps {
  onFilesProcessed: (formattedContent: string, files: ProcessedFile[]) => void;
}

export default function FileUpload({ onFilesProcessed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (items: DataTransferItemList | FileList) => {
    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];

    const processEntry = async (entry: FileSystemEntry | null, path: string = '') => {
      if (!entry) return;

      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise<void>((resolve) => {
          fileEntry.file(async (file) => {
            const content = await file.text();
            processedFiles.push({
              path: path + file.name,
              content,
              language: getFileLanguage(file.name)
            });
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries) => {
            const promises = entries.map(entry => 
              processEntry(entry, path + dirEntry.name + '/')
            );
            await Promise.all(promises);
            resolve();
          });
        });
      }
    };

    try {
      if (items instanceof DataTransferItemList) {
        const entries = Array.from(items)
          .map(item => item.webkitGetAsEntry());
        await Promise.all(entries.map(entry => processEntry(entry)));
      } else {
        // Handle regular file input
        for (const file of Array.from(items)) {
          const content = await file.text();
          processedFiles.push({
            path: file.name,
            content,
            language: getFileLanguage(file.name)
          });
        }
      }

      const formattedContent = formatFilesForLLM(processedFiles);
      onFilesProcessed(formattedContent, processedFiles);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.items);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isProcessing ? 'opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        multiple
        directory=""
        webkitdirectory=""
        className="hidden"
        onChange={handleFileInput}
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer block"
      >
        {isProcessing ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Processing files...</span>
          </div>
        ) : (
          <>
            <div className="text-gray-600">
              Drag and drop files or folders here, or click to select
            </div>
          </>
        )}
      </label>
    </div>
  );
}