/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import logo from "../assets/bk.jpg";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    const { studentId, password } = values;
    console.log("🔍 ตรวจสอบ:", { studentId, password });

    try {
      // ✅ ดึงข้อมูลผู้ใช้ทั้งหมด
      const res = await fetch("http://localhost:3001/users");
      const users = await res.json();

      // ✅ หาผู้ใช้ที่ตรงกับ studentId
      const matchedUser = users.find(
        (user: any) => user.studentId === studentId
      );

      if (!matchedUser) {
        message.error("ไม่พบรหัสนักเรียนนี้ในระบบ");
        return;
      }

      // ✅ ตรวจสอบ password (แบบไม่เข้ารหัส)
      if (matchedUser.password !== password) {
        message.error("รหัสผ่านไม่ถูกต้อง");
        return;
      }

      // ✅ เข้าสู่ระบบสำเร็จ
      message.success("เข้าสู่ระบบสำเร็จ");

      // ✅ บันทึกข้อมูลลง context
      login({
        id: matchedUser.id,
        username: matchedUser.studentId,
        role: matchedUser.role,
        classroom: matchedUser.classroom,
        department: matchedUser.department,
      }); 

      // ✅ Navigate ไปตาม role
      if (matchedUser.role === "student") navigate("/student");
      else if (matchedUser.role === "teacher") navigate("/teacher");
      else if (matchedUser.role === "admin") navigate("/admin");
      else navigate("/unauthorized");
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      message.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
  <div
    style={{
      backgroundImage: "url('/bg.jpg')", // ต้องอยู่ใน public/
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <Card
      style={{
        width: 380,
        padding: "24px 16px",
        backgroundColor: "rgba(255, 255, 255, 0.9)", // เพิ่มความโปร่งใส
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // เงาเบา ๆ
        borderRadius: 12,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img src={logo} alt="Logo" style={{ width: 140, marginBottom: 16 }} />
        <h2 style={{ margin: 0 }}>Login</h2>
      </div>

      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="studentId"
          label="Student ID"
          rules={[{ required: true, message: "กรอกรหัสนักเรียน" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Student ID" autoComplete="off"/>
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="off"/>
        </Form.Item>

        <Form.Item>
          <Checkbox defaultChecked>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  </div>
);

};

export default LoginPage;
