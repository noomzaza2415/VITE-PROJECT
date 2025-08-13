import type { ColumnsType } from "antd/es/table";
import { Image, Select, Button, Popconfirm } from "antd";
import moment from "moment";
import type { UserType } from "../../types/UserType";

const { Option } = Select;

export function getColumns(
  handleRoleChange: (id: number, role: string) => void,
  handleEdit: (user: UserType) => void,
  handleDelete: (id: number) => void,
  handleResetPassword: (user: UserType) => void,
  loading: boolean
): ColumnsType<UserType> {
  return [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "ชื่อ - นามสกุล", dataIndex: "fullName", width: 160 },
    {
      title: "รูปภาพ",
      dataIndex: "photoUrl",
      width: 100,
      render: (text: string) => (
  text ? (
    <a href={text} target="_blank" rel="noopener noreferrer">
      <Image
        src={text}
        alt="Profile"
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    </a>
  ) : (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        backgroundColor: "#eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#999",
        fontSize: 12,
      }}
    >
      ไม่มีรูป
    </div>
  )
      ),
    },
    { title: "รหัสนักศึกษา", dataIndex: "studentId", width: 120 },
    { title: "ระดับชั้น", dataIndex: "grade", width: 100 },
    { title: "แผนก", dataIndex: "department", width: 150 },
    { title: "ห้อง", dataIndex: "classroom", width: 80 },
    { title: "เลขที่", dataIndex: "rollNumber", width: 80 },
    {
  title: "วันเกิด",
  dataIndex: "birthday",
  width: 130,
  render: (text: string) =>
    text
      ? moment.utc(text).add(7, "hours").format("DD/MM/YYYY") 
      : "-",
},

    { title: "เบอร์โทร", dataIndex: "phoneNumber", width: 150 },
    {
      title: "บทบาท",
      dataIndex: "role",
      width: 140,
      render: (role: string, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 120 }}
          disabled={loading}
        >
          <Option value="student">นักเรียน</Option>
          <Option value="teacher">อาจารย์</Option>
          <Option value="admin">แอดมิน</Option>
        </Select>
      ),
    },
    {
      title: "การจัดการ",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Button
            size="small"
            onClick={() => handleEdit(record)}
            disabled={loading}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="แน่ใจว่าต้องการลบ?"
            onConfirm={() => handleDelete(record.id)}
            disabled={loading}
          >
            <Button size="small" danger disabled={loading}>
              ลบ
            </Button>
          </Popconfirm>
          <Button
            size="small"
            onClick={() => handleResetPassword(record)}
            disabled={loading}
          >
            รีเซ็ตรหัสผ่าน
          </Button>
        </div>
      ),
    },
  ];
}
