
import type { BiomeKey, BiomeName, TimeOfDay } from './constants';

// Order of things:
// 1. SaveData with settings
// 2. Events
// 3. RunData
// 4. Segments etc?

export interface RunSettings {
  restartEnabled: boolean;
  turnTimerEnabled: boolean;
  difficulty: number;
  touristMode: boolean;
  allDogsMode: boolean;
  alwaysNightMode: boolean;
  extraCreaturesMode: boolean;
  noReviveMode: boolean;
  noStunMode: boolean;
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

export interface EventSegmentStart {
  type: 'segment-start';
  biome: BiomeKey;
  location: string;
  timeOfDay: SaveData['timeOfDay'];
}

export interface EventSegmentEnd {
  type: 'segment-end';
  nextBiome?: BiomeKey; // if absent === map transition, if present === biome transition
  fuel: number;
  turns: number;
}

export interface EventEnd {
  type: 'end'
}

export type EventData = Record<string, EventSegmentStart | EventSegmentEnd | EventEnd>

export interface RunData {
  events: EventData;
  build?: number;
  difficulty?: "Tourist" | "Any%" | "Hard" | "Ultimate" | "Expert";
  isAllDogs?: boolean;

  manualStart?: number;
  manualEnd?: number;
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
  subSegments: SubSegment[];
}

export type Segments = Partial<Record<BiomeKey, Segment>>;

export type SubSegment = Omit<Segment<SubSegmentName>, 'subSegments'>;

export interface ElectronData {
  savesUrl?: string;
  runData?: RunData;
  knownRuns?: Record<string, string>;
}
