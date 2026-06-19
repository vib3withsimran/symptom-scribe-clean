// src/components/gamification/ChallengeCard.tsx
import { Challenge, UserChallenge, useJoinChallenge, useCheckInChallenge } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, CheckCircle2, Plus } from "lucide-react";

interface Props {
  challenge: Challenge;
  userChallenge?: UserChallenge;
}

const categoryColors: Record<string, string> = {
  hydration: "bg-blue-100 text-blue-700",
  mindfulness: "bg-purple-100 text-purple-700",
  fitness: "bg-green-100 text-green-700",
  sleep: "bg-indigo-100 text-indigo-700",
  nutrition: "bg-orange-100 text-orange-700",
};

export function ChallengeCard({ challenge, userChallenge }: Props) {
  const joinMutation = useJoinChallenge();
  const checkInMutation = useCheckInChallenge();

  const isJoined = !!userChallenge;
  const streak = userChallenge?.current_streak ?? 0;
  const progress = Math.min((streak / challenge.duration_days) * 100, 100);
  const isCompleted = userChallenge?.completed;

  // Check if already checked in today
  const lastCheckIn = userChallenge?.last_check_in;
  const checkedInToday =
    lastCheckIn &&
    new Date(lastCheckIn).toDateString() === new Date().toDateString();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{challenge.icon}</span>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm leading-tight">
              {challenge.title}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                categoryColors[challenge.category] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {challenge.category}
            </span>
          </div>
        </div>
        {isCompleted && (
          <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0" />
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Progress */}
      {isJoined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              Day {streak} / {challenge.duration_days}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Action */}
      {!isJoined ? (
        <Button
          size="sm"
          className="w-full"
          onClick={() => joinMutation.mutate(challenge.id)}
          disabled={joinMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-1" />
          Join Challenge
        </Button>
      ) : isCompleted ? (
        <Button size="sm" className="w-full" disabled variant="outline">
          ✅ Completed!
        </Button>
      ) : checkedInToday ? (
        <Button size="sm" className="w-full" disabled variant="outline">
          ✔ Checked in today
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={() => checkInMutation.mutate(userChallenge!.id)}
          disabled={checkInMutation.isPending}
        >
          <Flame className="w-4 h-4 mr-1" />
          Check In Today
        </Button>
      )}
    </div>
  );
}
