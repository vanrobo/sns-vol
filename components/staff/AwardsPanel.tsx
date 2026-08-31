"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Trophy, Gift } from "lucide-react";
import type { Event, Profile } from "@/types";
import {
  getStaffAwards,
  createAward,
  grantAward,
  deleteAward,
  type StaffAwardRow,
} from "@/lib/data/awards";
import Pagination, { paginate } from "@/components/staff/Pagination";

const PAGE_SIZE = 8;

type AwardsPanelProps = {
  volunteers: Profile[];
  events: Event[];
  canDelete?: boolean;
};

export default function AwardsPanel({
  volunteers,
  events,
  canDelete = false,
}: AwardsPanelProps) {
  const [awards, setAwards] = useState<StaffAwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEventId, setNewEventId] = useState("");
  const [newIcon, setNewIcon] = useState("award");
  const [newColor, setNewColor] = useState("#34c759");

  const [grantUserId, setGrantUserId] = useState("");
  const [grantAwardId, setGrantAwardId] = useState("");

  const load = useCallback(async () => {
    try {
      setAwards(await getStaffAwards());
    } catch {
      toast.error("Failed to load awards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.error("Title is required.");
    setActioningId("create");
    try {
      await createAward({
        title: newTitle.trim(),
        description: newDesc.trim(),
        event_id: newEventId || null,
        icon: newIcon,
        color: newColor,
      });
      toast.success("Award created!");
      setNewTitle("");
      setNewDesc("");
      setNewEventId("");
      setShowCreate(false);
      load();
    } catch {
      toast.error("Failed to create award.");
    } finally {
      setActioningId(null);
    }
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId || !grantAwardId) {
      return toast.error("Select a volunteer and an award.");
    }
    setActioningId(`grant-${grantUserId}`);
    try {
      await grantAward(grantUserId, grantAwardId);
      toast.success("Award granted!");
      setGrantUserId("");
      setGrantAwardId("");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to grant award.";
      toast.error(msg.includes("duplicate") ? "Volunteer already has this award." : msg);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (awardId: string) => {
    if (!confirm("Delete this award? All grants will be removed.")) return;
    setActioningId(awardId);
    try {
      await deleteAward(awardId);
      toast.success("Award deleted.");
      load();
    } catch {
      toast.error("Failed to delete award.");
    } finally {
      setActioningId(null);
    }
  };

  const activeVolunteers = volunteers.filter(
    (v) => v.role === "volunteer" && v.status === "active",
  );
  const paged = paginate(awards, page, PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Create Award
            </h3>
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> New
            </button>
          </div>
          {showCreate && (
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Award title (e.g. Star Volunteer 2026)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
              />
              <select
                value={newEventId}
                onChange={(e) => setNewEventId(e.target.value)}
                className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
              >
                <option value="">Link to event (optional)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
                >
                  <option value="award">Award icon</option>
                  <option value="trophy">Trophy</option>
                  <option value="medal">Medal</option>
                  <option value="star">Star</option>
                  <option value="heart">Heart</option>
                </select>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-12 border rounded-xl cursor-pointer border-[var(--border)]"
                  title="Badge color"
                />
              </div>
              <button
                type="submit"
                disabled={actioningId === "create"}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                Create Award
              </button>
            </form>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Gift size={20} className="text-emerald-600" /> Grant to Volunteer
          </h3>
          <form onSubmit={handleGrant} className="space-y-3">
            <select
              required
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
            >
              <option value="">Select volunteer</option>
              {activeVolunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.college})
                </option>
              ))}
            </select>
            <select
              required
              value={grantAwardId}
              onChange={(e) => setGrantAwardId(e.target.value)}
              className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
            >
              <option value="">Select award</option>
              {awards.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!!actioningId?.startsWith("grant")}
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              Grant Award
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
        <h3 className="text-xl font-bold mb-4">All Awards</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : awards.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No awards yet. Create one above.</p>
        ) : (
          <>
            <div className="space-y-3">
              {paged.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-start gap-4 p-4 border border-[var(--border)] rounded-xl"
                >
                  <div>
                    <p className="font-bold">{a.title}</p>
                    {a.description && (
                      <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                    )}
                    <p className="text-[11px] text-emerald-600 font-bold mt-2">
                      {a.recipient_count} recipient{a.recipient_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      disabled={actioningId === a.id}
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-red-500 font-bold hover:underline shrink-0"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              total={awards.length}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
