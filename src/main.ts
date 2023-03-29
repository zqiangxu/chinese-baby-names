import fs from 'fs';
import { PoetryType } from './enums/PoetryType';
import { Name } from './name/name';
import { NameGenerator } from './name/NameGenerator';
import { getStrokeList } from './wuge';

const DEFAULT_MIN_STROKE_COUNT = 3;
const DEFAULT_MAX_STROKE_COUNT = 30;
const DEFAULT_ALLOW_GENERAL = false;
const DEFAULT_NAME_VALIDATE = false;
const DEFAULT_CALCULATE_THREE_TALENTS_AND_FIVE_SQUARES = false;
const DEFAULT_GENERATOR_NAMES_COUNT = 1;

interface GeneratorConfig {
  source?: PoetryType;
  surname: string;
  dislikeWords?: string[];
  // 最小笔画数
  minStrokeCount?: number;
  // 最大笔画数
  maxStrokeCount?: number;
  // 允许使用中吉，开启后将生成包含中吉配置的名字，生成的名字会更多
  allowGeneral?: boolean;
  // 是否筛选名字，仅输出名字库中存在的名字，可以过滤明显不合适的名字
  nameValidate?: boolean;
  // 是否筛选性别，男/女，空则不筛选，仅当开启名字筛选时有效
  gender?: string;
  // 是否计算三才五格
  // @description 忽略命名
  calculateThreeTalentsAndFiveSquares?: boolean; 
  // 需要生成的条数. 默认为 1 条
  count?: number;
}

interface GeneratorResult {
  firstName?:string;
  lastName?:string;
  // 诗歌来源
  source?: string;
  // 匹配的名字在诗歌中的索引
  matched?: number[];
}

export class BabyName {
  private names: Name[];
  private config: GeneratorConfig;

  public static generate(config: GeneratorConfig): GeneratorResult[] {
    const instance = new BabyName(config);
    return instance.generate();
  }

  private constructor(config: GeneratorConfig) {
    console.error('generator');
    this.config = {
      dislikeWords: [],
      minStrokeCount: DEFAULT_MIN_STROKE_COUNT, 
      maxStrokeCount: DEFAULT_MAX_STROKE_COUNT, 
      allowGeneral: DEFAULT_ALLOW_GENERAL,
      nameValidate: DEFAULT_NAME_VALIDATE, 
      calculateThreeTalentsAndFiveSquares: DEFAULT_CALCULATE_THREE_TALENTS_AND_FIVE_SQUARES,
      count: DEFAULT_GENERATOR_NAMES_COUNT,
      ...config
    };
  }

  private generate(): GeneratorResult[] {
    const names: Name[] = [];
    const { source, nameValidate, surname, allowGeneral, minStrokeCount, maxStrokeCount, gender, count } = this.config;
    const strokes = getStrokeList(surname, allowGeneral);
    const nameList = NameGenerator.batch({
      source,
      strokes,
    }, count);

    for (let i of nameList) {
      if (
        i.stroke_number1 < minStrokeCount ||
        i.stroke_number1 > maxStrokeCount ||
        i.stroke_number2 < minStrokeCount ||
        i.stroke_number2 > maxStrokeCount
      ) {
        // 笔画数过滤
        continue;
      }
      if (nameValidate && gender !== '' && i.gender !== gender && i.gender !== '双' && i.gender !== '未知') {
        // 性别过滤
        continue;
      }
      if (this.containBadWord(i.first_name)) {
        // 不喜欢字过滤
        continue;
      }
      names.push(i);
    }

    console.log('>>输出结果...:', names);
    const stream = fs.createWriteStream('names.txt', { flags: 'a', encoding: 'utf-8' });
    for (let i of names) {
      stream.write(surname + i.toString() + '\n');
    }
    stream.end()
    console.log('>>输出完毕，请查看「names.txt」文件');;
    return [];
  }

  private containBadWord(first_name: string): boolean {
    const { dislikeWords } = this.config;
    if (!Array.isArray(dislikeWords)) {
      return false;
    }

    for (let word of first_name) {
      if (dislikeWords.includes(word)) {
        return true;
      }
    }
    return false;
  }
}
