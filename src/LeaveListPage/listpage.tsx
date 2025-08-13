import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  Button,
  Space,
  Typography,
  message,
  DatePicker,
  TimePicker,
  Card,
  Row,
  Col,
  Tag,
} from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuth } from "../AuthContext";

const { Title } = Typography;
const { Option } = Select;

interface AttachmentFile {
  name: string;
  type?: string;
  base64?: string;
  url?: string;
}

interface LeaveForm {
  id: number;
  fullName: string;
  studentId: string;
  grade?: string;
  classroom: string;
  department: string;
  leaveType: string;
  leaveDate: string;
  startTime?: string;
  endTime?: string;
  parentPhone?: string;
  notes?: string;
  status: string;
  rejectReason?: string;
  attachment?: AttachmentFile[];
}

const leaveTypes = [
  "ลาป่วย",
  "ลากิจส่วนตัว",
  "ลาเรียน",
  "ลาออกนอกสถานที่ (ชั่วคราว)",
  "ลาเข้าค่าย / อบรม / กิจกรรม",
  "ลาอื่น ๆ",
];

const statusTypes = ["รออนุมัติจากอาจารย์", "อนุมัติแล้ว", "ไม่อนุมัติ"];

const LeaveListPage: React.FC = () => {
  const { user } = useAuth();

  const [filterLeaveType, setFilterLeaveType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterTimeStart, setFilterTimeStart] = useState<string | null>(null);
  const [filterTimeEnd, setFilterTimeEnd] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [data, setData] = useState<LeaveForm[]>([]);

  const prevPendingCount = useRef<number>(0);

  const loadData = async () => {
    try {
      const response = await axios.get<LeaveForm[]>(
        "http://localhost:3001/api/leave_forms"
      );
      setData(response.data);

      const currentPendingCount = response.data.filter(
        (item) => item.status === "รออนุมัติจากอาจารย์"
      ).length;

      if (
        prevPendingCount.current > 0 &&
        currentPendingCount < prevPendingCount.current
      ) {
        message.success(
          "มีรายการที่ได้รับการอนุมัติหรือไม่อนุมัติเรียบร้อยแล้ว"
        );
      }

      prevPendingCount.current = currentPendingCount;
    } catch (error) {
      console.error("❌ ดึงข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/leave_forms/${id}`);
      message.success("ลบข้อมูลเรียบร้อยแล้ว");
      loadData();
    } catch (error) {
      console.error("❌ ลบไม่สำเร็จ:", error);
      message.error("ไม่สามารถลบข้อมูลได้");
    }
  };

  const filteredData = data.filter((item) => {
    if (!user) return false;

    const matchDate = !filterDate || item.leaveDate === filterDate;
    const matchTime =
      !filterTimeStart ||
      !filterTimeEnd ||
      (item.startTime &&
        item.endTime &&
        item.startTime >= filterTimeStart &&
        item.endTime <= filterTimeEnd);
    const matchType = !filterLeaveType || item.leaveType === filterLeaveType;
    const matchStatus = !filterStatus || item.status === filterStatus;
    const matchMonth =
      !filterMonth ||
      dayjs(item.leaveDate, "DD/MM/YYYY").format("MM/YYYY") === filterMonth;

    if (user.role === "admin") {
      return matchDate && matchTime && matchType && matchStatus && matchMonth;
    }

    if (user.role === "teacher") {
      return (
        item.department === user.department &&
        matchDate &&
        matchTime &&
        matchType &&
        matchStatus &&
        matchMonth
      );
    }

    if (user.role === "student") {
      return (
        item.studentId === user.username &&
        matchDate &&
        matchTime &&
        matchType &&
        matchStatus &&
        matchMonth
      );
    }

    return false;
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("LeaveList");

    worksheet.columns = [
      { header: "ชื่อ", key: "fullName", width: 20 },
      { header: "รหัสนักเรียน", key: "studentId", width: 15 },
      { header: "แผนก", key: "department", width: 20 },
      { header: "ชั้น", key: "grade", width: 10 },
      { header: "ประเภทการลา", key: "leaveType", width: 25 },
      { header: "วันที่ลา", key: "leaveDate", width: 15 },
      { header: "เวลา", key: "timeRange", width: 20 },
      { header: "สถานะ", key: "status", width: 15 },
      { header: "เหตุผลไม่อนุมัติ", key: "rejectReason", width: 30 },
    ];

    filteredData.forEach((item) => {
      worksheet.addRow({
        fullName: item.fullName,
        studentId: item.studentId,
        department: item.department,
        grade: item.grade,
        leaveType: item.leaveType,
        leaveDate: item.leaveDate,
        timeRange:
          item.startTime && item.endTime
            ? `${item.startTime} - ${item.endTime}`
            : "ทั้งวัน",
        status: item.status,
        rejectReason:
          item.status === "ไม่อนุมัติ" ? item.rejectReason || "" : "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "leave_list.xlsx");
  };

  // แยกกลุ่มตามเดือน
  const groupedByMonth = filteredData.reduce((groups, item) => {
    const month = dayjs(item.leaveDate, "DD/MM/YYYY").format("MMMM YYYY");
    if (!groups[month]) groups[month] = [];
    groups[month].push(item);
    return groups;
  }, {} as Record<string, LeaveForm[]>);

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <Title level={3}>ใบลานักศึกษา</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker
          format="DD/MM/YYYY"
          placeholder="ค้นหาตามวันที่ลา"
          onChange={(date) =>
            setFilterDate(date ? dayjs(date).format("DD/MM/YYYY") : null)
          }
          allowClear
        />
        <DatePicker
          picker="month"
          placeholder="กรองตามเดือน"
          onChange={(date) =>
            setFilterMonth(date ? date.format("MM/YYYY") : null)
          }
          allowClear
        />
        <TimePicker
          format="HH:mm"
          placeholder="เวลาเริ่มลา"
          onChange={(time) =>
            setFilterTimeStart(time ? time.format("HH:mm") : null)
          }
          allowClear
        />
        <TimePicker
          format="HH:mm"
          placeholder="เวลาสิ้นสุดลา"
          onChange={(time) =>
            setFilterTimeEnd(time ? time.format("HH:mm") : null)
          }
          allowClear
        />
        <Select
          placeholder="กรองตามประเภทการลา"
          allowClear
          style={{ width: 200 }}
          value={filterLeaveType}
          onChange={(value) => setFilterLeaveType(value)}
        >
          {leaveTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="กรองตามสถานะ"
          allowClear
          style={{ width: 200 }}
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
        >
          {statusTypes.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
        <Button icon={<DownloadOutlined />} onClick={exportToExcel}>
          ดาวน์โหลด Excel
        </Button>
      </Space>

      {Object.entries(groupedByMonth).map(([month, items]) => (
        <div key={month} style={{ marginBottom: 32 }}>
          <Title level={4}>{month}</Title>
          <Row gutter={[16, 16]}>
            {items.map((item) => (
              <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                <Card title={item.fullName} hoverable>
                  <p>
                    <b>รหัส:</b> {item.studentId}
                  </p>
                  <p>
                    <b>แผนก:</b> {item.department}
                  </p>
                  <p>
                    <b>ชั้น:</b> {item.grade}
                  </p>
                  <p>
                    <b>ประเภทการลา:</b> {item.leaveType}
                  </p>
                  <p>
                    <b>วันที่ลา:</b> {item.leaveDate}
                  </p>
                  <p>
                    <b>เวลา:</b>{" "}
                    {item.startTime && item.endTime
                      ? `${item.startTime} - ${item.endTime}`
                      : "ทั้งวัน"}
                  </p>
                  <p>
                    <b>ไฟล์แนบ:</b>
                    <br />
                    {Array.isArray(item.attachment) &&
                    item.attachment.length > 0 ? (
                      item.attachment.map((file, idx) => {
                        const fileLink = file.url
                          ? file.url
                          : file.base64 && file.type
                          ? `data:${file.type};base64,${file.base64}`
                          : undefined;

                        return fileLink ? (
                          <a
                            key={idx}
                            href={fileLink}
                            download={file.name}
                            style={{ display: "block", marginBottom: 4 }}
                          >
                            <FileOutlined /> {file.name}
                          </a>
                        ) : (
                          <span key={idx}>{file.name}</span>
                        );
                      })
                    ) : (
                      <span>ไม่มีไฟล์</span>
                    )}
                  </p>

                  <p>
                    <b>สถานะ:</b>{" "}
                    {item.status === "อนุมัติแล้ว" ? (
                      <Tag icon={<CheckCircleOutlined />} color="green">
                        {item.status}
                      </Tag>
                    ) : item.status === "ไม่อนุมัติ" ? (
                      <Tag icon={<CloseCircleOutlined />} color="red">
                        {item.status}
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        {item.status}
                      </Tag>
                    )}
                  </p>
                  {item.status === "ไม่อนุมัติ" && item.rejectReason && (
                    <p>
                      <b>เหตุผล:</b> {item.rejectReason}
                    </p>
                  )}
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <Button
                      danger
                      onClick={() => handleDelete(item.id)}
                      style={{ marginTop: 8 }}
                    >
                      ลบใบลา
                    </Button>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default LeaveListPage;
