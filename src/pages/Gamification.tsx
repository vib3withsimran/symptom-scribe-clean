// src/pages/Gamification.tsx
import { useChallenges, useUserChallenges, useUserBadges } from "@/hooks/useGamification";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { MoodLogger, MoodCalendarView } from "@/components/gamification/MoodCalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Smile, Award } from "lucide-react";

export default function GamificationPage() {
  const { data: challenges } = useChallenges();
  const { data: userChallenges } = useUserChallenges();
  const { data: userBadges } = useUserBadges();

  // Map challenge_id → userChallenge for quick lookup
  const userChallengeMap = new Map(
    userChallenges?.map((uc) => [uc.challenge_id, uc]) ?? []
  );

  const activeChallenges = userChallenges?.filter((uc) => !uc.completed) ?? [];

  return (
    <div className="h-full overflow-y-auto">
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Challenges & Rewards
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build healthy habits, earn badges, and track your mood
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 p-4 text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-600">{activeChallenges.length}</p>
          <p className="text-xs text-muted-foreground">Active Challenges</p>
        </div>
        <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/50 p-4 text-center">
          <Award className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-yellow-600">{userBadges?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Badges Earned</p>
        </div>
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200/50 p-4 text-center">
          <Smile className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600">
            {Math.max(...(activeChallenges.map((c) => c.current_streak) ?? [0]), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="challenges">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="challenges" className="flex items-center gap-1.5">
            <Flame className="w-4 h-4" /> Challenges
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-1.5">
            <Smile className="w-4 h-4" /> Mood Tracker
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-1.5">
            <Award className="w-4 h-4" /> My Badges
          </TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenges?.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userChallenge={userChallengeMap.get(challenge.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Mood Tracker Tab */}
        <TabsContent value="mood">
          <div className="space-y-6">
            <MoodLogger />
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-card-foreground mb-1">
                Mood Calendar — Last 30 Days
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                See how your mood has changed over the past month
              </p>
              <MoodCalendarView />
            </div>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-card-foreground mb-1">My Badges</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Achievements earned through your health journey
            </p>
            <BadgeDisplay />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
