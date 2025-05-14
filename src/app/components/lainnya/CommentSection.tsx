"use client";

import { useState, useEffect, useRef } from "react";
import { CommentWithUser } from "@/lib/types";
import clsx from "clsx";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import EmojiPicker from "emoji-picker-react";

interface CommentSectionProps {
  itemId: string;
  itemType: "ticket" | "konser" | string;
  title?: string;
  readonly?: boolean;
  className?: string;
  currentUserId?: string;
  sellerId?: string;
}

export default function CommentSection({
  itemId,
  itemType,
  title = "💬 Komentar Warga",
  readonly = false,
  className,
  currentUserId,
  sellerId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/comments?itemId=${itemId}&itemType=${itemType}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(() => setComments([]));
  }, [itemId, itemType]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, itemType, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((prev) => [...prev, data]);
      setContent("");
    } else {
      alert("❌ Gagal kirim komentar - Wajib login");
    }
    setLoading(false);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const formatTime = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const tanggal = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
    });
    const waktu = d
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(".", ":");
    return `${tanggal} ${waktu}`;
  };

  return (
    <div className={clsx("mt-6 space-y-4", className)}>
      <h2 className="text-xl font-bold">{title}</h2>

      <div
        className="h-[400px] overflow-y-auto bg-transparent rounded-xl p-4 space-y-3"
        ref={containerRef}
      >
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada komentar gengs~
          </p>
        ) : (
          comments
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((comment) => {
              const isSeller = comment.user?.id === sellerId;
              const profileImg = comment.user?.image?.startsWith("/uploads/")
                ? comment.user.image
                : "/images/default-avatar.png";
              return (
                <div
                  key={comment.id}
                  className={clsx(
                    "flex w-full",
                    isSeller ? "justify-end" : "justify-start"
                  )}
                >
                  {!isSeller && (
                    <img
                      src={
                        comment.user?.image?.startsWith("/uploads/")
                          ? comment.user.image
                          : "/images/default-avatar.png"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-xl object-cover mr-2 self-end"
                    />
                  )}

                  <div
                    className={clsx(
                      "max-w-md px-4 py-2 rounded-xl",
                      isSeller ? "bg-green-50 text-right" : "bg-muted text-left"
                    )}
                  >
                    <div className="text-sm text-muted-foreground font-medium flex justify-between gap-2">
                      <span>
                        @{comment.user?.username ?? "anonim"}{" "}
                        {isSeller && (
                          <span className="text-green-600">(Penjual)</span>
                        )}
                      </span>
                      <span className="text-xs">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-left text-foreground break-words whitespace-pre-wrap mt-1">
                      {comment.content}
                    </p>
                  </div>

                  {isSeller && (
                    <img
                      src={
                        comment.user?.image?.startsWith("/uploads/")
                          ? comment.user.image
                          : "/images/default-avatar.png"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-xl object-cover ml-2 self-end"
                    />
                  )}
                </div>
              );
            })
        )}
      </div>

      {!readonly && (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Tulis sesuatu..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none bg-background border border-border rounded-xl px-4 py-2 pr-16 max-h-32 overflow-auto text-black"
          />
          <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              😊
            </Button>
            <Button type="submit" disabled={loading} size="icon">
              {loading ? "..." : "📨"}
            </Button>
          </div>
        </form>
      )}

      {showEmoji && (
        <div className="absolute bottom-20 right-4 z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
