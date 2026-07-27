import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LandingPage } from "@/pages/LandingPage";
import { CreateRoomPage } from "@/pages/CreateRoomPage";
import { JoinRoomPage } from "@/pages/JoinRoomPage";
import { LiveRoomPage } from "@/pages/LiveRoomPage";

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <LandingPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/create"
          element={
            <>
              <Navbar />
              <CreateRoomPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/join"
          element={
            <>
              <Navbar />
              <JoinRoomPage />
              <Footer />
            </>
          }
        />
        <Route path="/room/:code" element={<LiveRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}