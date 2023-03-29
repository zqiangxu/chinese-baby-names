import { getStrokeNumber, getStrokeType } from 'src/stroke/stroke';
import { simplifiedToTraditional } from 'src/utils/convert';
import { getSancaiConfig } from './sancai';

/**
 * 获取一个姓名的五格配置
 * @param name 
 * @returns 
 */

interface WugeConfig {
  tian: number,
  ren: number,
  renStrokeType: string;
  di: number,
  diStrokeType: string,
  zong: number,
  zongStrokeType: string,
  wai: number,
  waiStrokeType: string,
  sancai: string,
}

export function queryWugeConfig(name: string): WugeConfig {
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
  }
}
