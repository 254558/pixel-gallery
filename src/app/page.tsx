"use client";

import { LayoutGrid } from "@/components/ui/layout-grid";
import { DotmSquare17 } from "@/components/ui/dotm-square-17";
import { useCallback, useEffect, useRef, useState } from "react";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const PAGE_SIZE = 20;

type ImageItem = {
  name: string;
  url: string;
};

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleCards = allCards.slice(0, visibleCount);
  const hasMore = visibleCount < allCards.length;

  const loadImages = () => {
    fetch("/api/images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: { images: ImageItem[] }) => {
        const imgs = data.images.filter((item) =>
          IMAGE_EXTS.some((ext) => item.name.toLowerCase().endsWith(ext))
        );
        setAllCards(
          imgs.map((item, i) => ({
            id: i + 1,
            content: item.name,
            className: "",
            thumbnail: item.url,
          }))
        );
        setLoaded(true);
      })
      .catch(() => {
        setAllCards([]);
        setLoaded(true);
      });
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Intersection Observer — 滚动到底部时加载更多
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allCards.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, allCards.length]);

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

      {!loaded ? (
        <div className="min-h-screen flex items-center justify-center">
          <DotmSquare17
            size={160}
            dotSize={8}
            speed={1.4}
            opacityBase={0.1}
            opacityMid={0.4}
            opacityPeak={0.95}
            className="text-zinc-400"
          />
        </div>
      ) : visibleCards.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">暂无图片</p>
        </div>
      ) : (
        <div className="pt-12">
          <LayoutGrid cards={visibleCards} />
          {/* 哨兵元素：滚动到此处触发加载更多 */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
