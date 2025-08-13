import { useState } from "react";
import { hashPassword, comparePassword } from "../utils/hash";

const PasswordTest = () => {
  const [plain, setPlain] = useState("");
  const [hashed, setHashed] = useState("");
  const [match, setMatch] = useState<boolean | null>(null);

  const handleHash = () => {
    const hash = hashPassword(plain);
    setHashed(hash);
    setMatch(null);
  };

  const handleCompare = () => {
    setMatch(comparePassword(plain, hashed));
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-bold">ทดสอบ bcryptjs</h2>
      <input
        value={plain}
        onChange={(e) => setPlain(e.target.value)}
        placeholder="กรอกรหัสผ่าน"
        className="w-full border p-2"
      />
      <div className="flex gap-2">
        <button onClick={handleHash} className="bg-blue-500 text-white px-4 py-2 rounded">
          แฮช
        </button>
        <button onClick={handleCompare} className="bg-green-500 text-white px-4 py-2 rounded">
          เปรียบเทียบ
        </button>
      </div>
      <div className="break-words"><strong>Hash:</strong> {hashed}</div>
      <div>
        <strong>ผลการเปรียบเทียบ:</strong>{" "}
        {match === null ? "ยังไม่ตรวจ" : match ? "✅ ตรงกัน" : "❌ ไม่ตรงกัน"}
      </div>
    </div>
  );
};

export default PasswordTest;
