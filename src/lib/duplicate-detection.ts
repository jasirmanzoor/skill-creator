import { v4 as uuid } from 'uuid';
import { haversineMeters } from './geo';
import type { Dealership } from './types';
import type { DuplicateFlag } from './research-types';

const GENERIC_WORDS = new Set([
  'car', 'cars', 'company', 'co', 'showroom', 'for', 'group', 'ltd', 'trading',
  'commercial', 'exhibition', 'of', 'the', 'excellence', 'est', 'establishment',
]);

function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !GENERIC_WORDS.has(w))
    .sort()
    .join(' ')
    .trim();
}

/**
 * Flags likely duplicates by name similarity, corroborated by GPS proximity
 * where available. This market has many genuinely distinct showrooms only
 * metres apart, so proximity alone is deliberately NOT used as a signal —
 * only a name match (exact or one-contains-the-other after stripping
 * generic words) creates a flag. Never auto-merges; always for manual review.
 */
export function findSuspectedDuplicates(dealerships: Dealership[]): DuplicateFlag[] {
  const candidates = dealerships.filter((d) => d.visitStatus !== 'competitor' && d.visitStatus !== 'closed_moved');
  const flags: DuplicateFlag[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    const na = normaliseName(a.nameEn);
    if (na.length < 3) continue;

    for (let j = i + 1; j < candidates.length; j++) {
      const b = candidates[j];
      const nb = normaliseName(b.nameEn);
      if (nb.length < 3) continue;

      const exact = na === nb;
      const contains = !exact && (na.includes(nb) || nb.includes(na)) && Math.min(na.length, nb.length) >= 4;
      if (!exact && !contains) continue;

      const distance = haversineMeters(a, b);
      flags.push({
        id: uuid(),
        dealershipIdA: a.id,
        dealershipIdB: b.id,
        reason: exact
          ? 'Exact name match'
          : `Name overlap ("${a.nameEn}" / "${b.nameEn}")`,
        distanceMeters: Number.isFinite(distance) ? Math.round(distance) : null,
        createdAt: now,
        status: 'pending',
      });
    }
  }

  return flags;
}
