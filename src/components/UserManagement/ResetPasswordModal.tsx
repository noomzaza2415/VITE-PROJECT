/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { UserType } from "../../types/UserType";
import { resetPassword } from "../../services/userService";

interface ResetPasswordModalProps {
  open: boolean;
  user: UserType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) form.resetFields();
  }, [user, form]);

  const [loading, setLoading] = useState(false);

const handleConfirmReset = async () => {
  try {
    setLoading(true);
    const values = await form.validateFields();
    if (!user) return;
    await resetPassword(user.id, values.password);
    message.success("รีเซ็ตรหัสผ่านเรียบร้อย");
    onClose();
    onSuccess();
  } catch (err) {
    message.error("รีเซ็ตรหัสผ่านล้มเหลว");
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal
      open={open}
      title={`รีเซ็ตรหัสผ่านสำหรับ ${user?.fullName ?? ""}`}
      okText="บันทึก"
      confirmLoading={loading}
      cancelText="ยกเลิก"
      onCancel={onClose}
      onOk={handleConfirmReset}
      destroyOnHidden // ✅ แก้จาก destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="รหัสผ่านใหม่"
          name="password"
          rules={[
            { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
            { min: 6, message: "รหัสผ่านต้องอย่างน้อย 6 ตัว" },
          ]}
        >
          <Input.Password placeholder="รหัสผ่านใหม่" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
