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
    <div className="w-full p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto gap-4">
      {cards.map((card) => (
        <a
          key={card.id}
          href={card.thumbnail}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
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
