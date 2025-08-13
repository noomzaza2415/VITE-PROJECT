// src/components/PasswordDemo.tsx
import React, { useState } from 'react';
import { hashPassword, comparePassword } from '../utils/hash';

const PasswordDemo: React.FC = () => {
  const [plain, setPlain] = useState('');
  const [hashed, setHashed] = useState('');
  const [match, setMatch] = useState<boolean | null>(null);

  const handleHash = () => {
    const hash = hashPassword(plain);
    setHashed(hash);
    setMatch(null); // reset
  };

  const handleCompare = () => {
    const result = comparePassword(plain, hashed);
    setMatch(result);
  };

  return (
    <div className="p-4 space-y-2">
      <input
        value={plain}
        onChange={(e) => setPlain(e.target.value)}
        placeholder="กรอกรหัสผ่าน"
        className="border p-2 w-full"
      />
      <div className="flex gap-2">
        <button onClick={handleHash} className="bg-blue-500 text-white px-4 py-2 rounded">
          แฮช
        </button>
        <button onClick={handleCompare} className="bg-green-500 text-white px-4 py-2 rounded">
          เปรียบเทียบ
        </button>
      </div>
      <div><strong>Hash:</strong> {hashed}</div>
      <div>
        <strong>ผลการเปรียบเทียบ:</strong>{" "}
        {match === null ? "ยังไม่ตรวจ" : match ? "✅ ตรงกัน" : "❌ ไม่ตรงกัน"}
      </div>
    </div>
  );
};

export default PasswordDemo;
