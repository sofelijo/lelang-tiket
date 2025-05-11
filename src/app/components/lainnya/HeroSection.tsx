"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const emojis = ["🎉", "🔥", "🎶", "🕺", "🎤", "✨"];
const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backgroundTranslate = scrollY * 0.3;
  const overlayTranslate = scrollY * 0.4;

  return (
    <section
      ref={sectionRef}
      className="relative h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 will-change-transform"
        style={{ transform: `translateY(${backgroundTranslate}px)` }}
      />

      {/* Overlay Blur */}
      <motion.div
        className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm will-change-transform"
        style={{ transform: `translateY(${overlayTranslate}px)` }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-6 md:px-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold mb-4"
        >
          {randomEmoji} Temukan Tiket Konser Favoritmu!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl mb-6"
        >
          Jelajahi berbagai konser seru dan dapatkan tiket dengan harga terbaik. Yuk, mulai petualangan musikmu sekarang!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button className="bg-white text-black hover:bg-gray-200 px-6 py-3 text-lg font-semibold rounded-full shadow-lg">
            Jelajahi Tiket
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
