import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, Row, Col, Typography, Statistic, Grid } from "antd";
import { useAuth } from "../AuthContext";

interface LeaveForm {
  id: number;
  fullName: string;
  studentId: string;
  classroom: string;
  department: string;
  leaveType: string;
  leaveDate: string;
  startTime: string;
  endTime: string;
  parentPhone: string;
  notes?: string;
  status: string;
  rejectReason?: string;
  attachment: {
    name: string;
    base64: string;
    type: string;
    photoUrl?: string;
  }[];
}

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const COLORS = [
  "#1890ff",
  "#ffc107",
  "#52c41a",
  "#ff4d4f",
  "#9c27b0",
  "#00bcd4",
];

const BACKEND_URL = "http://localhost:3001";

const PieChartPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [rawData, setRawData] = useState<LeaveForm[]>([]);
  const [summaryData, setSummaryData] = useState<
    { name: string; value: number }[]
  >([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (isLoading) return;

    async function fetchLeaveForms() {
      try {
        const response = await axios.get<LeaveForm[]>(
          `${BACKEND_URL}/api/leave_forms`
        );
        let filteredData = response.data;

        if (user && user.role === "student") {
          filteredData = filteredData.filter(
            (item) => item.studentId === user.username
          );
        }

        setRawData(filteredData);
      } catch (error) {
        console.error("Error fetching leave forms:", error);
      }
    }
    fetchLeaveForms();
  }, [user, isLoading]);

  useEffect(() => {
    const summaryMap = new Map<string, number>();
    rawData.forEach((item) => {
      if (item.status === "อนุมัติแล้ว") {
        const type = item.leaveType || "ไม่ระบุ";
        summaryMap.set(type, (summaryMap.get(type) || 0) + 1);
      }
    });
    setSummaryData(
      Array.from(summaryMap.entries()).map(([name, value]) => ({ name, value }))
    );
  }, [rawData]);

  const totalLeave = summaryData.reduce((sum, item) => sum + item.value, 0);

  const maxLeaveValue = Math.max(...summaryData.map((item) => item.value), 0);
  const mostLeaveTypes = summaryData
    .filter((item) => item.value === maxLeaveValue)
    .map((item) => item.name);

  const mostLeaveText =
    mostLeaveTypes.length === 0
      ? "-"
      : `${mostLeaveTypes.join(" และ ")} (${maxLeaveValue} ครั้ง)`;

  const updatedAt = new Date().toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: isMobile ? 16 : 48,
        background: "#f5f8ff",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
          padding: isMobile ? 16 : 32,
          borderRadius: 16,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 4, fontSize: isMobile ? 24 : 40 }}>
          สถิติการลาของนักศึกษา
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 13 : 16 }}>
          ข้อมูลอัปเดตล่าสุด: {updatedAt}
        </Text>
      </div>

      {/* Pie Chart + Summary */}
      <Row
        gutter={[isMobile ? 16 : 32, 32]}
        justify="center"
        align="top"
        style={{ marginBottom: 48 }}
      >
        {/* Pie Chart */}
        <Col xs={24} md={12} lg={10} xl={8}>
          <Card
            className="glow-container"
            hoverable
            style={{
              borderRadius: 16,
              padding: isMobile ? 16 : 32,
              background: "#fff",
              border: "none",
              overflow: "hidden",
            }}
          >
            <div className="pie-animate" style={{ width: "100%", height: isMobile ? 220 : 360 }}>
              <ResponsiveContainer>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient
                        id={`color${index}`}
                        key={index}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={summaryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 130}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    paddingAngle={4}
                    minAngle={10}
                  >
                    {summaryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#color${index})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} ครั้ง`} />
                  <Legend
                    verticalAlign="bottom"
                    height={isMobile ? 32 : 36}
                    wrapperStyle={{ fontSize: isMobile ? 12 : 16 }}
                    iconSize={14}
                    layout="horizontal"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Summary Cards */}
        <Col xs={24} md={12} lg={10} xl={8}>
          <Row gutter={[16, 16]} justify="center">
            {[
              {
                title: "จำนวนการลารวม",
                value: totalLeave,
                suffix: "ครั้ง",
                color: "#1890ff",
              },
              {
                title: "ประเภทการลามากที่สุด",
                value: mostLeaveText,
                color: "#ff4d4f",
              },
              {
                title: "อัปเดตล่าสุด",
                value: updatedAt,
                isText: true,
              },
            ].map((item, index) => (
              <Col span={24} key={index}>
                <Card
                  style={{
                    textAlign: "center",
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                    border: "none",
                  }}
                  hoverable
                >
                  {item.isText ? (
                    <Text type="secondary" style={{ fontSize: isMobile ? 14 : 16 }}>
                      {item.value}
                    </Text>
                  ) : (
                    <Statistic
                      title={item.title}
                      value={item.value}
                      valueStyle={{
                        fontSize: isMobile ? 22 : 26,
                        color: item.color,
                        fontWeight: "600",
                      }}
                      suffix={item.suffix}
                    />
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Detail per Leave Type */}
      <div
        style={{
          marginTop: 48,
          background: "#fafafa",
          padding: isMobile ? 24 : 48,
          borderRadius: 16,
        }}
      >
        <Row gutter={[16, 16]} justify="center">
          {summaryData.map((item, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.name}>
              <Card
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  padding: isMobile ? 16 : 20,
                  border: "none",
                }}
                hoverable
              >
                <Statistic
                  title={item.name}
                  value={item.value}
                  valueStyle={{
                    color: COLORS[index % COLORS.length],
                    fontSize: isMobile ? 22 : 26,
                    fontWeight: "600",
                  }}
                  suffix="ครั้ง"
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default PieChartPage;
