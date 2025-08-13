import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./login/LoginPage";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "./AuthContext";
// Home & Menu
import Home from "./home/home";
import MenuPage from "./home/menu";
import PieChartPage from "./home/piechart";
import LeaveForm from "./home/form";
import LeaveListPage from "./LeaveListPage/listpage";
import ApproveLeavePage from "./approveleave/approveleave";
import UserManagement from "./components/UserManagement/UserManagement";
import AppResult from "./login/Result";
import PasswordTest from "./home/PasswordTest"; // ✅ เพิ่ม import

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login & Result */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/result" element={<AppResult />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={<PrivateRoute allowedRoles={["student"]} />}
        >
          <Route element={<MenuPage />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="home/:id" element={<Home />} />
            <Route path="piechart" element={<PieChartPage />} />
            <Route path="form" element={<LeaveForm />} />
            <Route path="listpage" element={<LeaveListPage />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={<PrivateRoute allowedRoles={["teacher"]} />}
        >
          <Route element={<MenuPage />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="home/:id" element={<Home />} />
            <Route path="piechart" element={<PieChartPage />} />
            <Route path="approveleave" element={<ApproveLeavePage />} />
            <Route path="listpage" element={<LeaveListPage />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<PrivateRoute allowedRoles={["admin"]} />}
        >
          <Route element={<MenuPage />}>
            <Route index element={<Navigate to="usermanagement" replace />} />
            <Route path="usermanagement" element={<UserManagement />} />
            <Route path="listpage" element={<LeaveListPage />} />
            <Route path="approveleave" element={<ApproveLeavePage />} />
            <Route path="form" element={<LeaveForm />} />
            <Route path="home" element={<Home />} />
            <Route path="home/:id" element={<Home />} />
            <Route path="piechart" element={<PieChartPage />} />
            <Route path="passwordtest" element={<PasswordTest />} /> {/* ✅ เพิ่มเส้นทาง */}
            <Route path="*" element={<Navigate to="usermanagement" replace />} />
          </Route>
        </Route>

        {/* Fallback - 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
