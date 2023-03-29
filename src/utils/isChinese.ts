export function isChinese(char: string): boolean {
  if ('\u4e00' <= char && char <= '\u9fa5') {
    return true;
  } else {
    return false;
  }
}
