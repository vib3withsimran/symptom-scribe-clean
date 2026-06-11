import Dexie, { type Table } from "dexie";
import { supabase } from "@/integrations/supabase/client";
import { type Json } from "@/integrations/supabase/types";

export interface OfflineMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: Json;
  notes: string | null;
  recorded_at: string;
  pending_sync: number;
  pending_delete: number;
}

export interface OfflineSymptom {
  id: string;
  user_id: string;
  symptoms: string;
  severity_level: string;
  possible_causes: string[] | null;
  recommendations: string[] | null;
  risk_score: number | null;
  resolved: boolean;
  created_at: string;
  pending_sync: number;
  pending_update: number;
  pending_delete: number;
}

class OfflineDatabase extends Dexie {
  healthMetrics!: Table<OfflineMetric>;
  symptomHistory!: Table<OfflineSymptom>;

  constructor() {
    super("SymptomScribeOfflineDB");
    this.version(1).stores({
      healthMetrics: "id, user_id, metric_type, recorded_at, pending_sync, pending_delete",
      symptomHistory: "id, user_id, severity_level, created_at, pending_sync, pending_update, pending_delete",
    });
  }
}

export const db = new OfflineDatabase();

export const syncOfflineData = async (): Promise<boolean> => {
  if (!navigator.onLine) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    let syncedAny = false;

    // 1. Sync pending health metrics deletions
    const pendingMetricsDeletes = await db.healthMetrics
      .where("pending_delete")
      .equals(1)
      .toArray();

    for (const record of pendingMetricsDeletes) {
      const { error } = await supabase
        .from("health_metrics")
        .delete()
        .eq("id", record.id);

      if (!error || error.code === "PGRST116") {
        await db.healthMetrics.delete(record.id);
        syncedAny = true;
      }
    }

    // 2. Sync pending health metrics insertions
    const pendingMetricsInserts = await db.healthMetrics
      .where("pending_sync")
      .equals(1)
      .toArray();

    for (const record of pendingMetricsInserts) {
      const { pending_sync, pending_delete, ...supabaseData } = record;
      const { error } = await supabase
        .from("health_metrics")
        .insert(supabaseData);

      if (!error) {
        await db.healthMetrics.update(record.id, { pending_sync: 0 });
        syncedAny = true;
      }
    }

    // 3. Sync pending symptom history deletions
    const pendingSymptomDeletes = await db.symptomHistory
      .where("pending_delete")
      .equals(1)
      .toArray();

    for (const record of pendingSymptomDeletes) {
      const { error } = await supabase
        .from("symptom_history")
        .delete()
        .eq("id", record.id);

      if (!error || error.code === "PGRST116") {
        await db.symptomHistory.delete(record.id);
        syncedAny = true;
      }
    }

    // 4. Sync pending symptom history insertions
    const pendingSymptomInserts = await db.symptomHistory
      .where("pending_sync")
      .equals(1)
      .toArray();

    for (const record of pendingSymptomInserts) {
      const { pending_sync, pending_delete, pending_update, ...supabaseData } = record;
      const { error } = await supabase
        .from("symptom_history")
        .insert(supabaseData);

      if (!error) {
        await db.symptomHistory.update(record.id, { pending_sync: 0 });
        syncedAny = true;
      }
    }

    // 5. Sync pending symptom history updates (resolve/reopen)
    const pendingSymptomUpdates = await db.symptomHistory
      .where("pending_update")
      .equals(1)
      .toArray();

    for (const record of pendingSymptomUpdates) {
      const { error } = await supabase
        .from("symptom_history")
        .update({ resolved: record.resolved })
        .eq("id", record.id);

      if (!error) {
        await db.symptomHistory.update(record.id, { pending_update: 0 });
        syncedAny = true;
      }
    }

    return syncedAny;
  } catch (error) {
    console.error("Error during offline synchronization:", error);
    return false;
  }
};

// FIX #2: Removed the global window.addEventListener("online", syncOfflineData) that
// was here previously. It caused syncOfflineData to fire 3× on every reconnect because
// History.tsx and Metrics.tsx each add their own "online" listener too.
// The page-level components are the single source of truth for triggering sync.
