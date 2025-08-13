import type { UserType } from "../types/UserType";

const API_URL = "http://localhost:3001/users";

// ✅ ดึงผู้ใช้ทั้งหมด
export async function getUsers(): Promise<UserType[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("โหลดข้อมูลล้มเหลว");
  return res.json();
}

// ✅ แก้ไขผู้ใช้ (รับ FormData ตรง ๆ)
export const editUser = async (id: number, formData: FormData): Promise<UserType> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`แก้ไขผู้ใช้ล้มเหลว: ${errorText}`);
  }

  return res.json();
};

// ✅ เพิ่มผู้ใช้ใหม่ (รับ FormData ตรง ๆ)
export async function createUser(formData: FormData): Promise<UserType> {
  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`เพิ่มผู้ใช้ล้มเหลว: ${errorText}`);
  }

  return res.json();
}

// ✅ แก้ไขผู้ใช้แบบ JSON (ไม่รองรับรูปภาพ)
export async function updateUser(id: number, data: Partial<UserType>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("แก้ไขข้อมูลล้มเหลว");
}

// ✅ ลบผู้ใช้
export async function deleteUser(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("ลบผู้ใช้ล้มเหลว");
}

// ✅ อัปเดตบทบาทผู้ใช้
export async function updateRole(id: number, role: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("อัปเดตบทบาทล้มเหลว");
}

// ✅ รีเซ็ตรหัสผ่าน
export async function resetPassword(id: number, password: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("รีเซ็ตรหัสผ่านล้มเหลว");
}

// ✅ อัปโหลดรูปภาพแยก
export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photoUrl", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");

  const data = await res.json();
  return data.url;
}
