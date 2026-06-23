"use client";
import React, { useState, useCallback } from "react";

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const open = useCallback((src: string, name: string) => {
    setSelected(src);
    setSelectedName(name);
  }, []);
  const close = useCallback(() => {
    setSelected(null);
    setSelectedName("");
  }, []);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="w-full p-10 max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="block break-inside-avoid mb-4 cursor-pointer"
            onClick={() => open(card.thumbnail, card.content)}
          >
            <div className="relative overflow-hidden rounded-xl bg-white/5">
              <img
                src={card.thumbnail}
                alt=""
                loading="lazy"
                className="w-full h-auto block"
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
          onClick={close}
        >
          <div className="relative">
            <img
              src={selected}
              alt=""
              className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] object-contain"
              style={{ imageRendering: 'pixelated' }}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
            />
            {/* 左下角文件名，点击复制 */}
            <div
              className="absolute bottom-4 left-4 text-zinc-400 text-xs font-mono select-none cursor-pointer hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(selectedName).then(() => {
                  // 简单反馈：文字闪一下白色
                  const el = e.currentTarget;
                  el.style.color = "#fff";
                  setTimeout(() => { el.style.color = ""; }, 400);
                });
              }}
              title="点击复制文件名"
            >
              {selectedName}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
