// PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    // ยังไม่ล็อกอิน
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // ไม่มีสิทธิ์เข้าถึง
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // render child routes
};

export default PrivateRoute;
