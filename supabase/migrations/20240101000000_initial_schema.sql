-- ============================================================
-- Kōrero Companion — Initial Schema
-- Aligned to actual app column names and seed data
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- classes
-- ============================================================
create table if not exists classes (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  class_code   text        not null unique,
  teacher_name text,
  created_at   timestamptz not null default now()
);

comment on table classes is 'Kaiako (teacher) class groups identified by a short join code';

-- ============================================================
-- learners
-- ============================================================
create table if not exists learners (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null unique references auth.users (id) on delete cascade,
  name       text        not null default '',
  level      text        not null default 'beginner'
               check (level in ('beginner', 'intermediate', 'advanced')),
  class_id   uuid        references classes (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table learners is 'Ākonga (learner) accounts linked to Supabase auth';
create index if not exists learners_user_id_idx  on learners (user_id);
create index if not exists learners_class_id_idx on learners (class_id);

-- ============================================================
-- sentence_patterns
-- ============================================================
create table if not exists sentence_patterns (
  id         uuid        primary key default gen_random_uuid(),
  pattern    text        not null,
  english    text        not null,
  level      text        not null default 'beginner',
  order_num  integer     not null default 1,
  created_at timestamptz not null default now()
);

comment on table sentence_patterns is 'Reusable te reo sentence frames (Reo Ora curriculum)';
create index if not exists sentence_patterns_level_idx on sentence_patterns (level, order_num);

-- ============================================================
-- phrases
-- ============================================================
create table if not exists phrases (
  id             uuid        primary key default gen_random_uuid(),
  maori          text        not null,
  english        text        not null,
  pronunciation  text,
  pattern_number integer,
  created_at     timestamptz default now()
);

comment on table phrases is 'Individual practice phrases';
create index if not exists phrases_pattern_idx on phrases (pattern_number);

-- ============================================================
-- learner_progress  (one row per learner × phrase — upserted)
-- ============================================================
create table if not exists learner_progress (
  id               uuid        primary key default gen_random_uuid(),
  learner_id       uuid        not null references learners (id) on delete cascade,
  phrase_id        uuid        not null references phrases (id) on delete cascade,
  confidence_score numeric(4,2) not null default 0.00
                     check (confidence_score between 0.00 and 1.00),
  last_reviewed    timestamptz,
  next_review      timestamptz,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now(),
  unique (learner_id, phrase_id)
);

comment on table learner_progress is 'Spaced-repetition state: one row per ākonga per phrase';
create index if not exists learner_progress_learner_idx     on learner_progress (learner_id);
create index if not exists learner_progress_next_review_idx on learner_progress (learner_id, next_review);

-- ============================================================
-- speaking_attempts
-- ============================================================
create table if not exists speaking_attempts (
  id                 uuid        primary key default gen_random_uuid(),
  learner_id         uuid        not null references learners (id) on delete cascade,
  phrase_id          uuid        not null references phrases (id) on delete cascade,
  confidence_score   numeric(4,2) not null check (confidence_score between 0.00 and 1.00),
  whisper_transcript text,
  ai_feedback        text,
  duration_seconds   numeric(6,2),
  created_at         timestamptz not null default now()
);

create index if not exists speaking_attempts_learner_idx on speaking_attempts (learner_id, created_at desc);

-- ============================================================
-- challenges
-- ============================================================
create table if not exists challenges (
  id          uuid        primary key default gen_random_uuid(),
  class_id    uuid        not null references classes (id) on delete cascade,
  phrase      text        not null,
  description text,
  due_date    date,
  created_at  timestamptz default now()
);

create index if not exists challenges_class_idx on challenges (class_id);

-- ============================================================
-- challenge_completions
-- ============================================================
create table if not exists challenge_completions (
  id           uuid        primary key default gen_random_uuid(),
  challenge_id uuid        not null references challenges (id) on delete cascade,
  learner_id   uuid        not null references learners (id) on delete cascade,
  audio_url    text,
  completed_at timestamptz not null default now(),
  unique (challenge_id, learner_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table learners             enable row level security;
alter table classes              enable row level security;
alter table sentence_patterns    enable row level security;
alter table phrases              enable row level security;
alter table learner_progress     enable row level security;
alter table speaking_attempts    enable row level security;
alter table challenges           enable row level security;
alter table challenge_completions enable row level security;

-- sentence_patterns and phrases are public read
create policy "sentence_patterns: public read"
  on sentence_patterns for select using (true);

create policy "phrases: public read"
  on phrases for select using (true);

-- classes readable by anyone with the code (unauthenticated kaiako login)
create policy "classes: public read"
  on classes for select using (true);

-- challenges readable by class members
create policy "challenges: class read"
  on challenges for select using (true);

-- Learners can read/write their own rows
create policy "learners: read own"
  on learners for select using (auth.uid() = user_id);

create policy "learners: insert own"
  on learners for insert with check (auth.uid() = user_id);

create policy "learners: update own"
  on learners for update using (auth.uid() = user_id);

-- learner_progress: own rows
create policy "learner_progress: own rows"
  on learner_progress for all using (
    learner_id in (select id from learners where user_id = auth.uid())
  );

-- speaking_attempts: own rows
create policy "speaking_attempts: own rows"
  on speaking_attempts for all using (
    learner_id in (select id from learners where user_id = auth.uid())
  );

-- challenge_completions: own rows
create policy "challenge_completions: own rows"
  on challenge_completions for all using (
    learner_id in (select id from learners where user_id = auth.uid())
  );
