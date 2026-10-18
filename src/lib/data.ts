import { supabase } from './supabaseClient';
import type { CommissionMember, CommissionGroup, EventInfo, Minicurso, Partner, Session, SessionLink, SessionLinkType, SessionWithSpeakers, Speaker } from './types';

const VALID_LINK_TYPES: SessionLinkType[] = [
  'linkedin', 'site', 'instagram', 'github', 'facebook', 'twitter', 'youtube',
];

function parseLinks(raw: unknown): SessionLink[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { type, label, url } = item as Record<string, unknown>;
    const cleanUrl = typeof url === 'string' ? url.trim() : '';

    if (!VALID_LINK_TYPES.includes(type as SessionLinkType)) return [];
    if (!/^https?:\/\//i.test(cleanUrl)) return [];

    return [{
      type: type as SessionLinkType,
      label: typeof label === 'string' ? label.trim() : '',
      url: cleanUrl,
    }];
  });
}

// Formata uma URL individual do Supabase Storage
function formatSingleImageUrl(path: string | null | undefined): string {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${cleanPath}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/setec-bucket/${cleanPath}`;
}

// Formata URLs do Supabase Storage (suporta string individual, array de strings, null ou undefined)
function formatImageUrl(path: string | string[] | null | undefined): string[] {
  if (!path) return [];

  if (Array.isArray(path)) {
    return path.map((p) => formatSingleImageUrl(p)).filter(Boolean);
  }

  const formatted = formatSingleImageUrl(path);
  return formatted ? [formatted] : [];
}

// Palestrantes de uma palestra: usa a coluna "palestrantes" (jsonb) e, se ela
// estiver vazia ou ausente, monta 1 palestrante a partir das colunas antigas.
function parseSpeakers(p: Record<string, any>): Speaker[] {
  const raw = Array.isArray(p.palestrantes) ? p.palestrantes : [];
  const fromJson = raw.flatMap((item: unknown, i: number) => {
    if (!item || typeof item !== 'object') return [];
    const { nome, cargo, foto_url, sobre } = item as Record<string, unknown>;
    const name = typeof nome === 'string' ? nome.trim() : '';
    if (!name) return [];
    return [{
      id: `sp-${p.id}-${i}`,
      name,
      role: typeof cargo === 'string' ? cargo.trim() : '',
      company: '',
      photoUrl: formatImageUrl(typeof foto_url === 'string' ? foto_url : null),
      bio: typeof sobre === 'string' ? sobre.trim() : '',
    }];
  });
  if (fromJson.length > 0) return fromJson;

  const name = p.nome_completo || p.palestrante || '';
  if (!name) return [];
  return [{
    id: `sp-${p.id}-0`,
    name,
    role: p.cargo || '',
    company: p.empresa || p.instituicao || '',
    photoUrl: formatImageUrl(p.foto_url),
    bio: p.sobre_palestrante || p.sobre || '',
  }];
}

// Remove os segundos da hora ("13:00:00" -> "13:00")
function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr;
}

// Converte datas no formato "YYYY-MM-DD" em rótulos amigáveis ("Segunda-feira, 5 de outubro")
function formatDateLabel(rawDate: string | null | undefined): { dayId: string; dayLabel: string; date: string } {
  if (!rawDate) {
    return { dayId: 'dia-1', dayLabel: 'Programação', date: '' };
  }

  try {
    const parts = rawDate.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const dateObj = new Date(Date.UTC(year, month, day));

      const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(dateObj);
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(dateObj);

      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

      // Em pt-BR o mês fica em minúsculas: "Segunda-feira, 5 de outubro"
      const dayLabel = `${capitalizedDay}, ${day} de ${monthName.toLowerCase()}`;
      const dayId = `dia-${day}`;

      return { dayId, dayLabel, date: rawDate };
    }
  } catch (e) {
    console.error('Erro ao formatar data:', e);
  }

  return { dayId: 'dia-1', dayLabel: rawDate, date: rawDate };
}

/** "Edição XXXIII" -> "XXXIII" (para montar "SETEC XXXIII"). */
function shortEdition(label: string): string {
  return label.replace(/^\s*edi[cç][aã]o\s*/i, '').trim();
}

async function loadEventInfo(): Promise<EventInfo> {
  let eventoAtivo = true;
  let logoUrl = '';
  // Sem link configurado no painel, os botões de Sympla/Instagram ficam ocultos
  let symplaUrl = '';
  let instagramUrl = '';
  let edicao = '';
  let datas = '';
  let ano = new Date().getFullYear().toString();

  if (supabase) {
    let { data } = await supabase
      .from('event_config')
      .select('*', { head: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      const res = await supabase.from('configuracoes').select('*').limit(1).maybeSingle();
      data = res.data;
    }

    if (data) {
      if (typeof data.evento_ativo === 'boolean') eventoAtivo = data.evento_ativo;
      if (data.logo_url) logoUrl = formatSingleImageUrl(data.logo_url);
      if (typeof data.sympla_url === 'string' && /^https?:\/\//i.test(data.sympla_url.trim())) symplaUrl = data.sympla_url.trim();
      if (typeof data.instagram_url === 'string' && /^https?:\/\//i.test(data.instagram_url.trim())) instagramUrl = data.instagram_url.trim();
      if (data.edicao) edicao = String(data.edicao).trim();
      if (data.datas) datas = String(data.datas).trim();
      if (data.ano) ano = String(data.ano);
    }
  }

  const editionShort = shortEdition(edicao);

  return {
    editionLabel: edicao,
    editionShort,
    siteName: editionShort ? `SETEC ${editionShort}` : 'SETEC',
    institution: 'FATEC Sorocaba',
    dateRangeLabel: datas,
    dateRangeDescription: 'Dias de imersão tecnológica intensa e networking.',
    eventoAtivo,
    logoUrl,
    symplaUrl,
    instagramUrl,
    ano,
  };
}

// Cache curto: a mesma requisição chama getEventInfo() em vários componentes
// (página, Layout, Logo, Footer...). Alguns segundos bastam para não repetir a
// consulta sem atrasar a publicação de mudanças feitas no painel.
const EVENT_INFO_TTL_MS = 5_000;
let eventInfoCache: { at: number; promise: Promise<EventInfo> } | null = null;

export function getEventInfo(): Promise<EventInfo> {
  const now = Date.now();
  if (!eventInfoCache || now - eventInfoCache.at > EVENT_INFO_TTL_MS) {
    const promise = loadEventInfo().catch((err) => {
      eventInfoCache = null;
      throw err;
    });
    eventInfoCache = { at: now, promise };
  }
  return eventInfoCache.promise;
}

export async function getPartners(): Promise<Partner[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('patrocinadores')
    .select('id, nome_empresa, logo_url, nivel')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const levelPriority: Record<string, number> = {
    master: 1,
    diamond: 2,
    titanium: 3,
    platinum: 4,
    gold: 5,
  };

  const sortedData = [...data].sort((a, b) => {
    const priorityA = levelPriority[a.nivel?.toLowerCase()?.trim()] ?? 99;
    const priorityB = levelPriority[b.nivel?.toLowerCase()?.trim()] ?? 99;
    return priorityA - priorityB;
  });

   return sortedData.map((p) => ({
    id: String(p.id),
    name: p.nome_empresa || '',
    logoUrl: formatSingleImageUrl(p.logo_url),
    tier: p.nivel ? String(p.nivel).trim().toUpperCase() : undefined,
  })) as Partner[];
}

const COMMISSION_GROUPS: CommissionGroup[] = ['professor', '5ano', '4ano', 'manha', 'noite'];

export async function getCommission(): Promise<CommissionMember[]> {
  if (!supabase) return [];

 const { data, error } = await supabase
    .from('comissao_publica')
    .select('*')
    .order('nome', { ascending: true });

  if (error || !data) return [];

  return data
    .filter((m) => COMMISSION_GROUPS.includes(m.grupo))
    .map((m) => ({
      id: String(m.id),
      name: m.nome || '',
      email: m.email || undefined,
      group: m.grupo as CommissionGroup,
      semester: typeof m.semestre === 'number' ? m.semestre : undefined,
    }));
}

function mapSession(s: Record<string, any>): SessionWithSpeakers {
  const { dayId, dayLabel, date } = formatDateLabel(s.data);
  const speakers = parseSpeakers(s);

  return {
    id: String(s.id),
    slug: s.slug || String(s.id),
    title: s.titulo || '',
    category: s.categoria || 'PALESTRA',
    date,
    dayId: s.day_id || dayId,
    dayLabel: s.day_label || dayLabel,
    timeStart: formatTime(s.hora_inicio),
    timeEnd: formatTime(s.hora_fim),
    location: s.local || '',
    description: s.sobre_palestra || s.descricao || '',
    speakerIds: speakers.map((sp) => sp.id),
    links: parseLinks(s.links),
    speakers,
  };
}

/** Palestras publicadas já com os palestrantes, em uma única consulta. */
export async function getSessionsWithSpeakers(): Promise<SessionWithSpeakers[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('palestras').select('*').eq('rascunho', false);
  if (error || !data) return [];

  return data.map(mapSession);
}

export async function getSpeakers(): Promise<Speaker[]> {
  const sessions = await getSessionsWithSpeakers();
  return sessions.flatMap((s) => s.speakers);
}

export async function getSessions(): Promise<Session[]> {
  return getSessionsWithSpeakers();
}

/** Chave para ordenar por data e hora; itens sem data/hora vão para o fim. */
export function scheduleKey(item: { date: string; timeStart: string }): string {
  return `${item.date || '9999-99-99'}T${item.timeStart || '99:99'}`;
}

/** Palestras que ainda não terminaram (fuso de São Paulo), em ordem de data e hora. */
export async function getFeaturedSessions<T extends Session = SessionWithSpeakers>(
  preloaded?: T[],
  limit = 3,
): Promise<T[]> {
  const allSessions = (preloaded ?? (await getSessionsWithSpeakers())) as T[];
  const now = Date.now();

  const upcomingSessions = allSessions.filter((s) => {
    if (!s.date || !s.timeEnd) return true;
    const end = new Date(`${s.date}T${s.timeEnd.length === 5 ? `${s.timeEnd}:00` : s.timeEnd}-03:00`).getTime();
    return Number.isNaN(end) || end > now;
  });

  upcomingSessions.sort((a, b) => scheduleKey(a).localeCompare(scheduleKey(b)));

  return upcomingSessions.slice(0, limit);
}

export async function getSessionsGroupedByDay<T extends Session = SessionWithSpeakers>(
  preloaded?: T[],
): Promise<{ dayId: string; dayLabel: string; date: string; sessions: T[] }[]> {
  const allSessions = (preloaded ?? (await getSessionsWithSpeakers())) as T[];
  const map = new Map<string, { dayId: string; dayLabel: string; date: string; sessions: T[] }>();

  for (const session of allSessions) {
    if (!map.has(session.dayId)) {
      map.set(session.dayId, {
        dayId: session.dayId,
        dayLabel: session.dayLabel,
        date: session.date || '',
        sessions: [],
      });
    }
    map.get(session.dayId)!.sessions.push(session);
  }
  const days = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Ordena as sessões de cada dia pelo horário de início (depois pelo de término)
  for (const day of days) {
    day.sessions.sort(
      (a, b) =>
        a.timeStart.localeCompare(b.timeStart) || a.timeEnd.localeCompare(b.timeEnd)
    );
  }

  return days;
}

// ---------- Minicursos ----------

/** Minicursos publicados, com vagas/inscritos (função minicursos_vagas) e ordenados por data e hora. */
export async function getMinicursos(): Promise<Minicurso[]> {
  if (!supabase) return [];

  const [{ data, error }, vagas] = await Promise.all([
    supabase.from('minicursos').select('*').eq('rascunho', false),
    supabase.rpc('minicursos_vagas'),
  ]);
  if (error || !data) return [];

  const ocupacao = new Map<string, number>();
  for (const v of (vagas.data ?? []) as { minicurso_id: string; inscritos: number }[]) {
    ocupacao.set(String(v.minicurso_id), Number(v.inscritos) || 0);
  }

  // "Agora" no fuso de São Paulo, no formato "YYYY-MM-DDTHH:MM" para comparar com data + hora
  const agora = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date())
    .replace(' ', 'T');

  return data
    .map((m) => {
      const { dayId, dayLabel, date } = formatDateLabel(m.data);
      const timeStart = formatTime(m.hora_inicio);
      return {
        id: String(m.id),
        title: m.titulo || '',
        category: m.categoria || 'MINICURSO',
        date,
        dayId,
        dayLabel,
        timeStart,
        timeEnd: formatTime(m.hora_fim),
        location: m.local || '',
        description: m.sobre || '',
        links: parseLinks(m.links),
        speakers: parseSpeakers({ id: `mc-${m.id}`, palestrantes: m.ministrantes }),
        vagas: Number(m.vagas) || 0,
        // Inscrições manuais podem passar do limite; no site nunca mostra mais que as vagas
        inscritos: Math.min(ocupacao.get(String(m.id)) ?? 0, Number(m.vagas) || 0),
        encerrado: !!date && `${date}T${timeStart || '00:00'}` <= agora,
      };
    })
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.timeStart.localeCompare(b.timeStart));
}

/** Turmas para o formulário de inscrição (mesma lista da presença), em ordem natural. */
export async function getTurmas(): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('presenca_turmas').select('nome');
  return (data ?? [])
    .map((t) => String(t.nome))
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}
