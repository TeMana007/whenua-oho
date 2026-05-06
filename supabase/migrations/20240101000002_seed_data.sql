-- ============================================================
-- Seed: Kākano sentence patterns + phrases + demo class
-- Aligned to Reo Ora (Dr. Rāpata Wiri) 75-pattern curriculum
-- ============================================================

-- ── Safety: ensure pattern_number exists on phrases ──────────
-- (idempotent — safe to run even when column already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'phrases' AND column_name = 'pattern_number'
  ) THEN
    ALTER TABLE public.phrases ADD COLUMN pattern_number integer DEFAULT 1;
  END IF;
END $$;


-- ── Demo class ───────────────────────────────────────────────
INSERT INTO public.classes (id, name, class_code, teacher_name)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Kākano Reo Māori',
    'KAKANO01',
    'Dr. Rāpata Wiri'
  )
ON CONFLICT (class_code) DO NOTHING;


-- ── Sentence patterns (Kākano / Beginner level) ──────────────

INSERT INTO public.sentence_patterns (id, pattern, english, level, order_num)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Ko ___ tōku ingoa',
    'My name is ___',
    'beginner',
    1
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.sentence_patterns (id, pattern, english, level, order_num)
VALUES
  (
    '10000000-0000-0000-0000-000000000002',
    'Nō ___ ahau',
    'I am from ___',
    'beginner',
    2
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.sentence_patterns (id, pattern, english, level, order_num)
VALUES
  (
    '10000000-0000-0000-0000-000000000003',
    'He ___ ahau',
    'I am a ___',
    'beginner',
    3
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.sentence_patterns (id, pattern, english, level, order_num)
VALUES
  (
    '10000000-0000-0000-0000-000000000004',
    'Kei ___ ahau e noho ana',
    'I live in ___',
    'beginner',
    4
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.sentence_patterns (id, pattern, english, level, order_num)
VALUES
  (
    '10000000-0000-0000-0000-000000000005',
    'Ko ___ tōku maunga',
    'My mountain is ___',
    'beginner',
    5
  )
ON CONFLICT DO NOTHING;


-- ── Phrases: Scenario 1 — Marae greetings ────────────────────
INSERT INTO public.phrases (id, maori, english, pronunciation, pattern_number)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Ko Aroha tōku ingoa',
    'My name is Aroha',
    'koh ah-roh-hah taw-koo ing-oh-ah',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Tēnā koutou katoa',
    'Greetings to you all',
    'teh-nah koh-toh kah-toh-ah',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Nau mai, haere mai',
    'Welcome, come here',
    'nah-oo my, hah-eh-reh my',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Kia ora koutou',
    'Hello everyone',
    'kee-ah or-ah koh-toh',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Ko wai tōu ingoa?',
    'What is your name?',
    'koh why taw ing-oh-ah',
    1
  )
ON CONFLICT DO NOTHING;


-- ── Phrases: Scenario 2 — Pepeha (mihimihi) ─────────────────
INSERT INTO public.phrases (id, maori, english, pronunciation, pattern_number)
VALUES
  (
    '20000000-0000-0000-0000-000000000010',
    'Ko Taranaki tōku maunga',
    'Taranaki is my mountain',
    'koh tah-rah-nah-kee taw-koo mah-oo-ngah',
    5
  ),
  (
    '20000000-0000-0000-0000-000000000011',
    'Ko Whanganui tōku awa',
    'Whanganui is my river',
    'koh fah-ngah-noo-ee taw-koo ah-wah',
    5
  ),
  (
    '20000000-0000-0000-0000-000000000012',
    'Ko Aotea tōku waka',
    'Aotea is my canoe',
    'koh ah-oh-teh-ah taw-koo wah-kah',
    5
  ),
  (
    '20000000-0000-0000-0000-000000000013',
    'Ko Ngāti Mutunga tōku iwi',
    'Ngāti Mutunga is my tribe',
    'koh ngah-tee moo-too-ngah taw-koo ee-wee',
    5
  ),
  (
    '20000000-0000-0000-0000-000000000014',
    'Ko Parininihi tōku hapū',
    'Parininihi is my hapū',
    'koh pah-ree-nee-nee-hee taw-koo hah-poo',
    5
  )
ON CONFLICT DO NOTHING;


-- ── Phrases: Scenario 3 — Whānau kōrero ─────────────────────
INSERT INTO public.phrases (id, maori, english, pronunciation, pattern_number)
VALUES
  (
    '20000000-0000-0000-0000-000000000020',
    'Nō Tāmaki Makaurau ahau',
    'I am from Auckland',
    'naw tah-mah-kee mah-kah-oo-rau ah-oo',
    2
  ),
  (
    '20000000-0000-0000-0000-000000000021',
    'He kaiako ahau',
    'I am a teacher',
    'heh ky-ah-koh ah-oo',
    3
  ),
  (
    '20000000-0000-0000-0000-000000000022',
    'He ākonga ahau',
    'I am a student',
    'heh ah-kong-ah ah-oo',
    3
  ),
  (
    '20000000-0000-0000-0000-000000000023',
    'Kei Ōtautahi ahau e noho ana',
    'I live in Christchurch',
    'kay oh-tah-oo-tah-hee ah-oo eh no-ho ah-nah',
    4
  ),
  (
    '20000000-0000-0000-0000-000000000024',
    'Kei te pēhea koe?',
    'How are you?',
    'kay teh peh-heh-ah koh-eh',
    1
  )
ON CONFLICT DO NOTHING;
