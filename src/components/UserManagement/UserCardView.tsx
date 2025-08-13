import React from "react";
import { Card, Image, Button, Popconfirm, Select } from "antd";
import moment from "moment";
import type { UserType } from "../../types/UserType";

const { Option } = Select;

interface Props {
  users: UserType[];
  onEdit: (user: UserType) => void;
  onDelete: (id: number) => void;
  onRoleChange: (id: number, role: string) => void;
  onResetPassword?: (user: UserType) => void;
  loading?: boolean;
}

export const UserCardView: React.FC<Props> = ({
  users,
  onEdit,
  onDelete,
  onRoleChange,
  onResetPassword,
  loading,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {users.map((user) => (
      <Card
        key={user.id}
        title={user.fullName}
        extra={
          <Select
            size="small"
            value={user.role}
            onChange={(value) => onRoleChange(user.id, value)}
            style={{ width: 100 }}
            disabled={loading}
          >
            <Option value="student">นักเรียน</Option>
            <Option value="teacher">อาจารย์</Option>
            <Option value="admin">แอดมิน</Option>
          </Select>
        }
      >
        {user.photoUrl && (
          <Image
            src={user.photoUrl}
            alt={user.studentId}
            fallback="https://via.placeholder.com/100?text=No+Image"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 12,
            }}
          />
        )}
        <p>
          <b>รหัส:</b> {user.studentId}
        </p>
        <p>
          <b>ระดับ:</b> {user.grade}
        </p>
        <p>
          <b>แผนก:</b> {user.department}
        </p>
        <p>
          <b>ห้อง:</b> {user.classroom}
        </p>
        <p>
          <b>วันเกิด:</b>{" "}
          {user.birthday ? moment(user.birthday).format("DD/MM/YYYY") : "-"}
        </p>
        <p>
          <b>โทร:</b> {user.phoneNumber}
        </p>
        <div className="mt-2 flex gap-2 flex-wrap">
          <Button size="small" onClick={() => onEdit(user)} disabled={loading}>
            แก้ไข
          </Button>
          <Popconfirm
            title="ลบผู้ใช้?"
            onConfirm={() => onDelete(user.id)}
            disabled={loading}
          >
            <Button size="small" danger disabled={loading}>
              ลบ
            </Button>
          </Popconfirm>
          {onResetPassword && (
            <Button
              size="small"
              onClick={() => onResetPassword(user)}
              disabled={loading}
            >
              รีเซ็ตรหัสผ่าน
            </Button>
          )}
        </div>
      </Card>
    ))}
  </div>
);
