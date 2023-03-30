import { WUXING_BADS, WUXING_GENERALS, WUXING_GOODS } from './constant';
import { getWuxing } from './wuxing';

/**
 * 检查三才配置吉
 * @param counts 天地人 三才数值
 * @param allowGeneral 是否允许中吉
 */
export function checkSancaiGood(counts: number[], allowGeneral: boolean): boolean {
  const config = getSancaiConfig(counts);

  if (WUXING_GOODS.includes(config)) {
    return true;
  } else if (allowGeneral && WUXING_GENERALS.includes(config)) {
    return true;
  }

  return false;
}

/**
 * 获取三才配置
 * @param counts 天地人 三才数值
 * 对应的就是 转成 金木水 这种
 */
export function getSancaiConfig(counts: number[]): string {
  let config = '';
  for (const count of counts) {
    config += getWuxing(count);
  }
  return config;
}

/**
 * 获取三才类型
 * @param config
 */
export function getSancaiType(config: string): string {
  if (WUXING_GOODS.includes(config)) {
    return '大吉';
  } else if (WUXING_GENERALS.includes(config)) {
    return '中吉';
  } else if (WUXING_BADS.includes(config)) {
    return '凶';
  } else {
    return '';
  }
}
