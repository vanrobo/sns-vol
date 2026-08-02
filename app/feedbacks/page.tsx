// app/feedbacks/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getEvents, submitFeedback } from "@/lib/data/events";
import type { Event } from "@/types";
import { Star, Loader2, Award } from "lucide-react";

export default function FeedbacksPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEvents("attended")
      .then((data) => {
        const unrated = data.filter((e) => !e.rating);
        setEvents(unrated);
        if (unrated[0]) setSelectedEvent(unrated[0].id);
      })
      .catch(() => toast.error("Failed to fetch events list"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating.");
    if (!selectedEvent) return toast.error("Select an event.");

    setSubmitting(true);
    try {
      await submitFeedback(selectedEvent, rating, comment);
      toast.success("Feedback submitted!");
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent));
      setRating(0);
      setComment("");
      setSelectedEvent("");
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 py-8">
        <div className="bg-[var(--surface)] rounded-3xl p-6 shadow-xl border border-[var(--border)] text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-emerald-600 fill-emerald-600" size={32} />
          </div>

          <h2 className="text-2xl font-extrabold mb-2">Rate Your Experience</h2>
          <p className="text-[var(--text-muted)] text-sm mb-8">
            How was your experience at the volunteering drive?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Select Event to Rate
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none font-medium"
              >
                {events.length === 0 && (
                  <option value="">No attended events to rate</option>
                )}
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    size={40}
                    className={`${(hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-700"} transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Write your feedback (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your concerns or suggestions here..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || events.length === 0}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : null}
              Submit Feedback
            </button>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
          <Award className="mx-auto text-yellow-300 mb-2" size={32} />
          <h3 className="font-bold text-lg mb-1">
            Love volunteering with SNS?
          </h3>
          <p className="text-sm opacity-95 mb-4">
            Support us by leaving a review on Google Business Profile.
          </p>
          <a
            href="https://g.page/r/your-google-review-link/review"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-white text-emerald-800 font-bold py-2 px-6 rounded-full text-sm shadow hover:bg-gray-100 transition-colors"
          >
            Rate us on Google
          </a>
        </div>
      </div>
    </MobileLayout>
  );
}
