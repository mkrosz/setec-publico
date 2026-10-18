// Tipos centrais do domínio do evento (palestras, minicursos, apoiadores e comissão),
// montados a partir das tabelas do Supabase em src/lib/data.ts.

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

export interface Session {
  id: string;
  slug: string;
  title: string;
  category: string; // definida no painel (ex.: "PALESTRA", "IA")
  date: string; // ISO yyyy-mm-dd
  dayId: string; // ex: "dia-5" — chave estável usada pelos filtros de data
  dayLabel: string; // ex: "Segunda-feira, 5 de outubro"
  timeStart: string; // "HH:MM"
  timeEnd: string; // "HH:MM"
  location: string;
  description: string;
  speakerIds: string[];
  links?: SessionLink[];
}

export interface SessionWithSpeakers extends Session {
  speakers: Speaker[];
}

export type PartnerTier = 'MASTER' | 'DIAMOND' | 'TITANIUM' | 'PLATINUM' | 'GOLD';

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  tier?: PartnerTier;
}

export interface EventInfo {
  /** Como veio do painel, ex.: "Edição XXXIII" (pode ser vazio). */
  editionLabel: string;
  /** Só o número da edição, ex.: "XXXIII". */
  editionShort: string;
  /** Nome curto para títulos, ex.: "SETEC XXXIII". */
  siteName: string;
  institution: string;
  dateRangeLabel: string;
  dateRangeDescription: string;
  eventoAtivo: boolean;
  logoUrl: string;
  /** Vazio quando não configurado no painel (botão fica oculto). */
  symplaUrl: string;
  /** Vazio quando não configurado no painel (link fica oculto). */
  instagramUrl: string;
  ano: string;
}

export type CommissionGroup = 'professor' | '4ano' | '5ano' | 'manha' | 'noite';

export interface CommissionMember {
  id: string;
  name: string;
  email?: string;
  group: CommissionGroup;
  /** Só nos cursos semestrais (manhã e noite). */
  semester?: number;
}
export interface Minicurso {
  id: string;
  title: string;
  category: string;
  date: string; // ISO yyyy-mm-dd
  dayId: string;
  dayLabel: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  description: string;
  links: SessionLink[];
  speakers: Speaker[];
  vagas: number;
  inscritos: number;
  /** true quando o minicurso já começou (inscrições fechadas). */
  encerrado: boolean;
}
