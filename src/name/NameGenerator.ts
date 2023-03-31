import { isChinese } from '../utils/isChinese';
import { PoetryType } from '../enums/PoetryType';
import { Name, NameObject } from './name';
import { Database, DatabaseStorages, PoetCounter } from './database';
import { getStrokeNumber } from '../stroke/stroke';
import { numSequenceRandoms } from '../utils/numSequenceRandoms';
import { Gender } from '../enums/Gender';
import { shuffle } from 'src/utils/shuffle';
import { ChuciData, LunyuData, PoetAndCiData } from './types';

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
    return this.pickNames();
  }

  public oldBatch(): NameObject[] {
    const sourceList = shuffle(this.config.source);

    for (let i = 0; i < sourceList.length; i++) {
      const source = sourceList[i];
      switch (source) {
        case PoetryType.SHI_JING:
        case PoetryType.CHU_CI:
          Database.getJsonData<ChuciData>({
            locate: DatabaseStorages[source].locate,
            getSentences(item) {
              return item.content;
            },
            getTitle(item) {
              return `《楚辞》${item.title} (${item.author}))`;
            },
            callback: (sentence, title) => {
              return this.checkAndAddNames(sentence, title);
            },
          });
          break;
        case PoetryType.LUN_YU:
          Database.getJsonData<LunyuData>({
            locate: DatabaseStorages[source].locate,
            getSentences(item) {
              return item.paragraphs;
            },
            getTitle(item) {
              return `《论语》${item.chapter}))`;
            },
            callback: (sentence, title) => {
              return this.checkAndAddNames(sentence, title);
            },
          });
          break;
        case PoetryType.TANG_SHI:
        case PoetryType.SONG_SHI:
        case PoetryType.SONG_CI:
          const randoms = numSequenceRandoms(PoetCounter[source]);
          for (let i = 0; i < randoms.length; i += 1) {
            Database.getJsonData<PoetAndCiData>({
              locate: DatabaseStorages[source].locate.replace('{index}', String(randoms[i] * 1000)),
              getSentences(item) {
                return item.paragraphs;
              },
              getTitle(item) {
                return `《${item.rhythmic || item.title}》(${item.author})`;
              },
              callback: (sentence, title) => {
                return this.checkAndAddNames(sentence, title);
              },
            });
          }
          break;
        default:
          break;
      }
    }

    const names = this.names.map((name) => name.toObject());
    this.names = [];
    this.uniqueNameSet = new Set<string>();
    return names;
  }

  private pickNames(): NameObject[] {
    const names: NameObject[] = [];

    for (let i = 0; i < this.count; i++) {
      const index = Math.floor(Math.random() * Database.aiNames.length);
      const { name, gender } = Database.aiNames[index];
      names.push({
        name,
        sentence: '',
        gender,
        picks: [],
        title: '',
      });
    }

    return names;
  }

  private checkAndAddNames(sentence: string, title: string): boolean {
    const { config } = this;
    const { goodStrokeList } = config;

    const charStrokeMap: Map<number, number[]> = new Map<number, number[]>();

    // 先整理出所有的文字笔画的集合

    for (let index = 0; index < sentence.length; index++) {
      const char = sentence[index];
      if (isChinese(char)) {
        const stroke = getStrokeNumber(char);
        let arr = charStrokeMap.get(stroke);
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
          if (this.pushName(babyName, sentence, title, [index]) === false) {
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
      for (let i = 0; i < ming1IndexArray.length; i++) {
        for (let j = 0; j < ming2IndexArray.length; j++) {
          // 顺序不能改变
          if (ming1IndexArray[i] < ming2IndexArray[j]) {
            const babyName = sentence[ming1IndexArray[i]] + sentence[ming2IndexArray[j]];
            if (this.pushName(babyName, sentence, title, [ming1IndexArray[i], ming2IndexArray[j]]) === false) {
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
    for (let char of babyName.split('')) {
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

  private pushName(babyName: string, sentence: string, title: string, picks: number[]) {
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
    this.names.push(new Name(babyName, sentence, title, picks, gender));

    // 单名统计
    if (babyName.length === 1) {
      this.singleNameCount++;
    }
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
