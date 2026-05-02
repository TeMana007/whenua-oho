import { LESSONS } from "./lessons";
import type { Lesson, Level } from "./types";

export function getLessonsByLevel(level: Level): Lesson[] {
  return LESSONS.filter((l) => l.level === level).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
