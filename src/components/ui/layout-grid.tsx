"use client";
import React from "react";

type Card = {
  id: number;
  content: string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  if (cards.length === 0) return null;

  return (
    <div className="w-full p-10 max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {cards.map((card) => (
        <a
          key={card.id}
          href={card.thumbnail}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-inside-avoid mb-4"
        >
          <div className="relative overflow-hidden rounded-xl bg-white/5">
            <img
              src={card.thumbnail}
              alt=""
              className="w-full h-auto block"
              draggable={false}
            />
          </div>
        </a>
      ))}
    </div>
  );
};
