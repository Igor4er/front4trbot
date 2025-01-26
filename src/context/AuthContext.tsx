import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => {
    // Check if username exists in localStorage
    return localStorage.getItem("username");
  });

  const login = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  const logout = () => {
    setUsername(null);
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
