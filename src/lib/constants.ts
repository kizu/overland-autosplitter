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

export type BiomeName = keyof typeof BIOME_NAME_MAP;
