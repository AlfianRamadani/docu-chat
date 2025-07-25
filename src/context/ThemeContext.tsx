'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('docuchat-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine initial theme
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    setIsLoaded(true);

    // Apply theme to document with consistent className replacement
    if (shouldBeDark) {
      document.documentElement.className = 'scroll-smooth dark';
    } else {
      document.documentElement.className = 'scroll-smooth light';
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Save to localStorage
    localStorage.setItem('docuchat-theme', newDarkMode ? 'dark' : 'light');

    // Apply to document with consistent className replacement
    if (newDarkMode) {
      document.documentElement.className = 'scroll-smooth dark';
    } else {
      document.documentElement.className = 'scroll-smooth light';
    }
  };

  // Prevent flash of wrong theme
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: isDarkMode ? 'dark' : 'light', 
        toggleTheme, 
        isDarkMode 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};