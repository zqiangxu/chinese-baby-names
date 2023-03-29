import { FiveElement } from "../enums/FiveElement";

/**
 * 获取对应五行
 */
export function getWuxing(count: number): FiveElement {
  count = count % 10;
  
  if (count === 1 || count === 2) {
    return FiveElement.WOOD;
  } else if (count === 3 || count === 4) {
    return FiveElement.FIRE;
  } else if (count === 5 || count === 6) {
    return FiveElement.EARTH;
  } else if (count === 7 || count === 8) {
    return FiveElement.GOLD;
  } else if (count === 9 || count === 0) {
    return FiveElement.WATER;
  }
}
