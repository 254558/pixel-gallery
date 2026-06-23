"use client";

import { LayoutGrid } from "@/components/ui/layout-grid";
import { useEffect, useState } from "react";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadImages = () => {
    fetch("/api/images")
      .then((res) => res.json())
      .then((data: { images: string[] }) => {
        const imgs = data.images.filter((name) =>
          IMAGE_EXTS.some((ext) => name.toLowerCase().endsWith(ext))
        );
        setCards(
          imgs.map((name, i) => ({
            id: i + 1,
            content: name,
            className: "",
            thumbnail: `/${name}`,
          }))
        );
      });
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        loadImages();
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
      // 清空 input 以便重复选择同一文件
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 右上角上传按钮 */}
      <div className="fixed top-4 right-4 z-40">
        <label className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors">
          {uploading ? (
            <span>上传中...</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636V13.25z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              上传
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {cards.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      ) : (
        <div className="pt-12">
          <LayoutGrid cards={cards} />
        </div>
      )}
    </div>
  );
}
