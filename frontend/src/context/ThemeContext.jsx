import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);


  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  // Update theme from settings (used by ThemeSettings component)
  const updateTheme = (formData) => {
    if (formData) {
      if (typeof formData.darkMode === "boolean") {
        setTheme(formData.darkMode ? "dark" : "light");
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
