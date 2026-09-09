import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase centralizado.
 *
 * Em produção, defina as variáveis de ambiente:
 *   PUBLIC_SUPABASE_URL=...
 *   PUBLIC_SUPABASE_ANON_KEY=...
 *
 * Enquanto elas não existirem, `data.ts` continua servindo os mocks
 * em memória — nenhuma página depende diretamente deste arquivo.
 */

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * DDL sugerido para o schema Postgres (Supabase):
 *
 * create table speakers (
 *   id text primary key,
 *   name text not null,
 *   role text not null,
 *   company text not null,
 *   photo_url text,
 *   bio text
 * );
 *
 * create table sessions (
 *   id text primary key,
 *   slug text unique not null,
 *   title text not null,
 *   category text not null,
 *   track text,
 *   date date not null,
 *   day_label text not null,
 *   time_start text not null,
 *   time_end text not null,
 *   location text,
 *   description text,
 *   highlight_number text,
 *   edition_tag text
 * );
 *
 * create table session_speakers (
 *   session_id text references sessions(id),
 *   speaker_id text references speakers(id),
 *   primary key (session_id, speaker_id)
 * );
 *
 * create table partners (
 *   id text primary key,
 *   name text not null
 * );
 */
