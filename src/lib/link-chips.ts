// Chips de links (redes sociais / sites) usados nos modais de palestra e de minicurso.
// O estilo da animação (ícone que expande mostrando o nome e o perfil) fica em
// global.css, na classe .link-chips do contêiner.

export interface LinkChipData {
  type: string;
  url: string;
}

const ICON_BASE =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"';

export const LINK_META: Record<string, { name: string; icon: string }> = {
  linkedin: {
    name: 'LinkedIn',
    icon: `<svg ${ICON_BASE}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  },
  instagram: {
    name: 'Instagram',
    icon: `<svg ${ICON_BASE}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  },
  github: {
    name: 'GitHub',
    icon: `<svg ${ICON_BASE}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  },
  facebook: {
    name: 'Facebook',
    icon: `<svg ${ICON_BASE}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  },
  twitter: {
    name: 'X / Twitter',
    icon: `<svg ${ICON_BASE}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
  },
  youtube: {
    name: 'YouTube',
    icon: `<svg ${ICON_BASE}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>`,
  },
  site: {
    name: 'Site',
    icon: `<svg ${ICON_BASE}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  },
};

/** Legenda curta da URL: nome do perfil (redes) ou domínio (sites). */
export function getLinkHandle(type: string, rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./i, '');
    const parts = url.pathname.split('/').filter(Boolean);

    if (type === 'site') return host;

    let handle = '';
    if (type === 'linkedin') {
      // /in/nome-do-perfil ou /company/nome-da-empresa
      const i = parts.findIndex((p) => ['in', 'company', 'school'].includes(p));
      handle = i >= 0 ? (parts[i + 1] ?? '') : (parts[0] ?? '');
    } else if (type === 'youtube') {
      // /@canal, /c/canal, /channel/id, /user/nome
      handle = parts[0]?.startsWith('@') ? parts[0] : (parts[1] ?? parts[0] ?? '');
    } else {
      // instagram, github, facebook, twitter: primeiro trecho do caminho
      handle = parts[0] ?? '';
    }

    handle = decodeURIComponent(handle).replace(/^@/, '');
    if (!handle) return '';

    const comArroba = ['instagram', 'twitter', 'youtube'].includes(type);
    return comArroba ? `@${handle}` : handle;
  } catch {
    return '';
  }
}

/** Substitui o conteúdo do contêiner pelos chips dos links. */
export function renderLinkChips(container: HTMLElement | null, links: LinkChipData[] = []) {
  if (!container) return;
  container.replaceChildren();

  links.forEach((link) => {
    const meta = LINK_META[link.type] ?? LINK_META.site;
    const handle = getLinkHandle(link.type, link.url);
    const accessibleName = handle ? `${meta.name}: ${handle}` : meta.name;

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = link.url; // tooltip sempre mostra a URL completa
    a.setAttribute('aria-label', `${accessibleName} (abre em nova aba)`);
    a.className =
      'link-chip group flex h-11 items-center overflow-hidden rounded-xl border border-white/15 bg-[#111113] text-white/80 shadow-lg transition-colors duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 [.light_&]:border-black/10 [.light_&]:bg-white [.light_&]:text-slate-700 [.light_&]:hover:border-black/25 [.light_&]:focus-visible:ring-black/30';

    const iconBox = document.createElement('span');
    iconBox.className = 'flex h-11 w-11 shrink-0 items-center justify-center';
    iconBox.innerHTML = meta.icon; // SVG fixo definido acima, não vem do banco

    // Estrutura da animação: reveal (grid 0fr → 1fr) > clip (corta) > text (conteúdo real)
    const reveal = document.createElement('span');
    reveal.className = 'link-reveal';

    const clip = document.createElement('span');
    clip.className = 'link-clip';

    const text = document.createElement('span');
    text.className = 'link-text flex flex-col justify-center pr-4 leading-tight';

    const name = document.createElement('span');
    name.className = 'whitespace-nowrap text-sm font-medium';
    name.textContent = meta.name;
    text.append(name);

    if (handle) {
      const sub = document.createElement('span');
      sub.className = 'mt-0.5 truncate text-[11px] text-white/50 [.light_&]:text-slate-500';
      sub.textContent = handle; // textContent evita injeção de HTML
      text.append(sub);
    }

    clip.append(text);
    reveal.append(clip);
    a.append(iconBox, reveal);
    container.appendChild(a);
  });
}
