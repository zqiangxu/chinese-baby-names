import { isChinese } from '../utils/isChinese';
import { PoetryType } from '../enums/PoetryType';
import { Name, NameObject } from './name';
import { Database, DatabaseStorages, PoetCounter } from '../utils/database';
import { getStrokeNumber } from '../stroke/stroke';

interface GeneratorConfig {
  source: PoetryType;
  goodStrokeList: number[][];
  // 最小笔画数
  minStrokeCount: number;
  // 最大笔画数
  maxStrokeCount: number;
  // 过滤掉不喜欢的名字
  dislikeWords: string[];
}

export class NameGenerator {
  private config: GeneratorConfig;

  private count: number;

  public static batch(config: GeneratorConfig, count?: number) {
    const instance = new NameGenerator(config, count);
    return instance.batch();
  }

  private constructor(config: GeneratorConfig, count?: number) {
    this.config = config;
    this.count = count;
  }

  private batch(): NameObject[] {
    let names: Name[] = [];

    const { source } = this.config;
    switch (source) {
      case PoetryType.SHI_JING:
      case PoetryType.CHU_CI:
        Database.getJsonData(DatabaseStorages[source].locate, 'content', (sentences) => {
          return this.checkAndAddNames(names, sentences);
        });
        break;
      case PoetryType.LUN_YU:
        Database.getJsonData(DatabaseStorages[source].locate, 'paragraphs', (sentences) => {
          return this.checkAndAddNames(names, sentences);
        });
        break;
      case PoetryType.ZHOU_YI:
        Database.getTextData(DatabaseStorages[source].locate, (sentences) => {
          return this.checkAndAddNames(names, sentences);
        });
        break;
      case PoetryType.TANG_SHI:
      case PoetryType.SONG_SHI:
      case PoetryType.SONG_CI:
        for (let i = 0; i < PoetCounter[source]; i += 1) {
          Database.getJsonData(DatabaseStorages[source].locate.replace('{index}', String(i * 1000)), 'paragraphs', (sentences) => {
            return this.checkAndAddNames(names, sentences);
          });
        }
        break;
      default:
        break;
    }

    return names.map(name => name.toObject());
  }

  private checkAndAddNames(names: Name[], sentences: string[]): boolean {
    const { count, config } = this;
    const { goodStrokeList } = config;
    for (const sentence of sentences) {
      let sentenceStr = sentence.trim();

      // 获取每个单词的笔画数
      const strokes: number[] = [];
      for (const ch of sentenceStr) {
        if (isChinese(ch)) {
          strokes.push(getStrokeNumber(ch));
        } else {
          strokes.push(0);
        }
      }

      // 获取满足条件(吉利)的笔画数
      for (const stroke of goodStrokeList) {
        if (strokes.includes(stroke[0]) && strokes.includes(stroke[1])) {
          const index0 = strokes.indexOf(stroke[0]);
          const index1 = strokes.indexOf(stroke[1]);

          if (index0 < index1) {
            const name0 = sentenceStr[index0];
            const name1 = sentenceStr[index1];

            console.error(name0 + name1);
            if (this.isBadName(name0 + name1)) {
              console.error('isBad?:', name0 + name1);
              return;
            }


            // 取出这两个字
            names.push(new Name(name0 + name1, sentenceStr, [index0, index1]));

            // 超出数量
            if (names.length >= count) {
              return false;
            }
          }
        }
      }
    }
  }

  private isBadName(name: string): boolean {
    const { config } = this;
    const { minStrokeCount, maxStrokeCount } = config;

    for( let char of name.split('')) {
      const stroke = getStrokeNumber(char);
      if (stroke < minStrokeCount || stroke > maxStrokeCount) {
        return true;
      }
    }

    if (this.containBadWord(name)) {
      return true;
    }

    return false;
  }

  private containBadWord(name: string): boolean {
    const { dislikeWords } = this.config;
    if (!Array.isArray(dislikeWords)) {
      return false;
    }

    for (let char of name) {
      if (dislikeWords.includes(char)) {
        return true;
      }
    }
    return false;
  }
}
