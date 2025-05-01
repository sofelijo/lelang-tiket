"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Banner() {
  const banners = [
    {
      title: "Diskon Tiket Konser 20%",
      image: "/banner1.jpg",
    },
    {
      title: "Lelang Tiket VIP Sekarang!",
      image: "/banner2.jpg",
    },
    {
      title: "Jual Tiketmu di sini",
      image: "/banner3.jpg",
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000, // 3 detik
          disableOnInteraction: false,
        }}
        loop={true}
        spaceBetween={30}
        className="mySwiper"
      >
        {banners.map((banner, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex items-center justify-between bg-gray-100">
              <div className="p-6 w-1/2 text-black text-xl font-bold">
                {banner.title}
              </div>
              <img
                src={banner.image}
                alt="banner"
                className="w-1/2 h-48 object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
