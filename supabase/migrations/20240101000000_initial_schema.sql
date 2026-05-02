-- ============================================================
-- Kōrero Companion — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- classes
-- Must be created before learners (class_code FK)
-- ============================================================
create table classes (
  id              uuid primary key default gen_random_uuid(),
  class_code      text not null unique,
  kaiako_name     text not null,
  kaiako_email    text not null,
  week_number     integer not null default 1,
  current_theme   text,
  created_at      timestamptz not null default now()
);

comment on table classes is 'Kaiako (teacher) class groups identified by a short join code';

-- ============================================================
-- learners
-- ============================================================
create table learners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  level       text not null default 'beginner'
                check (level in ('beginner', 'intermediate', 'advanced')),
  class_code  text references classes (class_code) on update cascade on delete set null,
  created_at  timestamptz not null default now()
);

comment on table learners is 'Ākonga (learner) accounts';
create index learners_class_code_idx on learners (class_code);

-- ============================================================
-- sentence_patterns
-- ============================================================
create table sentence_patterns (
  id               uuid primary key default gen_random_uuid(),
  pattern_number   integer not null,
  level            text not null default 'beginner'
                     check (level in ('beginner', 'intermediate', 'advanced')),
  pattern_te_reo   text not null,
  pattern_english  text not null,
  example_te_reo   text not null,
  example_english  text not null,
  audio_url        text,
  week_number      integer not null default 1,
  created_at       timestamptz not null default now(),
  unique (pattern_number, level)
);

comment on table sentence_patterns is 'Reusable te reo sentence frames with worked examples';
create index sentence_patterns_level_week_idx on sentence_patterns (level, week_number);

-- ============================================================
-- phrases
-- ============================================================
create table phrases (
  id          uuid primary key default gen_random_uuid(),
  pattern_id  uuid not null references sentence_patterns (id) on delete cascade,
  te_reo      text not null,
  english     text not null,
  scenario    text,
  audio_url   text,
  difficulty  integer not null default 1 check (difficulty between 1 and 5),
  created_at  timestamptz not null default now()
);

comment on table phrases is 'Individual practice phrases that instantiate a sentence pattern';
create index phrases_pattern_idx on phrases (pattern_id);

-- ============================================================
-- learner_progress  (one row per learner × phrase — upserted)
-- ============================================================
create table learner_progress (
  id                   uuid primary key default gen_random_uuid(),
  learner_id           uuid not null references learners (id) on delete cascade,
  phrase_id            uuid not null references phrases (id) on delete cascade,
  confidence_score     numeric(4,2) not null default 0.00
                         check (confidence_score between 0.00 and 1.00),
  attempts             integer not null default 0,
  last_reviewed        timestamptz,
  next_review          timestamptz,
  pronunciation_notes  text,
  updated_at           timestamptz not null default now(),
  unique (learner_id, phrase_id)
);

comment on table learner_progress is 'Spaced-repetition state: one row per ākonga per phrase';
create index learner_progress_learner_idx on learner_progress (learner_id);
create index learner_progress_next_review_idx on learner_progress (learner_id, next_review);

-- ============================================================
-- speaking_attempts
-- ============================================================
create table speaking_attempts (
  id                uuid primary key default gen_random_uuid(),
  learner_id        uuid not null references learners (id) on delete cascade,
  phrase_id         uuid not null references phrases (id) on delete cascade,
  confidence_score  numeric(4,2) not null
                      check (confidence_score between 0.00 and 1.00),
  whisper_transcript text,
  ai_feedback        text,
  duration_seconds   numeric(6,2),
  created_at         timestamptz not null default now()
);

comment on table speaking_attempts is 'Audio attempt log: Whisper transcript + Claude feedback per try';
create index speaking_attempts_learner_idx on speaking_attempts (learner_id, created_at desc);
create index speaking_attempts_phrase_idx  on speaking_attempts (phrase_id);

-- ============================================================
-- challenges
-- ============================================================
create table challenges (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes (id) on delete cascade,
  title       text not null,
  description text,
  due_date    timestamptz,
  pattern_id  uuid references sentence_patterns (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table challenges is 'Weekly kaiako-set speaking challenges for a class';
create index challenges_class_idx on challenges (class_id, due_date);

-- ============================================================
-- challenge_completions
-- ============================================================
create table challenge_completions (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references challenges (id) on delete cascade,
  learner_id    uuid not null references learners (id) on delete cascade,
  audio_url     text,
  completed_at  timestamptz not null default now(),
  unique (challenge_id, learner_id)
);

comment on table challenge_completions is 'Records which ākonga completed each challenge';
create index challenge_completions_challenge_idx on challenge_completions (challenge_id);
create index challenge_completions_learner_idx   on challenge_completions (learner_id);

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

-- Learners can read/write their own rows
create policy "learners: read own"
  on learners for select using (auth.uid() = id);

create policy "learners: insert own"
  on learners for insert with check (auth.uid() = id);

create policy "learners: update own"
  on learners for update using (auth.uid() = id);

create policy "learner_progress: own rows"
  on learner_progress for all using (auth.uid() = learner_id);

create policy "speaking_attempts: own rows"
  on speaking_attempts for all using (auth.uid() = learner_id);

create policy "challenge_completions: own rows"
  on challenge_completions for all using (auth.uid() = learner_id);

-- Classes: readable by members
create policy "classes: readable by members"
  on classes for select
  using (
    class_code in (
      select class_code from learners where id = auth.uid()
    )
  );

-- Challenges: readable by class members
create policy "challenges: readable by class members"
  on challenges for select
  using (
    class_id in (
      select c.id from classes c
      join learners l on l.class_code = c.class_code
      where l.id = auth.uid()
    )
  );
