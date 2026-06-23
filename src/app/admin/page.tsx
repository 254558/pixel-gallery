"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type PendingItem = {
  file: string;
  uploadedAt: string;
};

export default function AdminPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const pwRef = useRef("");

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/pending");
      const data = await res.json();
      setPending(data.pending || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchPending();
  }, [authenticated, fetchPending]);

  // 恢复 session 或检查是否无需密码
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      pwRef.current = saved;
      setPassword(saved);
      setAuthenticated(true);
      return;
    }
    // 没有密码保护，直接进入
    fetch("/api/pending")
      .then((res) => res.json())
      .then((data) => {
        if (data.pending !== undefined) {
          setAuthenticated(true);
        }
      });
  }, []);

  const handleLogin = async () => {
    const pw = password;
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ action: "ping" }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_pw", pw);
      pwRef.current = pw;
      setAuthenticated(true);
    } else {
      alert("密码错误");
    }
  };

  const handleReview = async (file: string, action: "approve" | "reject") => {
    const pw = sessionStorage.getItem("admin_pw") || pwRef.current || "";
    const res = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": pw,
      },
      body: JSON.stringify({ file, action }),
    });
    const data = await res.json();
    if (data.success) {
      setActionMsg(
        action === "approve" ? `✓ 已通过: ${file}` : `✗ 已拒绝: ${file}`
      );
      setTimeout(() => setActionMsg(""), 3000);
      fetchPending();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-zinc-900 p-8 rounded-xl">
          <h1 className="text-white text-xl mb-4">管理员登录</h1>
          <input
            type="password"
            placeholder="输入管理密码"
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700"
            onClick={handleLogin}
          >
            进入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">📋 图片审核</h1>

        {actionMsg && (
          <div className="bg-zinc-800 text-green-400 px-4 py-2 rounded-lg mb-4">
            {actionMsg}
          </div>
        )}

        {pending.length === 0 ? (
          <p className="text-zinc-500">暂无待审核图片</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((item) => (
              <div
                key={item.file}
                className="bg-zinc-900 rounded-xl overflow-hidden"
              >
                <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={`/api/uploads/${item.file}`}
                    alt={item.file}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-zinc-400 truncate" title={item.file}>
                    {item.file}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(item.uploadedAt).toLocaleString("zh-CN")}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-green-600 text-white text-sm py-1.5 rounded-lg hover:bg-green-700"
                      onClick={() => handleReview(item.file, "approve")}
                    >
                      通过 ✓
                    </button>
                    <button
                      className="flex-1 bg-red-600 text-white text-sm py-1.5 rounded-lg hover:bg-red-700"
                      onClick={() => handleReview(item.file, "reject")}
                    >
                      拒绝 ✗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
