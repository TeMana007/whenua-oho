import type { Lesson } from "./types";

export const LESSONS: Lesson[] = [
  {
    id: "greetings-01",
    title: "Greetings & Introductions",
    titleMaori: "Ngā Mihi",
    level: "beginner",
    topic: "greetings",
    order: 1,
    culturalNote:
      "Hongi (pressing noses) is a traditional Māori greeting that shares the breath of life. In conversation, 'Kia ora' is a warm, everyday greeting used across all situations.",
    vocabulary: [
      { maori: "Kia ora", english: "Hello / Thank you", pronunciation: "kee-ah or-ah" },
      { maori: "Mōrena", english: "Good morning", pronunciation: "maw-reh-nah" },
      { maori: "Āe", english: "Yes", pronunciation: "ah-eh" },
      { maori: "Kāo", english: "No", pronunciation: "kah-oh" },
      { maori: "Tēnā koe", english: "Greetings to you (one person)", pronunciation: "teh-nah koh-eh" },
    ],
    phrases: [
      { maori: "Ko wai tō ingoa?", english: "What is your name?", pronunciation: "koh why taw ing-oh-ah" },
      { maori: "Ko [name] tōku ingoa", english: "My name is [name]", pronunciation: "koh [name] taw-koo ing-oh-ah" },
      { maori: "Nō hea koe?", english: "Where are you from?", pronunciation: "naw heh-ah koh-eh" },
    ],
  },
  {
    id: "whanau-01",
    title: "Family",
    titleMaori: "Te Whānau",
    level: "beginner",
    topic: "family",
    order: 2,
    culturalNote:
      "Whānau extends beyond the nuclear family to include the wider community. This concept of collective belonging is central to Māori identity.",
    vocabulary: [
      { maori: "Whānau", english: "Family / Extended family", pronunciation: "fah-noh" },
      { maori: "Māmā", english: "Mother", pronunciation: "mah-mah" },
      { maori: "Pāpā", english: "Father", pronunciation: "pah-pah" },
      { maori: "Tuakana", english: "Older sibling (same gender)", pronunciation: "too-ah-kah-nah" },
      { maori: "Tēina", english: "Younger sibling (same gender)", pronunciation: "teh-ee-nah" },
    ],
    phrases: [
      { maori: "He aha tō whānau?", english: "What is your family like?", pronunciation: "heh ah-hah taw fah-noh" },
      { maori: "Tokohia ō tuākana?", english: "How many older siblings do you have?", pronunciation: "toh-koh-hee-ah aw too-ah-kah-nah" },
    ],
  },
];
