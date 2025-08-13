/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Home.tsx
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext"; // ดึง user จาก context
import {
  Card,
  Avatar,
  Row,
  Col,
  Typography,
  Descriptions,
  Spin,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Home: React.FC = () => {
  const { user } = useAuth(); // ดึงข้อมูล user ที่ล็อกอิน
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:3001/users/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
          return res.json();
        })
        .then((data) => {
          setUserData(data);
        })
        .catch((err) => {
          console.error(err);
          message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return <p>ไม่พบข้อมูลผู้ใช้</p>;
  }

  return (
    <Row justify="center" style={{ padding: "40px" }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card variant="outlined">
          <Row justify="center" style={{ marginBottom: "20px" }}>
            <Avatar
              size={120}
              src={userData.photoUrl || ""}
              icon={!userData.photoUrl && <UserOutlined />}
              alt="User Photo"
            />
          </Row>
          <Title level={3} style={{ textAlign: "center" }}>
            {userData.fullName}
          </Title>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="รหัสนักเรียน">
              {userData.studentId}
            </Descriptions.Item>
            <Descriptions.Item label="ชื่อผู้ใช้">
              {userData.username}
            </Descriptions.Item>
            <Descriptions.Item label="บทบาท">{userData.role}</Descriptions.Item>
            <Descriptions.Item label="ระดับชั้น">
              {userData.grade}
            </Descriptions.Item>
            <Descriptions.Item label="แผนก">
              {userData.department}
            </Descriptions.Item>
            <Descriptions.Item label="ห้อง">
              {userData.classroom}
            </Descriptions.Item>
            <Descriptions.Item label="เลขที่">
              {userData.rollNumber}
            </Descriptions.Item>
            <Descriptions.Item label="วันเกิด">
              {dayjs(userData.birthday).format("D MMMM") +
                " " +
                (dayjs(userData.birthday).year() + 543)}
            </Descriptions.Item>
            <Descriptions.Item label="เบอร์โทร">
              {userData.phoneNumber}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );
};

export default Home;
