'use client';

import { useState, useEffect } from 'react';
import { reviewsApi, CourseReview, ReviewStats } from '@/lib/api';

function StarRating({ rating, size = 'text-xl' }: { rating: number; size?: string }) {
  return (
    <span className={`${size} tracking-wider`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

function StarPicker({ rating, onChange }: { rating: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="text-3xl cursor-pointer tracking-wider">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function DistributionBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right font-bold">{star}★</span>
      <div className="flex-1 h-4 bg-white border-2 border-black">
        <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-left text-gray-600">{count}</span>
    </div>
  );
}

export function CourseReviewSection({
  courseId,
  enrolled,
  currentUserId,
}: {
  courseId: string;
  enrolled: boolean;
  currentUserId?: string;
}) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const s = await reviewsApi.stats(courseId);
      setStats(s);
    } catch {}
  };

  const loadReviews = async (p: number, append = false) => {
    try {
      const data = await reviewsApi.list(courseId, p, 5);
      if (append) {
        setReviews((prev) => [...prev, ...data.reviews]);
      } else {
        setReviews(data.reviews);
      }
      setHasMore(p < data.pagination.totalPages);
      setPage(p);

      // Find my review
      if (currentUserId && !append) {
        const mine = data.reviews.find((r) => r.user.id === currentUserId);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment || '');
          setMyReviewId(mine.id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadStats();
    loadReviews(1);
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      setSubmitting(true);
      await reviewsApi.upsert(courseId, { rating, comment: comment || undefined });
      await loadStats();
      await loadReviews(1);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewsApi.delete(courseId, reviewId);
      if (reviewId === myReviewId) {
        setMyReviewId(null);
        setRating(0);
        setComment('');
      }
      await loadStats();
      await loadReviews(1);
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleShowMore = () => {
    loadReviews(page + 1, true);
  };

  if (!stats || stats.totalReviews === 0) {
    // Show form for enrolled users even when no reviews yet
    if (!enrolled) return null;

    return (
      <div className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="px-6 py-5 bg-[#ffdb33] border-b-[4px] border-black">
          <h2 className="font-black text-2xl text-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            RATINGS & REVIEWS
          </h2>
          <p className="text-sm font-bold mt-1">Be the first to review this course!</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Your Rating</label>
              <StarPicker rating={rating} onChange={setRating} />
            </div>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this course..."
                className="w-full px-4 py-3 border-[3px] border-black text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#ffdb33]"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-3 bg-black text-white font-black border-[3px] border-black hover:bg-gray-800 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#ffdb33] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
      {/* Header */}
      <div className="px-6 py-5 bg-[#ffdb33] border-b-[4px] border-black flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            ★ {stats.averageRating?.toFixed(1)}
          </span>
          <div>
            <h2 className="font-black text-xl text-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              RATINGS & REVIEWS
            </h2>
            <span className="text-sm font-bold bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="px-6 py-4 border-b-[3px] border-black bg-gray-50">
        <div className="max-w-sm space-y-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <DistributionBar
              key={star}
              star={star}
              count={stats.distribution[String(star)] || 0}
              max={maxCount}
            />
          ))}
        </div>
      </div>

      {/* Review Form (enrolled only) */}
      {enrolled && (
        <div className="px-6 py-5 border-b-[3px] border-black">
          <h3 className="font-black text-lg mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {myReviewId ? 'Update Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <StarPicker rating={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this course..."
              className="w-full px-4 py-3 border-[3px] border-black text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_#ffdb33]"
              rows={3}
            />
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-3 bg-black text-white font-black border-[3px] border-black hover:bg-gray-800 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#ffdb33] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {submitting ? 'Submitting...' : myReviewId ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Review List */}
      <div className="divide-y-[3px] divide-black">
        {reviews.map((review) => (
          <div key={review.id} className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-gray-200 flex-shrink-0">
                  {review.user.avatarUrl ? (
                    <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                      {(review.user.fullName ?? '?')[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {review.user.fullName || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="text-sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {currentUserId === review.user.id && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
            {review.comment && (
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="px-6 py-4 border-t-[3px] border-black bg-gray-50 text-center">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 bg-white border-[3px] border-black font-bold text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition-all"
          >
            Show More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
