import { isChinese } from '../utils/isChinese';
import { PoetryType } from '../enums/PoetryType';
import { Name, NameObject } from './name';
import { Database, DatabaseStorages, PoetCounter } from '../utils/database';
import { getStrokeNumber } from '../stroke/stroke';
import { numSequenceRandoms } from '../utils/numSequenceRandoms';
import { Gender } from '../enums/Gender';
import { shuffle } from 'src/utils/shuffle';

interface GeneratorConfig {
  // 姓
  surname: string;
  source: PoetryType[];
  goodStrokeList: number[][];
  // 最小笔画数
  minStrokeCount: number;
  // 最大笔画数
  maxStrokeCount: number;
  // 过滤掉不喜欢的名字
  dislikeWords: string[];
  singleNameWeight: number;
  gender: Gender;
}

export class NameGenerator {
  private config: GeneratorConfig;

  private count: number;

  private names: Name[];

  private singleNameCount: number;

  private uniqueNameSet: Set<string>;

  public static batch(config: GeneratorConfig, count?: number) {
    const instance = new NameGenerator(config, count);
    return instance.batch();
  }

  private constructor(config: GeneratorConfig, count?: number) {
    this.config = config;
    this.count = count;
    this.names = [];
    this.uniqueNameSet = new Set<string>();
    this.singleNameCount = 0;
  }

  private batch(): NameObject[] {
    const sourceList = shuffle(this.config.source);

    for (let i=0; i<sourceList.length; i++) {
      const source = sourceList[i];
      switch (source) {
        case PoetryType.SHI_JING:
        case PoetryType.CHU_CI:
          Database.getJsonData(DatabaseStorages[source].locate, 'content', (sentence) => {
            return this.checkAndAddNames(sentence);
          });
          break;
        case PoetryType.LUN_YU:
          Database.getJsonData(DatabaseStorages[source].locate, 'paragraphs', (sentence) => {
            return this.checkAndAddNames(sentence);
          });
          break;
        case PoetryType.ZHOU_YI:
          Database.getTextData(DatabaseStorages[source].locate, (sentence) => {
            return this.checkAndAddNames(sentence);
          });
          break;
        case PoetryType.TANG_SHI:
        case PoetryType.SONG_SHI:
        case PoetryType.SONG_CI:
          const randoms = numSequenceRandoms(PoetCounter[source]);
          console.error('randoms:', randoms);
          for (let i = 0; i < randoms.length; i += 1) {
            Database.getJsonData(DatabaseStorages[source].locate.replace('{index}', String(randoms[i] * 1000)), 'paragraphs', (sentence) => {
              return this.checkAndAddNames(sentence);
            });
          }
          break;
        default:
          break;
      }
    }

    const names = this.names.map(name => name.toObject());
    this.names = [];
    this.uniqueNameSet = new Set<string>();
    return names;
  }

  private checkAndAddNames(sentence: string): boolean {
    const { config } = this;
    const { goodStrokeList } = config;

    const charStrokeMap: Map<number, number[]> = new Map<number, number[]>();

    // 先整理出所有的文字笔画的集合

    for(let index = 0; index<sentence.length; index++) {
      const char = sentence[index];
      if (isChinese(char)) {
        const stroke = getStrokeNumber(char);
        let arr = charStrokeMap.get(stroke) ;
        charStrokeMap.set(stroke, Array.isArray(arr) ? [...arr, index] : [index]);
      }
    }

    // 获取满足条件(吉利)的笔画数
    for (const goodStroke of goodStrokeList) {
      
      // 如果没有存在第一个名的笔画. 直接进行下一次循环
      let ming1IndexArray = charStrokeMap.get(goodStroke[0]);
      if (!ming1IndexArray || ming1IndexArray.length === 0) {
        continue;
      }

      ming1IndexArray = ming1IndexArray.sort((a, b) => a - b);

      // 单名
      if (goodStroke[1] === 0) {
        for (const index of ming1IndexArray) {
          const babyName = sentence[index];
          if (this.pushName(babyName, sentence, [index]) === false) {
            return false;
          }
        }
        continue;
      }

      // 复名
      let ming2IndexArray = charStrokeMap.get(goodStroke[1]);
      if (!ming2IndexArray || ming2IndexArray.length === 0) {
        continue;
      }

      ming2IndexArray = ming2IndexArray.sort((a, b) => a - b);
      for (let i = 0; i<ming1IndexArray.length; i++) {
        for (let j = 0; j<ming2IndexArray.length; j++) {

          // 顺序不能改变
          if (ming1IndexArray[i] < ming2IndexArray[j]) {
            const babyName = sentence[ming1IndexArray[i]] + sentence[ming2IndexArray[j]];
            if (this.pushName(babyName, sentence, [ming1IndexArray[i], ming2IndexArray[j]]) === false) {
              return false;
            }
          }
          continue;
        }
      }
    }
  }

  private checkName(babyName: string): boolean {
    const { config } = this;
    const { minStrokeCount, maxStrokeCount, singleNameWeight } = config;

    // 单名的权重
    if (babyName.length === 1) {
      if ((this.singleNameCount / this.uniqueNameSet.size) * 100 > singleNameWeight) {
        return false;
      }
    }

    // 不能跟自己的姓相同
    if (config.surname === babyName) {
      return false;
    }

    // 过滤掉笔画
    for( let char of babyName.split('')) {
      const stroke = getStrokeNumber(char);
      if (stroke < minStrokeCount || stroke > maxStrokeCount) {
        return false;
      }
    }

    // 过滤掉黑名单数据
    if (this.containBadWord(babyName)) {
      return false;
    }

    return true;
  }

  private pushName(babyName: string, sentence: string, picks: number[]) {
    const { count, config } = this;

    // 超出生成的数量限制
    if (this.names.length >= count) {
      return false;
    }
  
    const status = this.checkName(babyName);
    if (!status) {
      return;
    }

    const gender = Database.namesDirectory[babyName];
    if (!gender) {
      return;
    }

    if (config.gender === Gender.GIRL || config.gender === Gender.BOY) {
      if (gender !== config.gender) {
        return;
      }
    }

    if (this.uniqueNameSet.has(babyName)) {
      return;
    }

    this.uniqueNameSet.add(babyName);
    this.names.push(new Name(babyName, sentence, picks, gender));

    // 单名统计
    if (babyName.length === 1) {
      this.singleNameCount++;
    }

    console.error('this.names:', this.names);
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
