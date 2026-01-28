import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#1976d2");

  // Load saved theme and primaryColor from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedPrimaryColor = localStorage.getItem("primaryColor");
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
      applyPrimaryColor(savedPrimaryColor);
    }
  }, []);

  // Function to apply primary color as CSS variable
  const applyPrimaryColor = (color) => {
    if (color) {
      // Apply as CSS custom property - this will override the default
      document.documentElement.style.setProperty('--primary-color', color);
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--color-primary', color);
      
      // Also update ring color for focus states
      document.documentElement.style.setProperty('--ring', color);
      
      // Convert hex to RGB for opacity variants
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
    }
  };

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    // Apply theme class to document root for global dark mode
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Apply primary color whenever it changes
  useEffect(() => {
    localStorage.setItem("primaryColor", primaryColor);
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  // Update theme from settings (used by ThemeSettings component)
  const updateTheme = (formData) => {
    if (formData) {
      if (typeof formData.darkMode === "boolean") {
        setTheme(formData.darkMode ? "dark" : "light");
      }
      if (formData.primaryColor) {
        setPrimaryColor(formData.primaryColor);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, primaryColor, toggleTheme, updateTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
