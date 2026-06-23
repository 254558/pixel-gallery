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
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
          <div className="relative bg-zinc-950 p-8 rounded-xl border border-zinc-800">
            <h1 className="text-white text-xl font-semibold mb-6 text-center">管理员登录</h1>
            <input
              type="password"
              placeholder="输入管理密码"
              className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg w-full mb-4 border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              className="w-full bg-white text-black font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
              onClick={handleLogin}
            >
              进入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 tracking-tight">管理面板</h1>

        {/* Toast 消息 */}
        {actionMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-800 text-green-400 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {actionMsg}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 rounded-xl p-1 w-fit border border-zinc-800/50 backdrop-blur-sm">
          <button
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === "pending"
                ? "bg-zinc-800 text-white shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("pending")}
          >
            待审核
            {pending.length > 0 && (
              <span className="ml-2 bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
          <button
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === "public"
                ? "bg-zinc-800 text-white shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => setTab("public")}
          >
            已公开
            <span className="ml-2 bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
              {publicImages.length}
            </span>
          </button>
        </div>

        {/* 待审核 — Focus Card 风格 */}
        {tab === "pending" && (
          <>
            {pending.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-600 text-lg">暂无待审核图片</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pending.map((item) => (
                  <div
                    key={item.file}
                    className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-zinc-800 overflow-hidden">
                      <img
                        src={`/api/uploads/${item.file}`}
                        alt={item.file}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{ imageRendering: "pixelated" }}
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* 底部信息 — 默认显示，hover 时上移 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-sm text-white/90 truncate font-medium drop-shadow-lg">
                        {item.file}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {new Date(item.uploadedAt).toLocaleString("zh-CN")}
                      </p>
                    </div>

                    {/* Hover 时浮现的操作按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                      <button
                        className="bg-green-500/90 hover:bg-green-500 text-white text-sm font-medium px-5 py-2 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                        onClick={() => handleReview(item.file, "approve")}
                      >
                        通过
                      </button>
                      <button
                        className="bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium px-5 py-2 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                        onClick={() => handleReview(item.file, "reject")}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 已公开 — Focus Card 风格 */}
        {tab === "public" && (
          <>
            {publicImages.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-600 text-lg">暂无已公开图片</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {publicImages.map((item) => (
                  <div
                    key={item.name}
                    className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-zinc-800 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{ imageRendering: "pixelated" }}
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* 文件名 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-sm text-white/90 truncate font-medium drop-shadow-lg">
                        {item.name}
                      </p>
                    </div>

                    {/* Hover 浮现删除按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                      <button
                        className="bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white text-sm font-medium px-6 py-2.5 rounded-xl border border-white/20 hover:border-red-400/50 transition-all hover:scale-105 active:scale-95"
                        onClick={() => handleDelete(item.name)}
                      >
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c-.84 0-1.673.025-2.5.075V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.325C11.673 4.025 10.84 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                          删除
                        </span>
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
