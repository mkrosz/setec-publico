import { supabase } from './supabaseClient';
import type { EventInfo, Partner, Session, Speaker } from './types';

const eventInfo: EventInfo = {
  editionLabel: 'Edição XXXIII',
  institution: 'FATEC Sorocaba',
  dateRangeLabel: '15 a 19 de Maio',
  dateRangeDescription: 'Cinco dias de imersão tecnológica intensa e networking.',
  socialHandle: '@SETEC.OFICIAL',
};

// Formata URLs do Supabase Storage
function formatImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${cleanPath}`;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/setec-bucket/${cleanPath}`;
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

// Converte datas no formato "YYYY-MM-DD" em rótulos amigáveis ("Segunda-feira, 15 de Maio")
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
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      const dayLabel = `${capitalizedDay}, ${day} de ${capitalizedMonth}`;
      const dayId = `dia-${day}`;

      return { dayId, dayLabel, date: rawDate };
    }
  } catch (e) {
    console.error('Erro ao formatar data:', e);
  }

  return { dayId: 'dia-1', dayLabel: rawDate, date: rawDate };
}

export async function getEventInfo(): Promise<EventInfo & { 
  eventoAtivo: boolean; 
  logoUrl?: string; 
  symplaUrl?: string; 
  instagramUrl?: string;
  ano?: string;
}> {
  let eventoAtivo = true;
  let logoUrl = '';
  let symplaUrl = 'https://www.sympla.com.br';
  let instagramUrl = 'https://www.instagram.com';
  let edicao = 'Edição XXXIII';
  let datas = '15 a 19 de Maio';
  let ano = new Date().getFullYear().toString();

  if (supabase) {
    // Adicionado cabeçalho no-store para forçar busca sem cache no Supabase
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
      if (data.logo_url) logoUrl = formatImageUrl(data.logo_url);
      if (data.sympla_url) symplaUrl = data.sympla_url;
      if (data.instagram_url) instagramUrl = data.instagram_url;
      if (data.edicao) edicao = data.edicao;
      if (data.datas) datas = data.datas;
      if (data.ano) ano = data.ano;
    }
  }

  return {
    editionLabel: edicao,
    institution: 'FATEC Sorocaba',
    dateRangeLabel: datas,
    dateRangeDescription: 'Cinco dias de imersão tecnológica intensa e networking.',
    socialHandle: '@SETEC.OFICIAL',
    eventoAtivo,
    logoUrl,
    symplaUrl,
    instagramUrl,
    ano
  };
}

export async function getPartners(): Promise<Partner[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('patrocinadores')
    .select('id, nome_empresa, logo_url, nivel')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  // Mapeamento de prioridade para os níveis de patrocínio
  const levelPriority: Record<string, number> = {
    master: 1,
    diamond: 2,
    titanium: 3,
    platinum: 4,
    gold: 5,
  };

  // Ordena os patrocinadores de acordo com a hierarquia definida
  const sortedData = [...data].sort((a, b) => {
    const priorityA = levelPriority[a.nivel?.toLowerCase()?.trim()] ?? 99;
    const priorityB = levelPriority[b.nivel?.toLowerCase()?.trim()] ?? 99;
    return priorityA - priorityB;
  });

  return sortedData.map((p) => ({
    id: String(p.id),
    name: p.nome_empresa || '',
    logoUrl: formatImageUrl(p.logo_url),
  })) as Partner[];
}

export async function getSpeakers(): Promise<Speaker[]> {
  if (!supabase) return [];

  const { data: palestrasData } = await supabase.from('palestras').select('*');
  if (!palestrasData) return [];

  return palestrasData.map((p) => ({
    id: `sp-${p.id}`,
    name: p.nome_completo || p.palestrante || '',
    role: p.cargo || '',
    company: p.empresa || p.instituicao || '',
    photoUrl: formatImageUrl(p.foto_url),
    bio: p.sobre_palestrante || p.sobre || '',
  })) as Speaker[];
}

