
import type { BiomeName  } from './constants';

export interface RunSettings {
  restartEnabled: boolean;
  turnTimerEnabled: boolean;
  difficulty: number;
  touristMode: boolean;
  allDogsMode: true;
  alwaysNightMode: boolean;
  extraCreaturesMode: boolean;
  noReviveMode: boolean;
  noStunMode: boolean;
}

export interface RunStats {
  startDate: number,
  buildNumber: number,
  biomeName: BiomeName,
  settings: RunSettings
}

export type EventType = 'unknown' | 'start' | 'first turn' | 'new turn' | 'map arrival' | 'biome transition' | 'subSegment start';

export interface Event {
  type: EventType;
  timestamp: number;
  biomeName: BiomeName;
  iconPath: string;
  turn: number;
}

export interface Segment {
  name: string;
  start: number;
  end?: number;
  subSegments: Segment[];
}
