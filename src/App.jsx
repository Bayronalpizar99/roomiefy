import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import * as ScrollArea from "@radix-ui/react-scroll-area";

// 1. Importa el AuthProvider
import { AuthProvider } from "./context/AuthContext";

// Importa tus componentes y páginas
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme);
  }, [theme]);

  return (
    // 2. Envuelve toda la aplicación con AuthProvider
    <AuthProvider>
      <div className="app-layout">
        <Navbar toggleTheme={toggleTheme} />

        <ScrollArea.Root className="main-content-area">
          <ScrollArea.Viewport className="scroll-area-viewport">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="roomies" element={<RoomiesPage />} />
              <Route path="publicar" element={<PublishPage />} />
              <Route
                path="/propiedad/:propertyId"
                element={<PropertyDetailPage />}
              />
              <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
              <Route path="perfil" element={<ProfilePage />} />
            </Routes>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="scroll-area-scrollbar"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="scroll-area-thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </AuthProvider>
  );
}

export default App;
