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

  useEffect(() => {
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
  }, []);

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <header className="text-center mb-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          📷 图片展示
        </h1>
      </header>

      <LayoutGrid cards={cards} />
    </div>
  );
}
