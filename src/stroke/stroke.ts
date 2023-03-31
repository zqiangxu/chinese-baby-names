import { checkSancaiGood } from '../wuxing/sancai';
import { simplifiedToTraditional } from '../utils/opencc';
import { Database } from '../name/database';
import { FATE_COUNT, STROKE_BADS, STROKE_GENERALS, STROKE_GOODS } from './constant';
import { calcWuge } from 'src/wuxing/wuge';

const NumStrokeNumber: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

/**
 *
 * @param surname 姓
 * @param allowGeneral 是否允许中吉
 */
export function getGoodStrokeList(surname: string, allowGeneral: boolean): [number, number][] {
  const strokeList: [number, number][] = [];

  // 姓氏转繁体
  const surnameTraditional = simplifiedToTraditional(surname);
  const xing1Stroke = getStrokeNumber(surnameTraditional[0]);
  const xing2Stroke = surname[1] ? getStrokeNumber(surnameTraditional[1]) : 0;

  /**
   * 总格数理
   * 总格数理（81数理）是日本人熊崎健翁依据姓名的笔画数和一定规则建立起来天格、地格、人格、总格、外格等五格数理关系，并以其所谓的 81 数理，来推算人的各方面运势。
   * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
   */
  for (let i = 1; i < FATE_COUNT; i++) {
    
    // 可能是单名
    if (isGoodStroke(xing1Stroke, xing2Stroke, i, 0, allowGeneral)){
      strokeList.push([i, 0]);
    }

    // 复名
    for (let j = 1; j < FATE_COUNT; j++) {
      if (isGoodStroke(xing1Stroke, xing2Stroke, i, j, allowGeneral)) {
        strokeList.push([i, j]);
      }
    }
  }

  return strokeList;
}

/**
 * 判断是否姓和名的笔画数计算是否为吉的笔画数
 * @param stroke
 * @returns
 * @description 去掉外格的比对，否则单名单字一直为凶。
 * [将姓名按笔画数分成五格：天格、人格、地格、总格、外格。三才是指天、人、地格的五行属性，取相生吉，相克凶。] - 百度百科。
 * 所以应该取[天地人]即可。
 */
export function isGoodStroke(
  xing1Stroke: number,
  xing2Stroke: number,
  ming1Stroke: number,
  ming2Stroke: number,
  allowGeneral: boolean
): boolean {
  const wuge = calcWuge(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const { tian, ren, di, zong } = wuge;

  // 检测笔画是否为 大吉
  // 不同的笔画，被划分为吉、半吉、凶三组
  if (STROKE_GOODS.includes(ren) && STROKE_GOODS.includes(di) && STROKE_GOODS.includes(zong)) {
    // 检查三才
    if (checkSancaiGood([tian, ren, di], allowGeneral)) {
      return true;
    }
  }

  if (
    allowGeneral &&
    (STROKE_GOODS.includes(ren) || STROKE_GENERALS.includes(ren)) &&
    (STROKE_GOODS.includes(di) || STROKE_GENERALS.includes(di)) &&
    (STROKE_GOODS.includes(zong) || STROKE_GENERALS.includes(zong))
  ) {
    if (checkSancaiGood([tian, ren, di], allowGeneral)) {
      return true;
    }
  }

  return false;
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
    // 名字中有“一、二、三、四、五、六、七、八、九、十”的字要分别按1、2、3、4、5、6、7、8、9、10画
    if (NumStrokeNumber[char]) {
      total += NumStrokeNumber[char];
    } else {
      total += Database.strokeDirectory[char];
    }
  }

  return getFinalNumber(word, total);
}

/**
 * 有一些偏旁部首影响笔画数的计算
 * @param word
 * @param number
 * @see {@link https://juejin.cn/post/6868186071260856334}
 */
function getFinalNumber(word: string, number: number): number {
  for (let char of word) {
    if (char in Database.splitDirectory) {
      const splits = Database.splitDirectory[char];

      // "氵"三点水算四画。如：清、洁等
      if (splits.includes('氵')) {
        // 水
        number += 1;
      }

      // “扌”手旁算四画。如挑、拨等
      if (splits.includes('扌')) {
        // 手
        number += 1;
      }

      // “月”算肉旁六画。如服、肪、脉等
      if (splits[0] === '月') {
        // 肉
        number += 2;
      }

      // “艹”算六画。如英、苹、蓉等
      if (splits.includes('艹')) {
        // 艸
        number += 3;
      }

      // “辶”算七画。如达、迈、迅、过等
      if (splits.includes('辶')) {
        // 辵
        number += 4;
      }

      // 左“阝”算八画，阳、阴、陈、陆等
      if (splits[0] === '阜') {
        // 左阝 阜
        number += 6;
      }

      // 右“卩”算七画，如即、邓、邝等
      if (splits.includes('邑') && splits.includes('阝')) {
        // 右阝 邑
        number += 5;
      }

      // “王”算五画，如琬、珀、玫、瑰等
      if (splits[0] === '玉') {
        // 王字旁 玉
        number += 1;
      }

      // 礻（示），以示字计为五画
      if (splits[0] === '示') {
        // 礻 示
        number += 1;
      }

      // 衤（衣），以衣字计为六画
      if (splits[0] === '衣') {
        // 衤 衣
        number += 1;
      }

      // “犭”算四画。如狄、猛、独等
      if (splits[0] === '犭') {
        // 犭 犬
        number += 1;
      }

      // 忄（心），竖心旁，以心字计为四画
      if (splits[0] === '心') {
        // 忄 心
        number += 1;
      }
    }
  }
  return number;
}
