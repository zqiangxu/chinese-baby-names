import { checkSancaiGood } from '../wuxing/sancai';
import { simplifiedToTraditional } from '../utils/convert';
import { Database } from '../utils/database';
import { STROKE_BADS, STROKE_GENERALS, STROKE_GOODS } from './constant';

const stroke_dic: { [key: string]: number } = Database.getStoke();
const split_dic: { [key: string]: string[] } = Database.chaizi();

const NumStrokeNumber: Record<string, number> = {
  '一': 1,
  '二': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9,
  '十': 10,
}

/**
 * 
 * @param surname 姓
 * @param allowGeneral 是否允许中吉
 * @returns 
 */
 export function getStrokeList(surname: string, allowGeneral: boolean): [number, number][] {
  const strokeList: [number, number][] = [];
  console.log('>>计算笔画组合...');

  // 姓氏转繁体
  surname = simplifiedToTraditional(surname);

  const n = getStrokeNumber(surname);

  for (let i = 1; i < 81; i++) {
    for (let j = 1; j < 81; j++) {

      // 天格
      const tian = n + 1;
      // 人格
      const ren = n + i;
      // 地格
      const di = i + j;
      // 总格
      const zong = n + i + j;
      // 外格
      const wai = zong - ren + 1;
      
      // 检测笔画是否为 大吉
      if (STROKE_GOODS.includes(ren) && STROKE_GOODS.includes(di) && STROKE_GOODS.includes(zong) && STROKE_GOODS.includes(wai)) {
        // 检查三才
        if (checkSancaiGood([tian, ren, di], allowGeneral)) {
          strokeList.push([i, j]);
        }
      } else if (
        allowGeneral &&
        (STROKE_GOODS.includes(ren) || STROKE_GENERALS.includes(ren)) &&
        (STROKE_GOODS.includes(di) || STROKE_GENERALS.includes(di)) &&
        (STROKE_GOODS.includes(zong) || STROKE_GENERALS.includes(zong)) &&
        (STROKE_GOODS.includes(wai) || STROKE_GENERALS.includes(wai))
      ) {
        if (checkSancaiGood([tian, ren, di], allowGeneral)) {
          strokeList.push([i, j]);
        }
      }
    }
  }

  console.log('>>' + JSON.stringify(strokeList));
  return strokeList;
}


export function getStrokeType(stroke: number): string {
  if (STROKE_GOODS.includes(stroke)) {
    return '大吉';
  } else if (STROKE_GENERALS.includes(stroke)) {
    return '中吉';
  } else if (STROKE_BADS.includes(stroke)) {
    return '凶';
  } else {
    return '';
  }
}

export function getStrokeNumber(word: string): number {
  let total = 0;
  
  for (let char of word) {
    // 数字需要单独处理
    if (NumStrokeNumber[char]) {
      total += NumStrokeNumber[char];
    } else {
      total += stroke_dic[char];
    }
  }

  return getFinalNumber(word, total);
}

function getFinalNumber(word: string, number: number): number {
  for (let char of word) {
    if (char in split_dic) {
      const splits = split_dic[char];
      if (splits.includes('氵')) {
        // 水
        number += 1;
      }
      if (splits.includes('扌')) {
        // 手
        number += 1;
      }
      if (splits[0] === '月') {
        // 肉
        number += 2;
      }
      if (splits.includes('艹')) {
        // 艸
        number += 3;
      }
      if (splits.includes('辶')) {
        // 辵
        number += 4;
      }
      if (splits[0] === '阜') {
        // 左阝 阜
        number += 6;
      }
      if (splits.includes('邑') && splits.includes('阝')) {
        // 右阝 邑
        number += 5;
      }
      if (splits[0] === '玉') {
        // 王字旁 玉
        number += 1;
      }
      if (splits[0] === '示') {
        // 礻 示
        number += 1;
      }
      if (splits[0] === '衣') {
        // 衤 衣
        number += 1;
      }
      if (splits[0] === '犭') {
        // 犭 犬
        number += 1;
      }
      if (splits[0] === '心') {
        // 忄 心
        number += 1;
      }
    }
  }
  return number;
}
