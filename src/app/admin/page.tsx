"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "public">("pending");
  const [search, setSearch] = useState("");
  const pwRef = useRef("");

  const filteredPublic = useMemo(() => {
    if (!search) return publicImages;
    const q = search.trim().toLowerCase();
    return publicImages.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [publicImages, search]);

  // 固定星星位置，避免每次 re-render 重新生成
  const stars = useMemo(() =>
    Array.from({ length: 120 }).map((_, i) => ({
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.2,
    })),
  []);

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

  // restore session
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
      setActionMsg(action === "approve" ? "通过: " + file : "拒绝: " + file);
      setTimeout(() => setActionMsg(""), 3000);
      fetchPending();
      fetchPublic();
    }
  };

  const handleDelete = async (file: string) => {
    if (!confirm("确定要删除 " + file + " ? 此操作不可恢复。")) return;
    const pw = getPw();
    const res = await fetch("/api/images/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ file }),
    });
    const data = await res.json();
    if (data.success) {
      setActionMsg("已删除: " + file);
      setTimeout(() => setActionMsg(""), 3000);
      fetchPublic();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
	        <div className="absolute inset-0">
	          {stars.map((s, i) => (
	            <div
	              key={i}
	              className="absolute rounded-full bg-white"
	              style={{
	                width: s.width,
	                height: s.height,
	                top: s.top + "%",
	                left: s.left + "%",
	                opacity: s.opacity,
	              }}
	            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="bg-zinc-950 backdrop-blur-xl p-8 rounded-3xl border border-zinc-700">
            
            <input
              type="password"
              placeholder="输入管理密码"
              className="bg-zinc-900/80 text-white px-4 py-2.5 rounded-2xl w-full mb-4 border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              className="w-full bg-white text-black font-medium px-6 py-2.5 rounded-2xl hover:bg-zinc-200 transition-colors"
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
        

        {actionMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-800 text-green-400 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {actionMsg}
          </div>
        )}

        <div className="flex gap-1 mb-8 bg-zinc-900/50 rounded-2xl p-1 w-fit border border-zinc-800/50 backdrop-blur-sm">
          <button
            className={["px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200", tab === "pending" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-white"].join(" ")}
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
            className={["px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-200", tab === "public" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-white"].join(" ")}
            onClick={() => setTab("public")}
          >
            已公开
            <span className="ml-2 bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
              {search ? filteredPublic.length : publicImages.length}
            </span>
          </button>
        </div>

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
                    className="group relative bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-zinc-800 overflow-hidden">
                      <img
                        src={"/api/uploads/" + item.file}
                        alt={item.file}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                        style={{ imageRendering: "pixelated" }}
                        onClick={() => setSelectedImage("/api/uploads/" + item.file)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 pointer-events-none">
                      <p className="text-sm text-white/90 truncate font-medium drop-shadow-lg">
                        {item.file}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {new Date(item.uploadedAt).toLocaleString("zh-CN")}
                      </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                      <button
                        className="bg-green-500/90 hover:bg-green-500 text-white text-sm font-medium px-5 py-2 rounded-2xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100 pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); handleReview(item.file, "approve"); }}
                      >
                        通过
                      </button>
                      <button
                        className="bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium px-5 py-2 rounded-2xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100 pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); handleReview(item.file, "reject"); }}
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

        {tab === "public" && (
          <>
            {/* 搜索框 */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="搜索图片名称…"
                className="w-full max-w-md bg-zinc-900/80 text-white px-5 py-3 rounded-2xl border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredPublic.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-600 text-lg">
                  {search ? "没有匹配的图片" : "暂无已公开图片"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredPublic.map((item) => (
                  <div
                    key={item.name}
                    className="group relative bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-zinc-800 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                        style={{ imageRendering: "pixelated" }}
                        onClick={() => setSelectedImage(item.url)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 pointer-events-none">
                      <p className="text-sm text-white/90 truncate font-medium drop-shadow-lg">
                        {item.name}
                      </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        className="bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white text-sm font-medium px-6 py-2.5 rounded-2xl border border-white/20 hover:border-red-400/50 transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100 pointer-events-auto"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.name); }}
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

        {/* 全屏预览 */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="preview"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
