import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddPlant from "./pages/AddPlant";
import PlantDetail from "./pages/PlantDetail";
import Diagnose from "./pages/Diagnose";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth-routes";
import MobileAuthCallbackListener from "./components/MobileAuthCallbackListener";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MobileAuthCallbackListener />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-plant" element={<AddPlant />} />
            <Route path="/plant/:id" element={<PlantDetail />} />
            <Route path="/plant/:id/diagnose" element={<Diagnose />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
