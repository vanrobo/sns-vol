"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Trophy, Gift, Edit2, ChevronDown, UserMinus } from "lucide-react";
import type { Event, Profile } from "@/types";
import {
  getStaffAwards,
  getAwardRecipients,
  createAward,
  updateAward,
  grantAward,
  revokeAward,
  deleteAward,
  type StaffAwardRow,
  type AwardRecipient,
} from "@/lib/data/awards";
import Pagination, { paginate } from "@/components/staff/Pagination";

const PAGE_SIZE = 8;

type AwardsPanelProps = {
  volunteers: Profile[];
  events: Event[];
  canDelete?: boolean;
  floatingPagination?: boolean;
};

type EditForm = {
  title: string;
  description: string;
  event_id: string;
  icon: string;
  color: string;
};

function emptyEditForm(): EditForm {
  return {
    title: "",
    description: "",
    event_id: "",
    icon: "award",
    color: "#34c759",
  };
}

function awardToEditForm(a: StaffAwardRow): EditForm {
  return {
    title: a.title,
    description: a.description ?? "",
    event_id: a.event_id ?? "",
    icon: a.icon ?? "award",
    color: a.color ?? "#34c759",
  };
}

export default function AwardsPanel({
  volunteers,
  events,
  canDelete = false,
  floatingPagination = false,
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

  const [expandedAwardId, setExpandedAwardId] = useState<string | null>(null);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm());
  const [recipientsByAward, setRecipientsByAward] = useState<
    Record<string, AwardRecipient[]>
  >({});
  const [loadingRecipients, setLoadingRecipients] = useState<string | null>(
    null,
  );

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

  const loadRecipients = async (awardId: string) => {
    setLoadingRecipients(awardId);
    try {
      const result = await getAwardRecipients(awardId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setRecipientsByAward((prev) => ({ ...prev, [awardId]: result.recipients }));
    } catch {
      toast.error("Failed to load recipients.");
    } finally {
      setLoadingRecipients(null);
    }
  };

  const toggleExpanded = async (awardId: string) => {
    if (expandedAwardId === awardId) {
      setExpandedAwardId(null);
      return;
    }
    setExpandedAwardId(awardId);
    setEditingAwardId(null);
    if (!recipientsByAward[awardId]) {
      await loadRecipients(awardId);
    }
  };

  const startEdit = (award: StaffAwardRow) => {
    setEditingAwardId(award.id);
    setExpandedAwardId(null);
    setEditForm(awardToEditForm(award));
  };

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

  const handleUpdate = async (e: React.FormEvent, awardId: string) => {
    e.preventDefault();
    if (!editForm.title.trim()) return toast.error("Title is required.");
    setActioningId(`edit-${awardId}`);
    try {
      await updateAward(awardId, {
        title: editForm.title,
        description: editForm.description,
        event_id: editForm.event_id || null,
        icon: editForm.icon,
        color: editForm.color,
      });
      toast.success("Award updated!");
      setEditingAwardId(null);
      load();
    } catch {
      toast.error("Failed to update award.");
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
      const result = await grantAward(grantUserId, grantAwardId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Award granted!");
      setGrantUserId("");
      setGrantAwardId("");
      await load();
      if (recipientsByAward[grantAwardId]) {
        await loadRecipients(grantAwardId);
      }
    } catch {
      toast.error("Failed to grant award.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRevoke = async (awardId: string, recipient: AwardRecipient) => {
    if (
      !confirm(
        `Remove "${recipient.name}" from this award? They will no longer see it on their profile.`,
      )
    ) {
      return;
    }
    setActioningId(`revoke-${recipient.id}`);
    try {
      await revokeAward(recipient.id);
      toast.success("Award withdrawn.");
      setRecipientsByAward((prev) => ({
        ...prev,
        [awardId]: (prev[awardId] ?? []).filter((r) => r.id !== recipient.id),
      }));
      load();
    } catch {
      toast.error("Failed to withdraw award.");
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
      setExpandedAwardId(null);
      setEditingAwardId(null);
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

  const iconColorFields = (
    icon: string,
    color: string,
    onIcon: (v: string) => void,
    onColor: (v: string) => void,
  ) => (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={icon}
        onChange={(e) => onIcon(e.target.value)}
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
        value={color}
        onChange={(e) => onColor(e.target.value)}
        className="w-full h-12 border rounded-xl cursor-pointer border-[var(--border)]"
        title="Badge color"
      />
    </div>
  );

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
              {iconColorFields(newIcon, newColor, setNewIcon, setNewColor)}
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
              {paged.map((a) => {
                const isExpanded = expandedAwardId === a.id;
                const isEditing = editingAwardId === a.id;
                const recipients = recipientsByAward[a.id] ?? [];

                return (
                  <div
                    key={a.id}
                    className="border border-[var(--border)] rounded-xl overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: a.color ?? "#34c759" }}
                          />
                          <p className="font-bold">{a.title}</p>
                        </div>
                        {a.description && (
                          <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                        )}
                        <p className="text-[11px] text-emerald-600 font-bold mt-2">
                          {a.recipient_count} recipient
                          {a.recipient_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(a.id)}
                          className="text-xs text-[var(--text-muted)] font-bold hover:underline flex items-center gap-1"
                        >
                          Recipients
                          <ChevronDown
                            size={12}
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            disabled={actioningId === a.id}
                            onClick={() => handleDelete(a.id)}
                            className="text-xs text-red-500 font-bold hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <form
                        onSubmit={(e) => handleUpdate(e, a.id)}
                        className="px-4 pb-4 pt-0 space-y-3 border-t border-[var(--border)] bg-slate-50/50 dark:bg-[#18181B]/50"
                      >
                        <p className="text-xs font-bold text-[var(--text-muted)] pt-3 uppercase tracking-wider">
                          Edit award
                        </p>
                        <input
                          required
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, title: e.target.value }))
                          }
                          className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, description: e.target.value }))
                          }
                          rows={2}
                          className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
                        />
                        <select
                          value={editForm.event_id}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, event_id: e.target.value }))
                          }
                          className="w-full border p-3 rounded-xl dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm"
                        >
                          <option value="">Link to event (optional)</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.title}
                            </option>
                          ))}
                        </select>
                        {iconColorFields(
                          editForm.icon,
                          editForm.color,
                          (icon) => setEditForm((f) => ({ ...f, icon })),
                          (color) => setEditForm((f) => ({ ...f, color })),
                        )}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={actioningId === `edit-${a.id}`}
                            className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-50"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAwardId(null)}
                            className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[var(--border)]">
                        <p className="text-xs font-bold text-[var(--text-muted)] pt-3 pb-2 uppercase tracking-wider">
                          Who has this award
                        </p>
                        {loadingRecipients === a.id ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : recipients.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">
                            No volunteers have this award yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {recipients.map((r) => (
                              <li
                                key={r.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#18181B]"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {r.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {r.college} ·{" "}
                                    {new Date(r.awarded_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={actioningId === `revoke-${r.id}`}
                                  onClick={() => handleRevoke(a.id, r)}
                                  className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 shrink-0"
                                >
                                  <UserMinus size={12} /> Withdraw
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Pagination
              total={awards.length}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              floating={floatingPagination}
            />
          </>
        )}
      </div>
    </div>
  );
}
