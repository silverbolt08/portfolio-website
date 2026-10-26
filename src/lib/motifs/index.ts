import type { Motif } from '../../types';
import { agents } from './agents';
import { layout } from './layout';
import { telemetry } from './telemetry';
import { brain } from './brain';
import { aptamer } from './aptamer';
import { cells } from './cells';
import { network, flame, slingshot } from './minor';

const DRAW: Record<Motif, () => string> = { agents, layout, telemetry, brain, aptamer, cells, network, flame, slingshot };
const cache = new Map<Motif, string>();

/** SVG drawing for a motif (cached; each is deterministic). */
export function drawMotif(motif: Motif | undefined): string {
  if (!motif) return '';
  if (!cache.has(motif)) cache.set(motif, DRAW[motif]());
  return cache.get(motif)!;
}
