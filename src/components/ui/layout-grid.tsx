"use client";
import React, { useState, useCallback } from "react";

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
  index: number;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<{ src: string; index: number } | null>(null);

  const open = useCallback((src: string, index: number) => setSelected({ src, index }), []);
  const close = useCallback(() => setSelected(null), []);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="w-full p-10 max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="block break-inside-avoid mb-4 cursor-pointer"
            onClick={() => open(card.thumbnail, i)}
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={close}
        >
          <div className="relative flex items-center justify-center">
            {/* 编号：右下角，半透明，小字 */}
            <div className="absolute bottom-3 right-3 text-zinc-500/60 text-xs font-mono select-none pointer-events-none">
              #{selected.index}
            </div>
            <img
              src={selected.src}
              alt=""
              className="max-w-[85vw] max-h-[92vh] object-contain"
              style={{ imageRendering: 'pixelated' }}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
