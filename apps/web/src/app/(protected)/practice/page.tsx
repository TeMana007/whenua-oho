import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LESSONS }      from "@korero/curriculum";
import LessonFlow       from "./LessonFlow";
import type { LessonData } from "./LessonFlow";

export const metadata = { title: "Practice — Kōrero Companion" };

export default async function PracticePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  /* ── Load learner profile ── */
  const { data: learner } = await supabase
    .from("learners")
    .select("id, level")
    .eq("user_id", user.id)
    .single();

  /* ── Try to find a due phrase from the DB ── */
  let phraseRow: { id: string; maori: string; english: string; pronunciation: string | null } | null = null;

  if (learner) {
    const { data: due } = await supabase
      .from("learner_progress")
      .select("phrase_id, phrases(id, maori, english, pronunciation)")
      .eq("learner_id", learner.id)
      .lte("next_review", new Date().toISOString())
      .order("next_review")
      .limit(1)
      .single();

    if (due && due.phrases) {
      // @ts-expect-error — Supabase joined type
      phraseRow = due.phrases;
    }
  }

  /* ── Fallback: use first curriculum phrase ── */
  const curriculumLesson  = LESSONS[0];
  const curriculumPhrase  = curriculumLesson.phrases[0];

  const lesson: LessonData = phraseRow
    ? {
        lessonId:    curriculumLesson.id,
        title:       curriculumLesson.title,
        titleMaori:  curriculumLesson.titleMaori,
        topic:       curriculumLesson.topic,
        culturalNote: curriculumLesson.culturalNote ?? "",
        phraseId:    phraseRow.id,
        phrase: {
          id:            phraseRow.id,
          maori:         phraseRow.maori,
          english:       phraseRow.english,
          pronunciation: phraseRow.pronunciation ?? "",
        },
        level:     learner?.level ?? "beginner",
        learnerId: learner?.id    ?? "",
      }
    : {
        lessonId:    curriculumLesson.id,
        title:       curriculumLesson.title,
        titleMaori:  curriculumLesson.titleMaori,
        topic:       curriculumLesson.topic,
        culturalNote: curriculumLesson.culturalNote ?? "",
        phrase: {
          maori:         curriculumPhrase.maori,
          english:       curriculumPhrase.english,
          pronunciation: curriculumPhrase.pronunciation ?? "",
        },
        level:     learner?.level ?? "beginner",
        learnerId: learner?.id    ?? "",
      };

  return <LessonFlow lesson={lesson} />;
}
