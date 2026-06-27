// src/hooks/useGamification.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

// ─── Lightweight current-user helper (no custom useAuth hook needed) ─────────
// Mirrors the pattern already used in Auth.tsx (supabase.auth.* calls directly)

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type MoodType = "great" | "good" | "neutral" | "bad" | "terrible";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
  icon: string;
}

export interface UserChallenge {
  id: string;
  challenge_id: string;
  started_at: string;
  current_streak: number;
  completed: boolean;
  last_check_in: string | null;
  challenges: Challenge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badges: Badge;
}

export interface MoodLog {
  id: string;
  mood: MoodType;
  note: string | null;
  logged_at: string;
}

// ─── Challenges ──────────────────────────────────────────────────────────────

export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Challenge[];
    },
  });
}

export function useUserChallenges() {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: ["user_challenges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_challenges")
        .select("*, challenges(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as UserChallenge[];
    },
  });
}

export function useJoinChallenge() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase.from("user_challenges").insert({
        user_id: user!.id,
        challenge_id: challengeId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_challenges"] });
      toast.success("Challenge joined! 🎯 Good luck!");
    },
    onError: () => toast.error("Could not join challenge. Try again."),
  });
}

export function useCheckInChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userChallengeId: string) => {
      // Get current record
      const { data: current, error: fetchErr } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("id", userChallengeId)
        .single();
      if (fetchErr) throw fetchErr;

      const now = new Date();
      const lastCheckIn = current.last_check_in
        ? new Date(current.last_check_in)
        : null;
      const isConsecutive =
        lastCheckIn &&
        now.getTime() - lastCheckIn.getTime() < 48 * 60 * 60 * 1000;

      const newStreak = isConsecutive ? current.current_streak + 1 : 1;

      const { error } = await supabase
        .from("user_challenges")
        .update({
          current_streak: newStreak,
          last_check_in: now.toISOString(),
        })
        .eq("id", userChallengeId);
      if (error) throw error;
      return newStreak;
    },
    onSuccess: (streak) => {
      qc.invalidateQueries({ queryKey: ["user_challenges"] });
      toast.success(`Day ${streak} checked in! 🔥 Keep it up!`);
    },
  });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export function useUserBadges() {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: ["user_badges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", user!.id)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
  });
}

// ─── Mood ─────────────────────────────────────────────────────────────────────

export function useMoodLogs() {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: ["mood_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user!.id)
        .gte("logged_at", thirtyDaysAgo.toISOString().split("T")[0])
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data as MoodLog[];
    },
  });
}

export function useLogMood() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mood, note }: { mood: MoodType; note?: string }) => {
      const { error } = await supabase.from("mood_logs").upsert(
        {
          user_id: user!.id,
          mood,
          note: note ?? null,
          logged_at: new Date().toISOString().split("T")[0],
        },
        { onConflict: "user_id,logged_at" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mood_logs"] });
      toast.success("Mood logged! 😊");
    },
    onError: () => toast.error("Could not log mood. Try again."),
  });
}