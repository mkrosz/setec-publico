// Tipos centrais do domínio do evento.
// Desenhados para mapear 1:1 com as futuras tabelas do Supabase/Postgres
// (speakers, sessions, partners) — ver README para o DDL sugerido.

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  photoUrl: string | string[];
  bio: string;
}


export type SessionLinkType =
  | 'linkedin'
  | 'site'
  | 'instagram'
  | 'github'
  | 'facebook'
  | 'twitter'
  | 'youtube';

export interface SessionLink {
  type: SessionLinkType;
  label: string;
  url: string;
}

export type SessionCategory =
  | 'KEYNOTE'
  | 'WORKSHOP'
  | 'PAINEL'
  | 'MASTERCLASS'
  | 'PALESTRA';

export interface Session {
  id: string;
  slug: string;
  title: string;
  category: SessionCategory;
  track: string; // ex: "Inteligência Artificial"
  date: string; // ISO yyyy-mm-dd
  dayId: string; // ex: "seg-15" — chave estável usada pelos filtros de data
  dayLabel: string; // ex: "Segunda-feira, 15 de Maio"
  timeStart: string; // ex: "09:00 AM"
  timeEnd: string; // ex: "10:30 AM"
  location: string;
  description: string;
  highlightNumber?: string; // ex: "#01" para a home
  speakerIds: string[];
  editionTag: string; // ex: "SETEC XXXIII"
  links?: SessionLink[];
}

export type PartnerTier = 'MASTER' | 'DIAMOND' | 'TITANIUM' | 'PLATINUM' | 'GOLD';

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  tier?: PartnerTier;
}

export interface EventInfo {
  editionLabel: string;
  institution: string;
  dateRangeLabel: string;
  dateRangeDescription: string;
  socialHandle: string;
}
