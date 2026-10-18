import type { Speaker } from './types';

/** Fotos de um palestrante (aceita uma foto ou várias). */
export function speakerPhotos(sp: Speaker): string[] {
  return Array.isArray(sp.photoUrl) ? sp.photoUrl.filter(Boolean) : sp.photoUrl ? [sp.photoUrl] : [];
}

/** "Ana", "Ana e Bruno", "Ana, Bruno e Carla". */
export function joinNames(names: string[]): string {
  const list = names.map((n) => n.trim()).filter(Boolean);
  if (list.length <= 1) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? '?'}${parts[1]?.[0] ?? ''}`.toUpperCase();
}
