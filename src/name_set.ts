import { PoetryType } from './enums/PoetryType';
import { Name } from './name';
import { getStrokeNumber } from './utils/stoke';
import { Database, DatabaseStorages, PoetCounter } from './utils/database';

export function get_source(source: PoetryType, stroke_list: any[]): Name[] {
  let names: Name[] = [];

  switch (source) {
    case PoetryType.SHI_JING:
    case PoetryType.CHU_CI:
      Database.getJsonData(DatabaseStorages[source].locate, 'content', (contents) => {
        checkAndAddNames(names, contents, stroke_list);
      });
      break;
    case PoetryType.LUN_YU:
      Database.getJsonData(DatabaseStorages[source].locate, 'paragraphs', (contents) => {
        checkAndAddNames(names, contents, stroke_list);
      });
      break;
    case PoetryType.ZHOU_YI:
      Database.getTextData(DatabaseStorages[source].locate, (contents) => {
        checkAndAddNames(names, contents, stroke_list);
        if (names.length >= 20) {
          return false;
        }
      });
      break;
    case PoetryType.TANG_SHI:
    case PoetryType.SONG_SHI:
    case PoetryType.SONG_CI:
      for (let i = 0; i < PoetCounter[source]; i += 1) {
        Database.getJsonData(DatabaseStorages[source].locate.replace('{index}', String(i * 1000)), 'paragraphs', (contents) => {
          checkAndAddNames(names, contents, stroke_list);
          if (names.length > 10) {
            return false;
          }
        });
      }
      break;
    default:
      break;
  }

  return names;
}

export function checkAndAddNames(names: Name[], string_list: string[], stroke_list: [number, number][]): void {
  for (const sentence of string_list) {
    let sentenceStr = sentence.trim();
    // 转换笔画数
    const strokes: number[] = [];
    for (const ch of sentenceStr) {
      if (isChinese(ch)) {
        strokes.push(getStrokeNumber(ch));
      } else {
        strokes.push(0);
      }
    }

    // 判断是否包含指定笔画数
    for (const stroke of stroke_list) {
      if (strokes.includes(stroke[0]) && strokes.includes(stroke[1])) {
        const index0 = strokes.indexOf(stroke[0]);
        const index1 = strokes.indexOf(stroke[1]);
        if (index0 < index1) {
          const name0 = sentenceStr[index0];
          const name1 = sentenceStr[index1];
          console.error('name:0', name0, 'name1:', name1);
          names.push(new Name(name0 + name1, sentenceStr, ''));
        }
      }
    }
  }
}

// 判断是否为汉字
export function isChinese(uchar: string): boolean {
  if ('\u4e00' <= uchar && uchar <= '\u9fa5') {
    return true;
  } else {
    return false;
  }
}
