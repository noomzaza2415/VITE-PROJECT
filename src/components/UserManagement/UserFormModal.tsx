/* eslint-disable @typescript-eslint/no-explicit-any */
// UserFormModal.tsx

import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect } from "react";
import type { UserType } from "../../types/UserType";

const { Option } = Select;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editingUser: UserType | null;
  loading: boolean;
}

const UserFormModal: React.FC<Props> = ({
  visible,
  onCancel,
  onSubmit,
  editingUser,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) return;
    if (editingUser) {
      form.setFieldsValue({
        ...editingUser,
        birthday: editingUser.birthday ? moment(editingUser.birthday) : null,
        photo: editingUser.photoUrl
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: editingUser.photoUrl,
              },
            ]
          : [],
      });
    } else {
      form.resetFields();
    }
  }, [editingUser, visible, form]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList || [];
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("http://localhost:3001/users/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data?.url) {
        message.success("อัปโหลดรูปภาพสำเร็จ");
        return data.url;
      } else {
        message.error("อัปโหลดรูปไม่สำเร็จ");
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("เกิดข้อผิดพลาดในการอัปโหลดรูป");
      return null;
    }
  };

  const handleFinish = async (values: any) => {
    let photoUrl = null;

    if (values.photo?.length > 0) {
      const file = values.photo[0];
      if (file.originFileObj) {
        photoUrl = await handleUpload(file.originFileObj); // 👈 อัปโหลดแยก
        if (!photoUrl) return;
      } else if (file.url) {
        photoUrl = file.url;
      }
    }

    const birthday = values.birthday
      ? values.birthday.format("YYYY-MM-DD")
      : null;

    onSubmit({
      ...values,
      birthday,
      photo: photoUrl, // 👈 แค่ URL ไม่ใช่ไฟล์
      id: editingUser?.id,
    });
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      title={editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
      destroyOnHidden
    >
      <Form
        key={editingUser?.id || "new"}
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="fullName"
          label="ชื่อ - นามสกุล"
          rules={[{ required: true }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="studentId"
          label="รหัสนักศึกษา"
          rules={[{ required: true }]}
        >
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item name="grade" label="ระดับชั้น" rules={[{ required: true }]}>
          <Select placeholder="เลือกแผนก">
            <Option value="ปวช.1">ปวช.1</Option>
            <Option value="ปวช.2">ปวช.2</Option>
            <Option value="ปวช.3">ปวช.3</Option>
            <Option value="ปวส.1">ปวส.1</Option>
            <Option value="ปวส.2">ปวส.2</Option>
          </Select>
        </Form.Item>

        <Form.Item name="department" label="แผนก" rules={[{ required: true }]}>
          <Select placeholder="เลือกแผนก">
            <Option value="เทคโนโลยีธุรกิจดิจิทัล">
              เทคโนโลยีธุรกิจดิจิทัล
            </Option>
            <Option value="ช่างยนต์ และเครื่องกล">ช่างยนต์ และเครื่องกล</Option>
            <Option value="ช่างกลโรงงาน และเทคนิคการผลิต">
              ช่างกลโรงงาน และเทคนิคการผลิต
            </Option>
            <Option value="ช่างซ่อมบำรุง และเทคนิคอุตสาหกรรม">
              ช่างซ่อมบำรุง และเทคนิคอุตสาหกรรม
            </Option>
            <Option value="ช่างเชื่อมโลหะ">ช่างเชื่อมโลหะ</Option>
            <Option value="ช่าง ไฟฟ้ากำลัง">ช่าง ไฟฟ้ากำลัง</Option>
            <Option value="ช่างอิเล็กทรอนิกส์">ช่างอิเล็กทรอนิกส์</Option>
            <Option value="ช่างก่อสร้าง">ช่างก่อสร้าง</Option>
            <Option value="การโรงแรม">การโรงแรม</Option>
            <Option value="การจัดการโลจิสติกส์ และซัพพลายเชน">
              การจัดการโลจิสติกส์ และซัพพลายเชน
            </Option>
            <Option value="การบัญชี">การบัญชี</Option>
            <Option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</Option>
            <Option value="ธุรกิจค้าปลีก การตลาด">ธุรกิจค้าปลีก การตลาด</Option>
            <Option value="เมคคาทรอนิกส์ และหุ่นยนต์">
              เมคคาทรอนิกส์ และหุ่นยนต์
            </Option>
            <Option value="เทคนิคเครื่องกลเรือ">เทคนิคเครื่องกลเรือ</Option>
          </Select>
        </Form.Item>

        <Form.Item name="classroom" label="ห้อง" rules={[{ required: true }]}>
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="rollNumber"
          label="เลขที่"
          rules={[{ required: true }]}
        >
          <Input placeholder="เช่น 15" autoComplete="off" />
        </Form.Item>

        <Form.Item name="birthday" label="วันเกิด" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="เบอร์โทร"
          rules={[{ required: true }]}
        >
          <Input placeholder="089-xxxxxxx" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="role"
          label="บทบาท"
          rules={[{ required: true, message: "กรุณาเลือกบทบาท" }]}
        >
          <Select>
            <Option value="student">นักเรียน</Option>
            <Option value="teacher">อาจารย์</Option>
            <Option value="admin">แอดมิน</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="username"
          label="ชื่อผู้ใช้"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="password"
          label="รหัสผ่าน"
          rules={[{ required: !editingUser, message: "กรุณากรอกรหัสผ่าน" }]}
        >
          <Input.Password autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="photo"
          label="รูปภาพ"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          
        >
          <Upload
            name="photo"
            listType="picture"
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>อัปโหลดรูป</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
