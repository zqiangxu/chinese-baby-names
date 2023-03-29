import { isChinese } from '../utils/isChinese';
import { PoetryType } from '../enums/PoetryType';
import { Name } from './name';
import { Database, DatabaseStorages, PoetCounter } from '../utils/database';
import { getStrokeNumber } from '../stroke/stroke';

/**
 * Generator
 * @param source
 * @param strokes
 * @returns
 */
interface GeneratorConfig {
  source: PoetryType;
  strokes: number[][];
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

  private batch(): Name[] {
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

    return names;
  }

  private checkAndAddNames(names: Name[], sentences: string[]): boolean {
    const { count, config } = this;
    const { strokes: stroke_list } = config;
    for (const sentence of sentences) {
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
            if (names.length >= count) {
              return false;
            }
          }
        }
      }
    }
  }
}
