import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { authService } from "../services/authService";

export default function ProtectedRoute() {
  const token = localStorage.getItem("savelkr_token");
  const user = localStorage.getItem("savelkr_user");
  if (!token || !user) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-shell d-flex">
      <Sidebar />
      <main className="content-area"><Outlet /></main>
    </div>
  );
}
