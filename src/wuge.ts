import { getStrokeNumber } from './utils/stoke';
import { simplifiedToTraditional } from './utils/convert';

const stroke_goods = [
  1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81,
];

const stroke_generals = [27, 38, 42, 55, 58, 71, 72, 73, 77, 78];

const stroke_bads = [
  2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 28, 30, 34, 36, 40, 43, 44, 46, 49, 50, 51, 53, 54, 56, 59, 60, 62, 64, 66, 69, 70, 74, 75, 76, 79,
  80,
];

const stroke_list: number[][] = [];

export function getStrokeList(last_name: string, allow_general: boolean): number[][] {
  console.log('>>计算笔画组合...');
  // 姓氏转繁体
  last_name = simplifiedToTraditional(last_name);
  const n = getStrokeNumber(last_name);
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
      
      if (stroke_goods.includes(ren) && stroke_goods.includes(di) && stroke_goods.includes(zong) && stroke_goods.includes(wai)) {
        if (checkSancaiGood([tian, ren, di], allow_general)) {
          stroke_list.push([i, j]);
        }
      } else if (
        allow_general &&
        (stroke_goods.includes(ren) || stroke_generals.includes(ren)) &&
        (stroke_goods.includes(di) || stroke_generals.includes(di)) &&
        (stroke_goods.includes(zong) || stroke_generals.includes(zong)) &&
        (stroke_goods.includes(wai) || stroke_generals.includes(wai))
      ) {
        if (checkSancaiGood([tian, ren, di], allow_general)) {
          stroke_list.push([i, j]);
        }
      }
    }
  }
  console.log('>>' + JSON.stringify(stroke_list));
  return stroke_list;
}

// 大吉
const wuxing_goods = [
  '木木木',
  '木木火',
  '木木土',
  '木火木',
  '木火土',
  '木水木',
  '木水金',
  '木水水',
  '火木木',
  '火木火',
  '火木土',
  '火火木',
  '火火土',
  '火土火',
  '火土土',
  '火土金',
  '土火木',
  '土火火',
  '土火土',
  '土土火',
  '土土土',
  '土土金',
  '土金土',
  '土金金',
  '土金水',
  '金土火',
  '金土土',
  '金土金',
  '金金土',
  '金水木',
  '金水金',
  '水木木',
  '水木火',
  '水木土',
  '水木水',
  '水金土',
  '水金水',
  '水水木',
  '水水金',
];

// 中吉
const wuxing_generals = [
  '木火火',
  '木土火',
  '火木水',
  '火火火',
  '土木木',
  '土木火',
  '土土木',
  '金土木',
  '金金金',
  '金金水',
  '金水水',
  '水火木',
  '水土火',
  '水土土',
  '水土金',
  '水金金',
  '水水水',
];

// 凶
const wuxing_bads = [
  '木木金',
  '木火金',
  '木火水',
  '木土木',
  '木土水',
  '木金木',
  '木金火',
  '木金土',
  '木金金',
  '木金水',
  '木水火',
  '木水土',
  '火木金',
  '火火金',
  '火火水',
  '火金木',
  '火金火',
  '火金金',
  '火金水',
  '火水木',
  '火水火',
  '火水土',
  '火水金',
  '火水水',
  '土木土',
  '土木金',
  '土木水',
  '土火水',
  '土土水',
  '土金木',
  '土金火',
  '土水木',
  '土水火',
  '土水土',
  '土水水',
  '金木木',
  '金木火',
  '金木土',
  '金木金',
  '金木水',
  '金火木',
  '金火金',
  '金火水',
  '金金木',
  '金金木',
  '金水火',
  '水木金',
  '水火火',
  '水火土',
  '水火金',
  '水火水',
  '水土木',
  '水水土',
  '水金木',
  '水金火',
  '水水火',
  '水水土',
  '木木水',
  '木土金',
  '火土木',
  '火土水',
  '土火金',
  '金土水',
  '火金土',
  '土水金',
  '金火火',
  '金火土',
  '木土土',
  '金水土',
];

// 检查三才配置吉
function checkSancaiGood(counts: number[], allow_general: boolean): boolean {
  const config = getSancaiConfig(counts);
  if (wuxing_goods.includes(config)) {
    return true;
  } else if (allow_general && wuxing_generals.includes(config)) {
    return true;
  }
  return false;
}

// 获取对应五行
export function getWuxing(count: number): string {
  count = count % 10;
  if (count === 1 || count === 2) {
    return '木';
  } else if (count === 3 || count === 4) {
    return '火';
  } else if (count === 5 || count === 6) {
    return '土';
  } else if (count === 7 || count === 8) {
    return '金';
  } else if (count === 9 || count === 0) {
    return '水';
  }
}

export function checkWugeConfig(name: string): void {
  if (name.length !== 3) {
    return;
  }
  // 姓名转繁体
  const complex_name = simplifiedToTraditional(name);
  const xing = getStrokeNumber(complex_name[0]);
  const ming1 = getStrokeNumber(complex_name[1]);
  const ming2 = getStrokeNumber(complex_name[2]);
  // 天格
  const tian = xing + 1;
  // 人格
  const ren = xing + ming1;
  // 地格
  const di = ming1 + ming2;
  // 总格
  const zong = xing + ming1 + ming2;
  // 外格
  const wai = zong - ren + 1;
  // 三才配置
  const sancai_config = getSancaiConfig([tian, ren, di]);
  // 输出结果
  console.log('\n');
  console.log(name + '\n');
  console.log(complex_name + ' ' + xing + ' ' + ming1 + ' ' + ming2 + '\n');
  console.log('天格\t' + tian);
  console.log('人格\t' + ren + '\t' + getStrokeType(ren));
  console.log('地格\t' + di + '\t' + getStrokeType(di));
  console.log('总格\t' + zong + '\t' + getStrokeType(zong));
  console.log('外格\t' + wai + '\t' + getStrokeType(wai));
  console.log('三才\t' + sancai_config + '\t' + getSancaiType(sancai_config) + '\n');
}

// 获取三才配置
function getSancaiConfig(counts: number[]): string {
  let config = '';
  for (const count of counts) {
    config += getWuxing(count);
  }
  return config;
}

function getStrokeType(stroke: number): string {
  if (stroke_goods.includes(stroke)) {
    return '大吉';
  } else if (stroke_generals.includes(stroke)) {
    return '中吉';
  } else if (stroke_bads.includes(stroke)) {
    return '凶';
  } else {
    return '';
  }
}

function getSancaiType(config: string): string {
  if (wuxing_goods.includes(config)) {
    return '大吉';
  } else if (wuxing_generals.includes(config)) {
    return '中吉';
  } else if (wuxing_bads.includes(config)) {
    return '凶';
  } else {
    return '';
  }
}