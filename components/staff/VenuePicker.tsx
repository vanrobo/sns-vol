"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, MapPin } from "lucide-react";
import {
  googleMapsSearchUrl,
  openStreetMapSearchUrl,
  searchVenues,
  type VenueSuggestion,
} from "@/lib/venue-search";

type VenuePickerProps = {
  value: string;
  onChange: (venue: string) => void;
  fieldKey: string;
  required?: boolean;
};

export default function VenuePicker({
  value,
  onChange,
  fieldKey,
  required,
}: VenuePickerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<VenueSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
    setSuggestions([]);
    setOpen(false);
  }, [fieldKey, value]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchVenues(query);
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const pickSuggestion = (suggestion: VenueSuggestion) => {
    setQuery(suggestion.label);
    onChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
  };

  const commitManual = () => {
    const next = query.trim();
    if (next !== value) onChange(next);
  };

  const showDropdown =
    open && (loading || suggestions.length > 0 || query.trim().length >= 2);

  return (
    <div ref={wrapRef} className="space-y-2">
      <div className="relative">
        <input
          required={required}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={commitManual}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search venue or type address…"
          className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
          autoComplete="off"
        />

        {showDropdown && (
          <ul className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
            {loading && (
              <li className="px-3 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Searching places…
              </li>
            )}

            {!loading &&
              suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-b border-[var(--border)] last:border-b-0"
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}

            {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
              <li className="px-3 py-2.5 text-xs text-slate-500">
                No matches — keep typing or paste the full address.
              </li>
            )}
          </ul>
        )}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Free place search (OpenStreetMap). Volunteers can still open the venue in
        Google Maps from the event page.
      </p>

      {value && (
        <div className="flex flex-wrap gap-3">
          <a
            href={googleMapsSearchUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <MapPin size={12} />
            Google Maps
            <ExternalLink size={10} />
          </a>
          <a
            href={openStreetMapSearchUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400"
          >
            OpenStreetMap
            <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
