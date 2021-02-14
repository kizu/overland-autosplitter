
import type { BiomeKey, BiomeName } from './constants';

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
  biomeName: BiomeKey,
  settings: RunSettings
}

export type EventType = 'unknown' | 'start' | 'first turn' | 'new turn' | 'map arrival' | 'biome transition' | 'subSegment start' | 'end';

export interface Event {
  type: EventType;
  timestamp: number;
  biomeName: BiomeKey;
  iconPath: string;
  turn: number;
}

export type SubSegmentName = 'Roadblock' | 'Survivor' | 'Vehicle' | 'Fuel' | 'GasStation' | 'Camp' | 'Reef' | 'Beach';

export interface Segment<T = BiomeName> {
  name: T;
  start?: number;
  end?: number;
  subSegments: Segment<SubSegmentName>[];
}
