
import type { BiomeKey, BiomeName, TimeOfDay } from './constants';

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

export interface RunData {
  startDate: number;
  endDate?: number;
  buildNumber?: number;
  biomeName?: BiomeKey;
  settings?: RunSettings;
  events: EventData[];
}

export type EventType = 'unknown' | 'start' | 'map arrival' | 'biome transition' | 'walkout' | 'subSegment start' | 'subSegment restart' | 'end' | 'first turn' | 'new turn';

export interface EventData {
  type: EventType;
  timestamp: number;
  biomeName: BiomeKey;
  iconPath: string;
  turn: number;
  // Make these optional until we would have only proper events
  timeOfDay?: 'dawn' | 'afternoon' | 'sunset' | 'night';
  scene?: number;
  fuel?: number;
}

export type SubSegmentName = 'Roadblock' | 'Survivor' | 'Vehicle' | 'Fuel' | 'GasStation' | 'Camp' | 'Reef' | 'Beach';

export interface Segment<T = BiomeName> {
  name: T;
  start?: number;
  end?: number;
  isNight?: boolean;
  turns?: number;
  fuelStart?: number;
  fuelEnd?: number;
  subSegments: Segment<SubSegmentName>[];
}

export interface SaveData {
  currentTime: string;
  timestamp: number;
  fuel?: number; // doesn't cover the starting 0/6 yet
  timeOfDay: TimeOfDay;
  isEnd: boolean;
  on?: boolean;
  iconPath: string; // could be more specific, but should it?
  dayChunks: number;
  scene: number; // could be more specific
  settings: RunSettings;
  turn: number;
  distanceDriven: number,
  biomeName: BiomeKey;
  filename: string;
  buildNumber: number;
}

export interface ElectronData {
  savesUrl?: string;
  runData?: RunData;
}
