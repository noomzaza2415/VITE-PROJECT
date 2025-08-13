import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
  Modal,
  Form,
  Card,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useAuth } from "../AuthContext";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { ColumnsType } from "antd/es/table";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;
const { Option } = Select;

const leaveTypes = [
  "ลาป่วย",
  "ลากิจส่วนตัว",
  "ลาเรียน",
  "ลาออกนอกสถานที่ (ชั่วคราว)",
  "ลาเข้าค่าย / อบรม / กิจกรรม",
  "ลาอื่น ๆ",
];

interface Attachment {
  name: string;
  base64: string;
  type: string;
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
  startTime: string;
  endTime: string;
  parentPhone: string;
  notes?: string;
  status: string;
  rejectReason?: string;
  attachment: Attachment[];
}

const ApproveLeavePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [searchText, setSearchText] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState<string | undefined>();
  const [data, setData] = useState<LeaveForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRecord, setRejectRecord] = useState<LeaveForm | null>(null);
  const [formReject] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get<LeaveForm[]>(
        "http://localhost:3001/api/leave_forms"
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.fullName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesLeaveType =
      !filterLeaveType || item.leaveType === filterLeaveType;

    if (user?.role === "teacher") {
      const classroomMatch = user.classroom
        ? item.classroom === user.classroom
        : true;
      const departmentMatch = user.department
        ? item.department === user.department
        : true;
      return (
        matchesSearch && matchesLeaveType && classroomMatch && departmentMatch
      );
    }

    return matchesSearch && matchesLeaveType;
  });

  const handleApprove = async (record: LeaveForm) => {
    try {
      await axios.put(`http://localhost:3001/api/leave_forms/${record.id}`, {
        status: "อนุมัติแล้ว",
        rejectReason: "",
      });
      message.success("✅ อนุมัติเรียบร้อย");
      loadData();
      setSelectedRowKeys((keys) => keys.filter((key) => key !== record.id));
    } catch (err) {
      console.error(err);
      message.error("❌ อนุมัติไม่สำเร็จ");
    }
  };

  const openRejectModal = (record: LeaveForm) => {
    setRejectRecord(record);
    formReject.setFieldsValue({ rejectReason: "" });
    setRejectReason("");
    setIsRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await formReject.validateFields();
      if (!rejectRecord) return;

      await axios.put(
        `http://localhost:3001/api/leave_forms/${rejectRecord.id}`,
        {
          status: "ไม่อนุมัติ",
          rejectReason,
        }
      );
      message.warning("ไม่อนุมัติเรียบร้อย พร้อมระบุเหตุผล");
      setIsRejectModalVisible(false);
      loadData();
      setSelectedRowKeys((keys) =>
        keys.filter((key) => key !== rejectRecord.id)
      );
    } catch (err) {
      console.error(err);
      message.error("❌ ไม่สามารถบันทึกเหตุผลได้");
    }
  };

  const handleDelete = async (record: LeaveForm) => {
    try {
      await axios.delete(`http://localhost:3001/api/leave_forms/${record.id}`);
      message.success("🗑️ ลบเรียบร้อย");
      loadData();
      setSelectedRowKeys((keys) => keys.filter((key) => key !== record.id));
    } catch (err) {
      console.error(err);
      message.error("❌ ลบไม่สำเร็จ");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("โปรดเลือกอย่างน้อย 1 รายการเพื่อทำการลบ");
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map((id) =>
          axios.delete(`http://localhost:3001/api/leave_forms/${id}`)
        )
      );
      message.success("🗑️ ลบรายการที่เลือกเรียบร้อยแล้ว");
      setSelectedRowKeys([]);
      loadData();
    } catch (err) {
      console.error(err);
      message.error("❌ ลบรายการที่เลือกไม่สำเร็จ");
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leave Data");

    worksheet.columns = [
      { header: "ชื่อ", key: "fullName", width: 20 },
      { header: "รหัสประจำตัว", key: "studentId", width: 15 },
      { header: "แผนก", key: "department", width: 20 },
      { header: "ชั้น", key: "classroom", width: 10 },
      { header: "ประเภทการลา", key: "leaveType", width: 25 },
      { header: "วันที่ลา", key: "leaveDate", width: 15 },
      { header: "เริ่ม", key: "startTime", width: 10 },
      { header: "สิ้นสุด", key: "endTime", width: 10 },
      { header: "เบอร์ผู้ปกครอง", key: "parentPhone", width: 15 },
      { header: "สถานะ", key: "status", width: 15 },
      { header: "เหตุผลไม่อนุมัติ", key: "rejectReason", width: 25 },
    ];

    filteredData.forEach((item) => {
      worksheet.addRow({
        fullName: item.fullName,
        studentId: item.studentId,
        department: item.department,
        classroom: item.classroom,
        leaveType: item.leaveType,
        leaveDate: item.leaveDate,
        startTime: item.startTime,
        endTime: item.endTime,
        parentPhone: item.parentPhone,
        status: item.status,
        rejectReason: item.rejectReason || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "leave_data.xlsx");
  };

  const columns: ColumnsType<LeaveForm> = [
    {
      title: "ชื่อ",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      fixed: "left",
    },
    {
      title: "รหัสประจำตัว",
      dataIndex: "studentId",
      key: "studentId",
      align: "center",
    },
    {
      title: "แผนก",
      dataIndex: "department",
      key: "department",
      align: "center",
    },
    {
      title: "ชั้น",
      dataIndex: "grade",
      key: "grade",
      align: "center",
    },
    {
      title: "เลขที่",
      dataIndex: "classroom",
      key: "classroom",
      align: "center",
    },
    {
      title: "ประเภทการลา",
      dataIndex: "leaveType",
      key: "leaveType",
      align: "center",
    },
    {
      title: "วันที่ลา",
      dataIndex: "leaveDate",
      key: "leaveDate",
      align: "center",
    },
    {
      title: "ช่วงเวลา",
      key: "timeRange",
      align: "center",
      render: (_, r) => `${r.startTime || "-"} - ${r.endTime || "-"}`,
    },
    {
      title: "รายละเอียดเพิ่มเติม",
      dataIndex: "notes",
      key: "notes",
      align: "center",
    },
    {
      title: "ไฟล์แนบ",
      key: "attachment",
      align: "center",
      render: (_, r) =>
        r.attachment.length > 0
          ? r.attachment.map((f, i) => (
              <a
                key={i}
                href={`data:${f.type};base64,${f.base64}`}
                download={f.name}
                style={{ marginRight: 8 }}
              >
                {f.name}
              </a>
            ))
          : "ไม่มีไฟล์",
    },
    {
      title: "สถานะ",
      key: "status",
      fixed: "right",
      width: 180,
      align: "center",
      render: (_, r) => (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {r.status === "รออนุมัติจากอาจารย์" ? (
            <>
              <Popconfirm
                title="ยืนยันอนุมัติ?"
                onConfirm={() => handleApprove(r)}
              >
                <Button type="primary" size="small">
                  อนุมัติ
                </Button>
              </Popconfirm>
              <Button danger size="small" onClick={() => openRejectModal(r)}>
                ไม่อนุมัติ
              </Button>
            </>
          ) : (
            <>
              <span
                style={{ color: r.status === "อนุมัติแล้ว" ? "green" : "red" }}
              >
                {r.status}
              </span>
              {r.status === "ไม่อนุมัติ" && r.rejectReason && (
                <div style={{ fontSize: 12, color: "gray" }}>
                  เหตุผล: {r.rejectReason}
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      title: "ลบ",
      key: "delete",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, r) => (
        <Popconfirm title="ลบรายการนี้?" onConfirm={() => handleDelete(r)}>
          <Button danger size="small">
            ลบ
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16, fontSize: "20px" }}>
        📄 ใบขอลาของนักศึกษา
      </Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="ค้นหาชื่อ"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ minWidth: 200 }}
        />
        <Select
          placeholder="ประเภทการลา"
          allowClear
          style={{ width: 250 }}
          value={filterLeaveType}
          onChange={(v) => setFilterLeaveType(v)}
        >
          {leaveTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>

        <Button icon={<DownloadOutlined />} onClick={exportToExcel}>
          ดาวน์โหลด Excel
        </Button>

        <Button
          danger
          onClick={handleDeleteSelected}
          disabled={selectedRowKeys.length === 0}
        >
          ลบรายการที่เลือก
        </Button>
      </Space>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredData.map((item) => (
            <Card
              key={item.id}
              title={`${item.fullName}`}
              extra={
                item.status === "รออนุมัติจากอาจารย์" ? (
                  <Space>
                    <Popconfirm
                      title="ยืนยันอนุมัติ?"
                      onConfirm={() => handleApprove(item)}
                    >
                      <Button type="primary" size="small">
                        อนุมัติ
                      </Button>
                    </Popconfirm>
                    <Button
                      danger
                      size="small"
                      onClick={() => openRejectModal(item)}
                    >
                      ไม่อนุมัติ
                    </Button>
                  </Space>
                ) : (
                  <span
                    style={{
                      color: item.status === "อนุมัติแล้ว" ? "green" : "red",
                    }}
                  >
                    {item.status}
                  </span>
                )
              }
            >
              <p>
                <strong>ห้อง:</strong> {item.classroom}
              </p>
              <p>
                <strong>แผนก:</strong> {item.department}
              </p>
              <p>
                <strong>ประเภท:</strong> {item.leaveType}
              </p>
              <p>
                <strong>วันที่:</strong> {item.leaveDate}
              </p>
              <p>
                <strong>เวลา:</strong> {item.startTime} - {item.endTime}
              </p>
              <p>
                <strong>ผู้ปกครอง:</strong> {item.parentPhone}
              </p>
              {item.notes && (
                <p>
                  <strong>หมายเหตุ:</strong> {item.notes}
                </p>
              )}
              {item.rejectReason && item.status === "ไม่อนุมัติ" && (
                <p style={{ color: "gray" }}>
                  <strong>เหตุผลไม่อนุมัติ:</strong> {item.rejectReason}
                </p>
              )}
              <div>
                <strong>ไฟล์แนบ:</strong>{" "}
                {item.attachment.length > 0 ? (
                  item.attachment.map((f, i) => (
                    <div key={i}>
                      <a
                        href={`data:${f.type};base64,${f.base64}`}
                        download={f.name}
                      >
                        {f.name}
                      </a>
                    </div>
                  ))
                ) : (
                  <span>ไม่มี</span>
                )}
              </div>

              <Popconfirm
                title="ลบรายการนี้?"
                onConfirm={() => handleDelete(item)}
              >
                <Button danger size="small">
                  ลบ
                </Button>
              </Popconfirm>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "80", "100"],
              defaultPageSize: 20,
            }}
            bordered
            scroll={{ x: "max-content" }}
            loading={loading}
          />
        </div>
      )}

      <Modal
        title="เหตุผลไม่อนุมัติ"
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        onOk={handleRejectConfirm}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form form={formReject} layout="vertical">
          <Form.Item
            label="เหตุผล"
            name="rejectReason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
          >
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApproveLeavePage;
