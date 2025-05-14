"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const emojis = ["🎉", "🔥", "🎶", "💃🏼", "🎤", "✨","🕺","🥳","🪩"];

interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    fetch("/api/banner")
      .then((res) => res.json())
      .then((data: BannerItem[]) => {
        const now = new Date();
        const active = data.filter((b) => {
          const start = b.startDate ? new Date(b.startDate) : null;
          const end = b.endDate ? new Date(b.endDate) : null;
          return (
            b.isActive &&
            (!start || start <= now) &&
            (!end || end >= now)
          );
        });
        setBanners(active);
      })
      .catch(console.error);
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="rounded-none overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        spaceBetween={0}
        className="mySwiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <a href={banner.link || "#"}>
              <Card className="relative w-full h-64 md:h-80 rounded-none overflow-hidden border-0">
                <div className="absolute inset-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover brightness-[0.5]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 flex flex-col items-start justify-center h-full px-6 md:px-12 text-white "
                >
                  <h2 className="text-2xl md:text-4xl font-extrabold drop-shadow-md">
                    {emojis[Math.floor(Math.random() * emojis.length)]} {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="mt-2 text-sm md:text-base text-white/90 max-w-md">
                      {banner.description}
                    </p>
                  )}
                  {banner.link && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button className="mt-4 bg-white text-black hover:bg-zinc-200 shadow">
                        Lihat Selengkapnya
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </Card>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
