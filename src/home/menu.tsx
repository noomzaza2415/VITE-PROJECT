import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import bkLogo from "../assets/bk.jpg";

import {
  Layout,
  Menu,
  Button,
  Grid,
  Space,
  message,
  Popconfirm,
  Drawer,
} from "antd";
import {
  FormOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  FileTextOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

import { useAuth } from "../AuthContext";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MenuPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const { user, logout } = useAuth();

  const selectedKey = location.pathname.split("/").pop();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // ปรับ collapsed และซ่อน drawer ตามขนาดหน้าจอ
  useEffect(() => {
    if (screens.md) {
      setCollapsed(false); // เปิดเมนูบนจอ md+
      setDrawerVisible(false); // ปิด drawer
    } else {
      setCollapsed(true); // พับเมนูบนมือถือ
    }
  }, [screens.md]);

  const onClick: MenuProps["onClick"] = (e) => {
    const basePath =
      user?.role === "teacher"
        ? "/teacher"
        : user?.role === "admin"
        ? "/Admin"
        : "/student";
    navigate(`${basePath}/${e.key}`);

    // ปิด drawer หลังเลือกเมนูบนมือถือ
    if (!screens.md) {
      setDrawerVisible(false);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleLogout = () => {
    logout();
    message.success("ออกจากระบบเรียบร้อยแล้ว");
    navigate("/login");
  };

  if (!user) return null;

  const teacherItems: MenuProps["items"] = [
    { key: "home", icon: <IdcardOutlined />, label: "ข้อมูลนักเรียนนักศึกษา" },
    {
      key: "approveleave",
      icon: <CheckCircleOutlined />,
      label: "หน้าอนุมัติคำขอลา",
    },
    {
      key: "listpage",
      icon: <FileTextOutlined />,
      label: "รายการการลาทั้งหมด",
    },
  ];

  const studentItems: MenuProps["items"] = [
    { key: "piechart", icon: <PieChartOutlined />, label: "สถิติการลา" },
    { key: "home", icon: <IdcardOutlined />, label: "ข้อมูลนักเรียนนักศึกษา" },
    {
      key: "form",
      icon: <FormOutlined />,
      label: "แบบฟอร์มขอลานักเรียน/นักศึกษา",
    },
    {
      key: "listpage",
      icon: <FileTextOutlined />,
      label: "รายการการลาทั้งหมด",
    },
  ];

  const adminItems: MenuProps["items"] = [
    { key: "UserManagement", icon: <TeamOutlined />, label: "จัดการผู้ใช้งาน" },
    {
      key: "form",
      icon: <FormOutlined />,
      label: "แบบฟอร์มขอลานักเรียน/นักศึกษา",
    },
    {
      key: "approveleave",
      icon: <CheckCircleOutlined />,
      label: "หน้าอนุมัติคำขอลา",
    },
    {
      key: "listpage",
      icon: <FileTextOutlined />,
      label: "หน้ารออนุมัติคำขอลา",
    },
    { key: "home", icon: <IdcardOutlined />, label: "ข้อมูลนักเรียนนักศึกษา" },
    { key: "piechart", icon: <PieChartOutlined />, label: "สถิติการลา" },
  ];

  const items: MenuProps["items"] = [
    ...(user.role === "teacher" ? teacherItems : []),
    ...(user.role === "student" ? studentItems : []),
    ...(user.role === "admin" ? adminItems : []),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar สำหรับจอ md+ */}
      {screens.md && (
        <Sider
          collapsible
          collapsed={collapsed}
          collapsedWidth={60}
          breakpoint="md"
          onBreakpoint={(broken) => setCollapsed(broken)}
          theme="light"
          width={250}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingTop: 8,
            paddingBottom: 8,
            overflowY: "auto",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          {/* โลโก้ */}
          <div
            style={{
              height: collapsed ? 30 : 120, // ให้เท่ากับความสูงโลโก้
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 60, // ไม่ต้องมี padding ถ้าอยากให้โลโก้เต็มพอดี
              backgroundColor: "#ffff",
              borderBottom: "1px solidrgb(255, 255, 255)",
              transition: "all 0.1s ease",
            }}
          >
            <img
              src={bkLogo}
              alt="Logo"
              style={{
                height: collapsed ? 30 : 120, // ตามที่คุณกำหนดไว้
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>

          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[selectedKey || ""]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            onClick={onClick}
            items={items}
            style={{ marginTop: 16 }}
          />

          {/* ปุ่ม logout + toggle */}
          <div style={{ textAlign: "center", padding: 8 }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Popconfirm
                title="คุณแน่ใจหรือไม่ว่าจะออกจากระบบ?"
                okText="ใช่"
                cancelText="ยกเลิก"
                onConfirm={handleLogout}
              >
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  block
                  size={screens.xs ? "small" : "middle"}
                >
                  {!collapsed && "ออกจากระบบ"}
                </Button>
              </Popconfirm>

              <Button
                type="default"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                block
                size={screens.xs ? "small" : "middle"}
              />
            </Space>
          </div>
        </Sider>
      )}

      {/* ปุ่มเปิด Drawer สำหรับมือถือ xs */}
      {!screens.md && (
        <Button
          type="primary"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ position: "fixed", top: 16, left: 16, zIndex: 1000 }}
          size="large"
          shape="circle"
        />
      )}

      <Drawer
        title={
          <img
            src={bkLogo}
            alt="Logo"
            style={{ height: 50, width: "auto", objectFit: "contain" }}
          />
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{
          header: { padding: "16px 24px" },
          body: { padding: 0 },
        }}
        width={250}
        maskClosable
      >
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[selectedKey || ""]}
          onClick={onClick}
          items={items}
          style={{ height: "100%", borderRight: 0 }}
        />

        <div style={{ padding: 16, textAlign: "center" }}>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ว่าจะออกจากระบบ?"
            okText="ใช่"
            cancelText="ยกเลิก"
            onConfirm={() => {
              setDrawerVisible(false);
              handleLogout();
            }}
          >
            <Button danger icon={<LogoutOutlined />} block>
              ออกจากระบบ
            </Button>
          </Popconfirm>
        </div>
      </Drawer>

      <Layout>
        <Content
          style={{
            margin: 0,
            padding: screens.xs ? 12 : 24,
            background: "#fff",
            overflow: "auto",
            minHeight: "100vh",
            transition: "all 0.3s ease",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MenuPage;
