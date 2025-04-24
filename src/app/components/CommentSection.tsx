'use client';

import { useState, useEffect } from 'react';
import { CommentWithUser } from "@/lib/types";
import clsx from 'clsx';

interface CommentSectionProps {
  itemId: string;
  itemType: 'ticket' | 'konser' | string; // fleksibel bisa tambah tipe lain
  title?: string;
  readonly?: boolean;
  className?: string;
}

export default function CommentSection({
  itemId,
  itemType,
  title = 'Komentar',
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
      alert('Gagal menambahkan komentar');
    }

    setLoading(false);
  };

  return (
    <div className={clsx("mt-6", className)}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      {!readonly && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            className="w-full p-2 rounded bg-gray-800 text-white mb-2"
            placeholder="Tulis komentar..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-400">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-gray-800 p-3 rounded">
              <p className="font-semibold">{comment.user?.name ?? 'Anonim'}</p>
              <p className="text-sm text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
