/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Upload,
  Modal,
  message,
  TimePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import axios from "axios";
const { Option } = Select;

const LeaveForm: React.FC = () => {
  const [form] = Form.useForm();
  const [formDataList, setFormDataList] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("leaveForms");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormDataList(parsedData);
    }
  }, []);

  const toBase64 = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve({
          name: file.name,
          type: file.type,
          base64: base64,
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onFinish = async (values: any) => {
    values.leaveDate = values.leaveDate.format("DD/MM/YYYY");
    values.startTime = values.startTime?.format("HH:mm") || "";
    values.endTime = values.endTime?.format("HH:mm") || "";

    const isDuplicate = formDataList.some(
      (entry) =>
        entry.fullName === values.fullName &&
        entry.leaveDate === values.leaveDate
    );
    if (isDuplicate) {
      message.warning("พบข้อมูลซ้ำสำหรับชื่อนี้ในวันที่เลือกแล้ว");
      return;
    }

    let attachments: any[] = [];
    if (fileList.length) {
      attachments = await Promise.all(
        fileList.map((file) => toBase64(file.originFileObj as File))
      );
    }

    values.attachment = attachments;
    values.status = "รออนุมัติจากอาจารย์";

    console.log("✅ Preview Data:", values);
    setPreviewData(values);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      await axios.post("http://localhost:3001/api/leave_forms", previewData);
      message.success("\u2705 บันทึกข้อมูลเรียบร้อยแล้ว");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("\u274C เกิดข้อผิดพลาด:", error);
      message.error("\u274C บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const filteredFiles = info.fileList.filter((file) => {
      const isValidType =
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg";
      if (!isValidType) {
        message.error(
          `ไฟล์ ${file.name} ไม่รองรับ (ต้องเป็น PDF หรือ JPG เท่านั้น)`
        );
      }
      return isValidType;
    });
    setFileList(filteredFiles);
  };

  const handlePrintWindow = () => {
  if (!previewData) return;

  const logoUrl = "/bk.jpg"; // ✅ ใช้ path แบบ root สำหรับ public assets

  const htmlContent = `
    <html>
      <head>
        <title>ใบขอลา</title>
        <style>
          body {
            font-family: 'TH Sarabun New', sans-serif;
            font-size: 18px;
            padding: 40px;
            line-height: 1.8;
          }
          .container {
            max-width: 700px;
            margin: auto;
            border: 1px solid #000;
            padding: 40px;
          }
          h3 {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo {
            display: block;
            margin: 0 auto 16px;
            width: 140px;
          }
          .field {
            margin-bottom: 10px;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="${logoUrl}" alt="โลโก้" />
          <h3>ใบขอลานักเรียน/นักศึกษา</h3>
          <div class="field">ชื่อ: ${previewData.fullName}</div>
          <div class="field">เลขที่: ${previewData.classroom || "-"}</div>
          <div class="field">ชั้นเรียน: ${previewData.grade || "-"}</div>
          <div class="field">แผนก: ${previewData.department}</div>
          <div class="field">วันที่ลา: ${previewData.leaveDate}</div>
          <div class="field">ช่วงเวลา: ${previewData.startTime} - ${previewData.endTime}</div>
          <div class="field">ประเภทการลา: ${previewData.leaveType}</div>
          <div class="field">เบอร์ผู้ปกครอง: ${previewData.parentPhone || "-"}</div>
          <div class="field">หมายเหตุ: ${previewData.notes || "-"}</div>
          <div class="signature-section">
            <div class="signature-box">
              .......................................................<br />
              ลายเซ็นนักเรียน/นักศึกษา
            </div>
            <div class="signature-box">
              .......................................................<br />
              ลายเซ็นอาจารย์ผู้ตรวจสอบ
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    message.error("ไม่สามารถเปิดหน้าต่างสำหรับพิมพ์ได้ โปรดตรวจสอบ popup blocker");
  }
};


  return (
    <>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h2 style={{ marginBottom: 24 }}>แบบฟอร์มการขอลานักศึกษา</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="ชื่อ - นามสกุล"
                name="fullName"
                rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="รหัสนักศึกษา"
                name="studentId"
                rules={[{ required: true, message: "กรุณากรอกรหัสนักศึกษา" }]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <Form.Item
                label="เลขที่"
                name="classroom"
                rules={[{ required: true, message: "กรุณาเลือกเลขที่" }]}
              >
                <Input placeholder="เช่น 15" autoComplete="off" />
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <Form.Item
                label="ระดับชั้น"
                name="grade"
                rules={[{ required: true, message: "กรุณาเลือกชั้นเรียน" }]}
              >
                <Select placeholder="เลือกแผนก">
                  <Option value="ปวช.1">ปวช.1</Option>
                  <Option value="ปวช.2">ปวช.2</Option>
                  <Option value="ปวช.3">ปวช.3</Option>
                  <Option value="ปวส.1">ปวส.1</Option>
                  <Option value="ปวส.2">ปวส.2</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="แผนก"
                name="department"
                rules={[{ required: true, message: "กรุณาเลือกแผนก" }]}
              >
                <Select placeholder="เลือกแผนก">
                  <Option value="ช่างยนต์ และเครื่องกล">
                    ช่างยนต์ และเครื่องกล
                  </Option>
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
                  <Option value="ธุรกิจค้าปลีก การตลาด">
                    ธุรกิจค้าปลีก การตลาด
                  </Option>
                  <Option value="เมคคาทรอนิกส์ และหุ่นยนต์">
                    เมคคาทรอนิกส์ และหุ่นยนต์
                  </Option>
                  <Option value="เทคนิคเครื่องกลเรือ">
                    เทคนิคเครื่องกลเรือ
                  </Option>
                  <Option value="เทคโนโลยีธุรกิจดิจิทัล">
                    เทคโนโลยีธุรกิจดิจิทัล
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="ประเภทการลา"
                name="leaveType"
                rules={[{ required: true, message: "กรุณาเลือกประเภทการลา" }]}
              >
                <Select placeholder="เลือกประเภท">
                  <Option value="ลาป่วย">ลาป่วย</Option>
                  <Option value="ลากิจส่วนตัว">ลากิจส่วนตัว</Option>
                  <Option value="ลาเรียน">ลาเรียน</Option>
                  <Option value="ลาออกนอกสถานที่ (ชั่วคราว)">
                    ลาออกนอกสถานที่ (ชั่วคราว)
                  </Option>
                  <Option value="ลาเข้าค่าย / อบรม / กิจกรรม">
                    ลาเข้าค่าย / อบรม / กิจกรรม
                  </Option>
                  <Option value="ลาอื่น ๆ">ลาอื่น ๆ</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="วันที่ลา"
                name="leaveDate"
                rules={[{ required: true, message: "กรุณาเลือกวันลา" }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <Form.Item
                label="เวลาเริ่มลา"
                name="startTime"
                rules={[{ required: true, message: "กรุณาเลือกเวลาเริ่มลา" }]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6}>
              <Form.Item
                label="เวลาสิ้นสุดลา"
                name="endTime"
                rules={[{ required: true, message: "กรุณาเลือกเวลาสิ้นสุดลา" }]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="เบอร์ติดต่อผู้ปกครอง"
                name="parentPhone"
                rules={[
                  { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
                  {
                    pattern: /^0[689]\d{8}$/,
                    message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง",
                  },
                ]}
              >
                <Input placeholder="089-xxxxxxx" autoComplete="off" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="รายละเอียดเพิ่มเติม"
                name="notes"
                rules={[
                  { required: true, message: "กรุณากรอกรายละเอียดเพิ่มเติม" },
                ]}
              >
                <Input.TextArea rows={3} autoComplete="off" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="แนบไฟล์ (PDF / JPG)" name="attachment">
                <Upload
                  accept=".pdf,.jpg,.jpeg"
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={handleChange}
                  maxCount={1}
                  showUploadList={{ showRemoveIcon: true }}
                  onPreview={async (file) => {
                    let src = file.url;
                    if (!src && file.originFileObj) {
                      src = URL.createObjectURL(file.originFileObj);
                    }
                    if (src) {
                      const link = document.createElement("a");
                      link.href = src;
                      link.download = file.name || "download"; // กำหนดชื่อไฟล์ได้ที่นี่
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      message.error("ไม่สามารถดาวน์โหลดไฟล์ได้");
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>แนบไฟล์</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit">
              ตรวจสอบข้อมูลก่อนบันทึก
            </Button>
          </Form.Item>
        </Form>

        <Modal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          title="ยืนยันข้อมูลก่อนบันทึก"
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              ยกเลิก
            </Button>,
            <Button key="print" onClick={handlePrintWindow}>
              พิมพ์เอกสาร
            </Button>,
            <Button key="submit" type="primary" onClick={handleConfirm}>
              ยืนยันและบันทึก
            </Button>,
          ]}
        >
          {previewData && (
            <div style={{ padding: 12 }}>
              <p>ชื่อ: {previewData.fullName}</p>
              <p>แผนก: {previewData.department}</p>
              <p>วันที่ลา: {previewData.leaveDate}</p>
              <p>
                ช่วงเวลา: {previewData.startTime} - {previewData.endTime}
              </p>
              <p>ประเภทการลา: {previewData.leaveType}</p>
              <p>เบอร์ผู้ปกครอง: {previewData.parentPhone || "-"}</p>
              <p>หมายเหตุ: {previewData.notes || "-"}</p>
              <div>แนบไฟล์:</div> {/* เปลี่ยนจาก <p> เป็น <div> */}
              {previewData?.attachment && previewData.attachment.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  {previewData.attachment.map((f: any) =>
                    f.type.startsWith("image/") ? (
                      <img
                        key={f.name}
                        src={`data:${f.type};base64,${f.base64}`}
                        alt={f.name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      <a
                        key={f.name}
                        href={`data:${f.type};base64,${f.base64}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block", color: "#1890ff" }}
                      >
                        {f.name} (PDF)
                      </a>
                    )
                  )}
                </div>
              ) : (
                <div>-</div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default LeaveForm;
