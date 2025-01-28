import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Layout from "./layout";
import AddConfig from "./pages/AddConfig";
import Bot from "./pages/Bot";
import Bots from "./pages/Bots";
import Config from "./pages/Config";
import Settings from "./pages/Settings";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/config" element={<Config />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/config/add" element={<AddConfig />} />
              <Route path="/bots" element={<Bots />} />
              <Route path="/bots/:id" element={<Bot />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}