export async function getSpeakerById(id: string): Promise<Speaker | undefined> {
  if (!id) return undefined;
  const speakersList = await getSpeakers();
  return speakersList.find((s) => String(s.id) === String(id));
}

export async function getSessions(): Promise<Session[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('palestras').select('*');
  if (error || !data) return [];

  return data.map((s) => {
    const { dayId, dayLabel, date } = formatDateLabel(s.data);

    return {
      id: String(s.id),
      slug: s.slug || String(s.id),
      title: s.titulo || '',
      category: s.categoria || 'PALESTRA',
      track: s.trilha || 'Geral',
      date: date,
      dayId: s.day_id || dayId,
      dayLabel: s.day_label || dayLabel,
      timeStart: formatTime(s.hora_inicio),
      timeEnd: formatTime(s.hora_fim),
      location: s.local || '',
      description: s.sobre_palestra || s.descricao || '',
      highlightNumber: s.highlight_number,
      speakerIds: [`sp-${s.id}`],
      editionTag: s.edition_tag || 'SETEC XXXIII',
    };
  }) as Session[];
}

export async function getFeaturedSessions(): Promise<Session[]> {
  const allSessions = await getSessions();
  
  // Data e hora atual no momento do build/render
  const now = new Date();

  // Filtra palestras cujo horário de término ainda não passou
  const upcomingSessions = allSessions.filter((s) => {
    if (!s.date || !s.timeEnd) return true;

    try {
      // Concatena data e hora final (ex: "2026-10-08T13:40:00")
      const endTimeString = `${s.date}T${s.timeEnd.length === 5 ? s.timeEnd + ':00' : s.timeEnd}-03:00`;
      const sessionEndTime = new Date(endTimeString);

      // Mantém apenas palestras cujo fim é maior que o momento atual
      return sessionEndTime.getTime() > now.getTime();
    } catch (e) {
      return true;
    }
  });

  // Ordena por data e hora de início mais próxima
  upcomingSessions.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.timeStart}`).getTime();
    const timeB = new Date(`${b.date}T${b.timeStart}`).getTime();
    return timeA - timeB;
  });

  // Retorna no máximo as 3 próximas palestras
  return upcomingSessions.slice(0, 3);
}

export async function getSessionsGroupedByDay(): Promise<
  { dayId: string; dayLabel: string; date: string; sessions: Session[] }[]
> {
  const allSessions = await getSessions();
  const map = new Map<
    string,
    { dayId: string; dayLabel: string; date: string; sessions: Session[] }
  >();

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
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSessionWithSpeakers(sessionId: string) {
  if (!supabase) return undefined;

  const { data: p } = await supabase
    .from('palestras')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (!p) return undefined;

  const { dayId, dayLabel, date } = formatDateLabel(p.data);

  const sessionObj: Session = {
    id: String(p.id),
    slug: p.slug || String(p.id),
    title: p.titulo || '',
    category: p.categoria || 'PALESTRA',
    track: p.trilha || 'Geral',
    date: date,
    dayId: p.day_id || dayId,
    dayLabel: p.day_label || dayLabel,
    timeStart: formatTime(p.hora_inicio),
    timeEnd: formatTime(p.hora_fim),
    location: p.local || '',
    description: p.sobre_palestra || p.descricao || '',
    highlightNumber: p.highlight_number,
    speakerIds: [`sp-${p.id}`],
    editionTag: p.edition_tag || 'SETEC XXXIII',
  };

  const speakerObj: Speaker = {
    id: `sp-${p.id}`,
    name: p.nome_completo || '',
    role: p.cargo || '',
    company: p.empresa || p.instituicao || '',
    photoUrl: formatImageUrl(p.foto_url),
    bio: p.sobre_palestrante || p.sobre || '',
  };

  return { ...sessionObj, speakers: [speakerObj] };
}

export async function getAllSessionsWithSpeakers() {
  const allSessions = await getSessions();
  return Promise.all(allSessions.map((s) => getSessionWithSpeakers(s.id)));
}