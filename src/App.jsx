import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import AuthCallback from "./pages/auth/Callback";
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/StudentProfile";
import LandlordDashboard from "./pages/landlord/LandlordDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;