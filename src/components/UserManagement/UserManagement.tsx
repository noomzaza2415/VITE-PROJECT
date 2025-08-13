/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Grid } from "antd";
import { getColumns } from "./columns";
import { UserCardView } from "./UserCardView";
import UserFormModal from "./UserFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import {
  getUsers,
  deleteUser,
  updateRole,
  createUser,
  editUser,
} from "../../services/userService";
import type { UserType } from "../../types/UserType";

const { useBreakpoint } = Grid;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserType | null>(null);
  const screens = useBreakpoint();

  const reloadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      message.error("โหลดข้อมูลผู้ใช้ล้มเหลว");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success("ลบผู้ใช้แล้ว");
      reloadData();
    } catch {
      message.error("ลบผู้ใช้ล้มเหลว");
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateRole(id, role);
      message.success("อัปเดตบทบาทแล้ว");
      reloadData();
    } catch {
      message.error("อัปเดตบทบาทล้มเหลว");
    }
  };

  const handleFormSubmit = async (formData: any) => {
  setLoading(true);
  try {
    const payload = new FormData();

    for (const key in formData) {
      if (key === "photo") {
        const photo = formData.photo;
        if (photo instanceof File) {
          payload.append("photo", photo);
        } else if (typeof photo === "string") {
          payload.append("photoUrl", photo); // ส่งชื่อ photoUrl ถ้าเป็น URL
        }
      } else if (formData[key] !== undefined && formData[key] !== null) {
        // ถ้าแก้ไขไม่ต้องส่ง password
        if (key === "password" && formData.id) continue;
        payload.append(key, formData[key].toString());
      }
    }

    if (formData.id) {
      await editUser(formData.id, payload);
      message.success("แก้ไขผู้ใช้สำเร็จ");
    } else {
      await createUser(payload); 
      message.success("เพิ่มผู้ใช้สำเร็จ");
    }

    setIsModalOpen(false);
    setEditingUser(null);
    reloadData();
  } catch (error: any) {
    message.error("เกิดข้อผิดพลาด: " + (error.message || error));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center space-x-2 mb-4">
        
        <h2 className="text-xl md:text-2xl font-bold">🔐 จัดการผู้ใช้</h2>
        <div className="flex-grow" />
        <Button
          type="primary"
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          + เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {screens.md ? (
        <Table
          dataSource={users}
          columns={getColumns(
            handleRoleChange,
            handleEdit,
            handleDelete,
            (u) => {
              setResetUser(u);
              setIsResetModalOpen(true);
            },
            loading
          )}
          rowKey={(record) => record.id}
          scroll={{ x: 1400 }}
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      ) : (
        <UserCardView
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRoleChange={handleRoleChange}
          onResetPassword={(u) => {
            setResetUser(u);
            setIsResetModalOpen(true);
          }}
          loading={loading}
        />
      )}

      <UserFormModal
        visible={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        loading={loading}
      />

      <ResetPasswordModal
        open={isResetModalOpen}
        user={resetUser}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  );
};

export default UserManagement;
