import opencc from 'node-opencc';

/**
 * 简体转繁体 
 * @param text 
 * @example
 * opencc.simplifiedToTraditional('中国') === "中國"
 * opencc.simplifiedToTraditional('落霞与孤鹜齐飞, 秋水共长天一色') === "落霞與孤鶩齊飛, 秋水共長天一色"
 * @description 
 * 基于 @see {@link https://github.com/compulim/node-opencc} 本质还是基于 `opencc` { @link https://github.com/byvoid/opencc }，
 * 但是 `opencc` 安装比较麻烦，所以这里直接使用 `node-opencc` 实现。
 */
export function simplifiedToTraditional(text: string) {
    return opencc.simplifiedToTraditional(text);
}

/**
 * 繁体转简体
 * @param text
 */
export function traditionalToSimplified(text: string) {
    return opencc.traditionalToSimplified(text);
}