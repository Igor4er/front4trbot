import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  username: string | null;
  token: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, password: string) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem("username");
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [isAuth, setIsAuth] = useState<boolean>(() => {
    // Check if both username and token exist in localStorage
    return !!(
      localStorage.getItem("username") && localStorage.getItem("token")
    );
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login: username, password }),
        },
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      const { token } = data;

      setUsername(username);
      setToken(token);
      setIsAuth(true);
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUsername(null);
    setToken(null);
    setIsAuth(false);
    localStorage.removeItem("username");
    localStorage.removeItem("token");
  };

  const signup = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login: username, password }),
        },
      );

      if (!response.ok) {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ username, token, isAuth, login, logout, signup }}
    >
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
