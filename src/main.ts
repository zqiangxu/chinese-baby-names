import { Gender } from './enums/Gender';
import { PoetryType } from './enums/PoetryType';
import { NameObject } from './name/name';
import { NameGenerator } from './name/NameGenerator';
import { getGoodStrokeList } from './stroke/stroke';

const DEFAULT_MIN_STROKE_COUNT = 3;
const DEFAULT_MAX_STROKE_COUNT = 30;
const DEFAULT_ALLOW_GENERAL = false;
const DEFAULT_GENERATOR_NAMES_COUNT = 1;
const DEFAULT_SINGLE_NAME_WEIGHT = 10;

interface GeneratorConfig {
  source?: PoetryType[];
  surname: string;
  dislikeWords?: string[];
  // 最小笔画数
  minStrokeCount?: number;
  // 最大笔画数
  maxStrokeCount?: number;
  // 允许使用中吉，开启后将生成包含中吉配置的名字，生成的名字会更多
  allowGeneral?: boolean;
  // 是否筛选性别，男/女，空则不筛选，仅当开启名字筛选时有效
  gender?: Gender;
  // 需要生成的条数. 默认为 1 条
  count?: number;
  // 单名的权重. 百分比
  singleNameWeight: number;
}

export class BabyName {
  private config: GeneratorConfig;

  public static generate(config: GeneratorConfig): NameObject[] {
    const instance = new BabyName(config);
    return instance.generate();
  }

  private constructor(config: GeneratorConfig) {
    this.config = {
      dislikeWords: [],
      minStrokeCount: DEFAULT_MIN_STROKE_COUNT, 
      maxStrokeCount: DEFAULT_MAX_STROKE_COUNT, 
      allowGeneral: DEFAULT_ALLOW_GENERAL,
      count: DEFAULT_GENERATOR_NAMES_COUNT,
      singleNameWeight: DEFAULT_SINGLE_NAME_WEIGHT,
      ...config
    };
  }

  private generate(): NameObject[] {
    const { source, surname, allowGeneral, minStrokeCount, maxStrokeCount, dislikeWords, count, singleNameWeight, gender } = this.config;
    const goodStrokeList = getGoodStrokeList(surname, allowGeneral);
    const names = NameGenerator.batch({
      surname,
      source,
      goodStrokeList,
      minStrokeCount,
      maxStrokeCount,
      dislikeWords,
      singleNameWeight,
      gender,
    }, count);

    return names;
  }
}
