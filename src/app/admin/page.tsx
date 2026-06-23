"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type PendingItem = {
  file: string;
  uploadedAt: string;
};

type PublicImage = {
  name: string;
  url: string;
};

export default function AdminPage() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [publicImages, setPublicImages] = useState<PublicImage[]>([]);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [tab, setTab] = useState<"pending" | "public">("pending");
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

  const fetchPublic = useCallback(async () => {
    try {
      const res = await fetch("/api/images");
      const data = await res.json();
      setPublicImages(data.images || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchPending();
      fetchPublic();
    }
  }, [authenticated, fetchPending, fetchPublic]);

  // 恢复 session
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      pwRef.current = saved;
      setPassword(saved);
      setAuthenticated(true);
    }
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

  const getPw = () => sessionStorage.getItem("admin_pw") || pwRef.current || "";

  const handleReview = async (file: string, action: "approve" | "reject") => {
    const pw = getPw();
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ file, action }),
    });
    const data = await res.json();
    if (data.success) {
      setActionMsg(
        action === "approve" ? `✓ 已通过: ${file}` : `✗ 已拒绝: ${file}`
      );
      setTimeout(() => setActionMsg(""), 3000);
      fetchPending();
      fetchPublic();
    }
  };

  const handleDelete = async (file: string) => {
    if (!confirm(`确定要删除 "${file}" 吗？此操作不可恢复。`)) return;
    const pw = getPw();
    const res = await fetch("/api/images/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ file }),
    });
    const data = await res.json();
    if (data.success) {
      setActionMsg(`🗑 已删除: ${file}`);
      setTimeout(() => setActionMsg(""), 3000);
      fetchPublic();
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
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">📋 管理面板</h1>

        {actionMsg && (
          <div className="bg-zinc-800 text-green-400 px-4 py-2 rounded-lg mb-4">
            {actionMsg}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              tab === "pending"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("pending")}
          >
            待审核 ({pending.length})
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              tab === "public"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("public")}
          >
            已公开 ({publicImages.length})
          </button>
        </div>

        {/* 待审核 */}
        {tab === "pending" && (
          <>
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
                      <p
                        className="text-sm text-zinc-400 truncate"
                        title={item.file}
                      >
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
          </>
        )}

        {/* 已公开 */}
        {tab === "public" && (
          <>
            {publicImages.length === 0 ? (
              <p className="text-zinc-500">暂无已公开图片</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicImages.map((item) => (
                  <div
                    key={item.name}
                    className="bg-zinc-900 rounded-xl overflow-hidden"
                  >
                    <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="p-3">
                      <p
                        className="text-sm text-zinc-400 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <button
                        className="w-full mt-3 bg-red-700 text-white text-sm py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => handleDelete(item.name)}
                      >
                        删除 🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
