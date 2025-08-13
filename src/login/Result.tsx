import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { FrownOutlined } from "@ant-design/icons";

const AppResult: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Result
        icon={<FrownOutlined style={{ fontSize: "64px", color: "#faad14" }} />}
        status="403"
        title="คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
        subTitle="โปรดตรวจสอบบทบาทผู้ใช้ของคุณ หรือกลับไปที่หน้าเข้าสู่ระบบ"
        extra={
          <Button type="primary" size="large" onClick={handleBack}>
            กลับไปยังหน้าเข้าสู่ระบบ
          </Button>
        }
        style={{
          backgroundColor: "#fff",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: 480,
          width: "100%",
        }}
      />
    </div>
  );
};

export default AppResult;
