/**
 * purge-voice-data — Supabase Edge Function
 *
 * Deletes speaking_attempts rows older than 90 days.
 * Cultural rule (CLAUDE.md): "No learner voice data stored beyond 90 days without consent."
 *
 * Schedule via Supabase Dashboard → Edge Functions → Schedules:
 *   cron: "0 3 * * *"   (daily at 03:00 UTC)
 *
 * Or invoke manually:
 *   supabase functions invoke purge-voice-data --no-verify-jwt
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RETENTION_DAYS = 90;

Deno.serve(async (req: Request): Promise<Response> => {
  // Allow only POST (cron scheduler sends POST) or an authenticated GET for manual testing
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use the service-role key so RLS is bypassed — this function runs server-side only
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffISO = cutoff.toISOString();

  // ── Step 1: collect IDs of rows to delete (for logging / audit) ──────────
  const { data: toDelete, error: selectError } = await supabase
    .from("speaking_attempts")
    .select("id, learner_id, created_at")
    .lt("created_at", cutoffISO);

  if (selectError) {
    return new Response(
      JSON.stringify({ error: "Select failed", detail: selectError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const rowCount = toDelete?.length ?? 0;

  if (rowCount === 0) {
    return new Response(
      JSON.stringify({
        ok: true,
        deleted: 0,
        cutoff: cutoffISO,
        message: "No voice records older than 90 days found.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Step 2: delete the rows ───────────────────────────────────────────────
  const { error: deleteError } = await supabase
    .from("speaking_attempts")
    .delete()
    .lt("created_at", cutoffISO);

  if (deleteError) {
    return new Response(
      JSON.stringify({ error: "Delete failed", detail: deleteError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Step 3: (optional) purge associated audio from Storage ───────────────
  // speaking_attempts rows don't currently store an audio_url, but
  // challenge_completions do. Purge those too if older than 90 days.
  const { data: oldCompletions } = await supabase
    .from("challenge_completions")
    .select("id, audio_url, completed_at")
    .lt("completed_at", cutoffISO)
    .not("audio_url", "is", null);

  let audiosPurged = 0;
  if (oldCompletions && oldCompletions.length > 0) {
    const storagePaths = oldCompletions
      .map((r) => {
        // audio_url is typically: https://<project>.supabase.co/storage/v1/object/public/audio/<path>
        const url = r.audio_url as string | null;
        if (!url) return null;
        const marker = "/object/public/audio/";
        const idx = url.indexOf(marker);
        return idx >= 0 ? url.slice(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("audio")
        .remove(storagePaths);

      if (!storageError) {
        audiosPurged = storagePaths.length;
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      deleted: rowCount,
      audiosPurged,
      cutoff: cutoffISO,
      retentionDays: RETENTION_DAYS,
      message: `Deleted ${rowCount} speaking_attempts older than ${RETENTION_DAYS} days.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
