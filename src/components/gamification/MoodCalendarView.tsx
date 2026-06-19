// src/components/gamification/MoodCalendarView.tsx
import { useMoodLogs, useLogMood, MoodType } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

// ─── Mood config ─────────────────────────────────────────────────────────────

const MOODS: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "great",   emoji: "😄", label: "Great",   color: "bg-green-400"  },
  { value: "good",    emoji: "🙂", label: "Good",    color: "bg-lime-400"   },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "bg-yellow-400" },
  { value: "bad",     emoji: "😞", label: "Bad",     color: "bg-orange-400" },
  { value: "terrible",emoji: "😢", label: "Terrible",color: "bg-red-400"    },
];

const MOOD_EMOJI: Record<MoodType, string> = {
  great: "😄", good: "🙂", neutral: "😐", bad: "😞", terrible: "😢",
};
const MOOD_COLOR: Record<MoodType, string> = {
  great: "bg-green-400", good: "bg-lime-400", neutral: "bg-yellow-400",
  bad: "bg-orange-400", terrible: "bg-red-400",
};

// ─── Mood Logger ─────────────────────────────────────────────────────────────

export function MoodLogger() {
  const logMood = useLogMood();
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selected) return;
    logMood.mutate({ mood: selected, note: note.trim() || undefined });
    setSelected(null);
    setNote("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-card-foreground mb-1">How are you feeling today?</h3>
      <p className="text-xs text-muted-foreground mb-4">Log your mood once a day</p>

      {/* Mood Selector */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
              selected === m.value
                ? "border-primary scale-110 shadow-md"
                : "border-transparent hover:border-border"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Optional note */}
      {selected && (
        <textarea
          className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm resize-none mb-3 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Add a note (optional)..."
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}

      <Button
        className="w-full"
        disabled={!selected || logMood.isPending}
        onClick={handleSubmit}
      >
        {logMood.isPending ? "Saving..." : "Log Mood"}
      </Button>
    </div>
  );
}

// ─── Mood Calendar ───────────────────────────────────────────────────────────

export function MoodCalendarView() {
  const { data: logs, isLoading } = useMoodLogs();

  // Build a map: date string → mood
  const moodMap: Record<string, MoodType> = {};
  logs?.forEach((l) => { moodMap[l.logged_at] = l.mood; });

  // Generate last 30 days
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-3 flex-wrap mb-4">
        {MOODS.map((m) => (
          <div key={m.value} className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={`w-3 h-3 rounded-sm ${m.color}`} />
            {m.label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Day labels */}
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[10px] text-center text-muted-foreground font-medium pb-1">
            {d}
          </div>
        ))}

        {/* Empty cells to align first day */}
        {(() => {
          const firstDay = new Date(days[0]).getDay();
          return Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ));
        })()}

        {/* Day cells */}
        {days.map((dateStr) => {
          const mood = moodMap[dateStr];
          const dayNum = new Date(dateStr).getDate();
          const isToday = dateStr === new Date().toISOString().split("T")[0];

          return (
            <div
              key={dateStr}
              title={mood ? `${dateStr}: ${mood}` : dateStr}
              className={`h-9 w-full rounded-lg flex items-center justify-center text-xs font-medium border-2 transition-all ${
                mood
                  ? `${MOOD_COLOR[mood]} text-white border-transparent`
                  : "bg-muted text-muted-foreground border-transparent"
              } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              {mood ? (
                <span className="text-base leading-none">{MOOD_EMOJI[mood]}</span>
              ) : (
                <span>{dayNum}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MOODS.map((m) => {
          const count = days.filter((d) => moodMap[d] === m.value).length;
          return (
            <div key={m.value} className="rounded-xl bg-muted/50 p-3 text-center">
              <div className="text-xl">{m.emoji}</div>
              <div className="text-lg font-bold text-card-foreground">{count}</div>
              <div className="text-[10px] text-muted-foreground">{m.label} days</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
