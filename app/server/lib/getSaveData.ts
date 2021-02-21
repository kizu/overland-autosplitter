import JSPath from 'jspath';
import { default as ticksToDate } from 'ticks-to-date';

import { log } from './debugLog';
import type { SaveData } from '../../src/lib/types';
import { timeOfDayMap } from '../../src/lib/constants';

const getNode = (result: any, path: string, all = false) => {
  // we need any here as the type definition is wrong to say it returns an array,
  // while in reality it can be a single item when there is [] in the path.
  const node = JSPath.apply(`..*{.$.${path}}${all ? '' : '[0]'}`, result) as any;
  if (all ? node.length : node) {
    if (all ? node[0]['_'] : node['_']) {
      return all ? node.map((item: any) => JSON.parse(item['_'])) : JSON.parse(node['_']);
    } else {
      return node;
    }
  }

  return {};
}

/** Getting all the data needed from the save file
 * For now using the jspath, but maybe there is a better way to handle this.
 */
export const getSaveData = (result: any, currentTime: string): SaveData | undefined => {
  const { filename, buildNumber, lastSavedTimeStamp } =
    getNode(result, 'class === "SaveFileComponent"');
  const { distanceDriven, biomeName } =
    getNode(result, 'class === "MapComponent"');
  const { turn } = getNode(result, 'class === "TurnComponent"');
  const { scene, maps, achievements, ...settings } =
    getNode(result, 'class === "GameComponent"');
  const { dayChunks } = getNode(result, 'class === "TimeOfDayComponent"')
  const { iconPath } = getNode(result, 'class === "LevelInfoComponent"')
  // `on` can be used to diff between the initial level and restart
  const survivors = getNode(result, 'name === "survivors"');
  const { on } =
    getNode(survivors, 'class === "VehicleComponent"')

  const fuelData: { maxFuel: number, fuel: number }[] | {} = getNode(survivors, 'class === "FuelComponent"', true);

  const BeachFireBurning = getNode(result, 'name === "BeachFireBurning"')
  // level > FuelCan > FuelComponent -> fuel cans
  // what's at gas station?
  // survivors > FuelComponent -> currently

  // Converting the timestamp from C# ticks to js date
  const timestamp = ticksToDate(lastSavedTimeStamp)?.getTime();
  if (!timestamp) {
    log('Error in converting timestamp', lastSavedTimeStamp);
    return;
  }

  // FIXME: in the intro the fuel would be incorrect
  // Also, on the rest stops it is equal to 0
  const fuel = Array.isArray(fuelData) ? fuelData.reduce<number>((acc, { fuel }) => acc + fuel, 0) : 0;

  const timeOfDay = timeOfDayMap[dayChunks % 4];

  const isEnd = biomeName === 'reef' && iconPath === 'LocCamp' && Object.keys(BeachFireBurning).length > 0;

  const saveData = {
    currentTime, // just for debugging
    timestamp,
    fuel,
    timeOfDay,
    isEnd,
    on,
    iconPath,
    dayChunks,
    scene,
    settings,
    turn,
    distanceDriven,
    biomeName,
    filename,
    buildNumber
  };

  log(saveData)
  return saveData;
}
