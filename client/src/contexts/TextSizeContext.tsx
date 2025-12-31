import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_FONT_SIZE } from '../constants/visualization';

interface TextSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);

  return (
    <TextSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within TextSizeProvider');
  }
  return context;
};

