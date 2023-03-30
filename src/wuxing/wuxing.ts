import { FiveElement } from "../enums/FiveElement";

/**
 * 五行相生相克关系：
 * 木生火 火生土 土生金 金生水 水生木
 * 木克土 土克水 水克火 火克金 金克木
 */

/**
 * 三才转换为五格
 * @param count 笔画数
 * @description
 * 数字1、2为木，3、4为火，5、6为土，7、8为金，9、10为水，三才数理只计 1-10 的数，超过 10 以上的数，只计个位，个位为0，则计为10
 * @see {@link http://www.tazzfdc.com/kxnew/160nn9.html}
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
