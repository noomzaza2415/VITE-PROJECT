import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppResult from "../login/Result";
import MenuPage from "../home/menu";
import { Menu } from "antd";
import LoginPage from "../login/LoginPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Menu />,
    children: [
      { path: "menu", element: <MenuPage /> },
      { path: "result", element: <AppResult /> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
