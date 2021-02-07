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
  biomeName: string,
  settings: RunSettings
}
