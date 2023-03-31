import { getStrokeNumber, getStrokeType } from '../stroke/stroke';
import { simplifiedToTraditional } from '../utils/opencc';
import { getSancaiConfig } from './sancai';

/**
 * 总格数理（81数理）
 * 总格数理（81数理）是日本人熊崎健翁依据姓名的笔画数和一定规则建立起来天格、地格、人格、总格、外格等五格数理关系，并以其所谓的81数理，来推算人的各方面运势。
 * @description
 * 姓名学数理包括天格、人格、地格、外格、总格的五格。
 * 人格：又称主格，是姓名的中心点，主管人一生命运。
 * 总格：又称后运，是后半生的命运，影响中年到老年。
 * 天、人、地三才：暗示健康、生活是否顺利。
 * 数理来自姓名笔画，由数字组成，81个数为一个整单位，每个数字都属于一个五行。
 */

interface Wuge {
  tian: number;
  ren: number;
  di: number;
  zong: number;
  wai: number;
}

interface SancaiWuge extends Wuge{
  renStrokeType: string;
  diStrokeType: string;
  zongStrokeType: string;
  waiStrokeType: string;
  sancai: string;
}

/**
 * 计算一个人的三才五格
 * @param surname 姓氏
 * @param name 名称
 */
export function calcSancaiWuge(surname: string, name: string): SancaiWuge {
  const surnameTraditional = simplifiedToTraditional(surname);
  const nameTraditional = simplifiedToTraditional(name);

  const xing1Stroke = getStrokeNumber(surnameTraditional[0]);
  const xing2Stroke = surnameTraditional ? getStrokeNumber(surnameTraditional[1]) : 0;

  const ming1Stroke = getStrokeNumber(nameTraditional[0]);
  const ming2Stroke = nameTraditional ? getStrokeNumber(nameTraditional[1]) : 0;

  const tian = getTianGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const ren = getRenGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const di = getDiGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const zong = getZongGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const wai = getWaiGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);

  const sancai = getSancaiConfig([tian, ren, di]);
  return {
    tian,
    ren,
    renStrokeType: getStrokeType(ren),
    di,
    diStrokeType: getStrokeType(di),
    zong,
    zongStrokeType: getStrokeType(zong),
    wai,
    waiStrokeType: getStrokeType(wai),
    sancai,
  };
}

/**
 * 计算一个人的五格
 * * @param xing1Stroke 姓1笔画
 * @param xing2Stroke 姓2笔画
 * @param _ming1Stroke 名1笔画
 * @param _ming2Stroke 名2笔画
 */
export function calcWuge(xing1Stroke: number, xing2Stroke: number, ming1Stroke: number, ming2Stroke: number):Wuge {
  const tian = getTianGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const ren = getRenGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const di = getDiGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const zong = getZongGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
  const wai = getWaiGe(xing1Stroke, xing2Stroke, ming1Stroke, ming2Stroke);
 
  return {
    tian,
    ren,
    di,
    zong,
    wai,
  };
}

/**
 * 天格：单姓的天格是“单姓笔画+1”，复姓的天格是“复姓笔画数相加”
 * @param xing1Stroke 姓1笔画
 * @param xing2Stroke 姓2笔画
 * @param _ming1Stroke 名1笔画
 * @param _ming2Stroke 名2笔画
 * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
 */
export function getTianGe(xing1Stroke: number, xing2Stroke: number, _ming1Stroke: number, _ming2Stroke: number): number {
  return xing2Stroke === 0 ? xing1Stroke + 1 : xing1Stroke + xing2Stroke;
}

/**
 * 单姓的人格是“姓的笔画数+名（第一字）的笔画数”，复姓的人格数理是“复姓的第二个字笔画+名的第一个字笔画”；
 * @param xing1Stroke 姓1笔画
 * @param xing2Stroke 姓2笔画
 * @param ming1Stroke 名1笔画
 * @param _ming2Stroke 名2笔画
 * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
 */
export function getRenGe(xing1Stroke: number, xing2Stroke: number, ming1Stroke: number, _ming2Stroke: number): number {
  return xing2Stroke === 0 ? xing1Stroke + ming1Stroke : xing2Stroke + ming1Stroke;
}

/**
 * 双名的地格是“名字的笔画数相加”，单名的地格是“名的笔画数+1”。
 * @param _xing1Stroke 姓1笔画
 * @param _xing2Stroke 姓2笔画
 * @param ming1Stroke 名1笔画
 * @param ming2Stroke 名2笔画
 * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
 */
export function getDiGe(_xing1Stroke: number, _xing2Stroke: number, ming1Stroke: number, ming2Stroke: number): number {
  return ming2Stroke === 0 ? ming1Stroke + 1 : ming1Stroke + ming2Stroke;
}

/**
 * 总格：总格是“姓名笔画数的总和”。
 * @param xing1Stroke 姓1笔画
 * @param xing2Stroke 姓2笔画
 * @param ming1Stroke 名1笔画
 * @param ming2Stroke 名2笔画
 * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
 */
export function getZongGe(xing1Stroke: number, xing2Stroke: number, ming1Stroke: number, ming2Stroke: number): number {
  // 归一
  const zongGe = xing1Stroke + xing2Stroke + ming1Stroke + ming2Stroke - 1;
  return (zongGe % 81) + 1;
}

/**
 * 单姓“姓名总格减去人格之差再加1”；复姓“将姓名总格减去人格之差”即为外格。
 * 单姓单名的外格为2，复姓单名的外格为“总格数理-人格数理+1”。
 * @param xing1Stroke 姓1笔画
 * @param xing2Stroke 姓2笔画
 * @param _ming1Stroke 名1笔画
 * @param ming2Stroke 名2笔画
 * @see {@link https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675?fromtitle=81%E6%95%B0%E7%90%86&fromid=23720201&fr=aladdin}
 */
export function getWaiGe(xing1Stroke: number, xing2Stroke: number, _ming1Stroke: number, ming2Stroke: number): number {
  // 单姓单名
  if (xing2Stroke == 0 && ming2Stroke == 0) {
    return 2;
  }

  //单姓复名
  if (xing2Stroke == 0 && ming2Stroke != 0) {
    return 1 + ming2Stroke;
  }

  //复姓单名
  if (xing2Stroke !== 0 && ming2Stroke == 0) {
    return xing1Stroke + 1;
  }

  //复姓复名
  return xing1Stroke + ming2Stroke;
}
