import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Calculator from "./pages/Calculator";
import Results from "./pages/Results";
import Roadmap from "./pages/Roadmap";
import TargetRoadmap from "./pages/TargetRoadmap";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/target-roadmap"
          element={
            <ProtectedRoute>
              <TargetRoadmap />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;