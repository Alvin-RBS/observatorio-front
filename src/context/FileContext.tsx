"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FileContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <FileContext.Provider value={{ uploadedFile, setUploadedFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile deve ser usado dentro de um FileProvider");
  }
  return context;
}