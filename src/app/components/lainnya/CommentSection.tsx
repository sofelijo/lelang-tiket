'use client';

import { useState, useEffect } from 'react';
import { CommentWithUser } from "@/lib/types";
import clsx from 'clsx';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  itemId: string;
  itemType: 'ticket' | 'konser' | string;
  title?: string;
  readonly?: boolean;
  className?: string;
}

export default function CommentSection({
  itemId,
  itemType,
  title = '💬 Komentar Warga',
  readonly = false,
  className,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?itemId=${itemId}&itemType=${itemType}`)
      .then(res => res.json())
      .then(data => {
        setComments(data.comments ?? []);
      })
      .catch(() => setComments([]));
  }, [itemId, itemType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemType, content }),
    });

    const data = await res.json();
    if (res.ok) {
      setComments(prev => [data, ...prev]);
      setContent('');
    } else {
      alert('❌ Gagal kirim komentar');
    }
    setLoading(false);
  };

  return (
    <div className={clsx("mt-6 space-y-4", className)}>
      <h2 className="text-xl font-bold">{title}</h2>

      {!readonly && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Tulis unek-unek kamu di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-background border-muted"
          />
          <div className="text-right">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Mengirim..." : "🚀 Kirim"}
            </Button>
          </div>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada komentar gengs~</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="border rounded-xl p-4 hover:bg-muted transition"
            >
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">{comment.user?.name ?? "Anonim"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
