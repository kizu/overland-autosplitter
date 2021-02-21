export const BIOME_NAME_MAP = {
  introduction: 'Introduction',
  city: 'East Coast',
  woodlands: 'Woodlands',
  grasslands: 'Grasslands',
  mountains: 'Mountains',
  desert: 'Desert',
  basin: 'Basin',
  reef: 'Reef'
} as const;

type ValueOf<T> = T[keyof T];

export type BiomeKey = keyof typeof BIOME_NAME_MAP;
export type BiomeName = ValueOf<typeof BIOME_NAME_MAP>;

export const timeOfDayMap = ['dawn', 'afternoon', 'sunset', 'night'] as const;
export type TimeOfDay = typeof timeOfDayMap[number];

