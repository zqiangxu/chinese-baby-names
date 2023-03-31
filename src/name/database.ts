import * as fs from 'fs';
import * as path from 'path';
import { Gender } from '../enums/Gender';
import { PoetryType } from '../enums/PoetryType';
import { convertGender } from '../utils/gender';
import { shuffle } from '../utils/shuffle';

/**
 * 读取本地数据
 * @param name
 */
export function readLocalData(name: string): string[] {
  const resourcePath = path.join(__dirname, 'database', name);

  if (fs.statSync(resourcePath).isDirectory()) {
    return [];
  }

  if (!fs.existsSync(resourcePath)) {
    return [];
  }

  const content = fs.readFileSync(resourcePath, { encoding: 'utf-8' }).split(/\n/);
  return content;
}

export function readLocalJsonData(name: string): string[] {
  const resourcePath = path.join(__dirname, 'database', name);

  if (fs.statSync(resourcePath).isDirectory()) {
    return [];
  }

  if (!fs.existsSync(resourcePath)) {
    return [];
  }

  const content = fs.readFileSync(resourcePath, { encoding: 'utf-8' });
  return JSON.parse(content);
}

enum StorageType {
  JSON = 'json',
  TEXT = 'text',
  DAT = 'dat',
}

export const PoetCounter: Record<PoetryType.SONG_SHI | PoetryType.SONG_CI | PoetryType.TANG_SHI, number> = {
  [PoetryType.TANG_SHI]: 58,
  [PoetryType.SONG_SHI]: 255,
  [PoetryType.SONG_CI]: 21,
}

export const DatabaseStorages: Record<
  PoetryType,
  {
    type: StorageType;
    locate: string;
  }
> = {
  [PoetryType.SHI_JING]: {
    type: StorageType.JSON,
    locate: 'shijing/shijing',
  },
  [PoetryType.CHU_CI]: {
    type: StorageType.JSON,
    locate: 'chuci/chuci',
  },
  [PoetryType.LUN_YU]: {
    type: StorageType.JSON,
    locate: 'lunyu/lunyu',
  },
  [PoetryType.TANG_SHI]: {
    type: StorageType.JSON,
    locate: 'poet.tang/poet.tang.{index}',
  },
  [PoetryType.SONG_SHI]: {
    type: StorageType.JSON,
    locate: 'poet.song/poet.song.{index}',
  },
  [PoetryType.SONG_CI]: {
    type: StorageType.JSON,
    locate: 'ci.song/ci.song.{index}',
  },
};

interface GetJsonDataParams<T> {
  /**
   * json 文件路径
   */
  locate: string;
  /**
   * 获取诗句内容
   * @param item 
   */
  getSentences: (item: T) => string[];
  /**
   * 获取诗句来源
   * @param item 
   */
  getTitle: (item:T) => string;
  /**
   * 回调函数
   * @param sentence 单条 sentence
   * @param title 标题
   */
  callback: (sentence: string, title: string) => void | boolean 
}

export class Database {
  /**
   * 拆字字典
   */
  public static splitDirectory: Record<string, string[]> = Database.generateCharSplitDirectory();

  /**
   * 名字字典
   */  
  public static namesDirectory: Record<string, Gender> = Database.generateNamesDirectory();

  /**
   * 笔画字典
   */
  public static strokeDirectory: Record<string, number> = Database.generateStrokeDirectory();

  public static getJsonData<T>({ locate, getSentences, getTitle, callback }: GetJsonDataParams<T>): void {
    const data = require(`./database/${locate}.json`);
    for (const item of shuffle<T>(data))  {
      const sentences = getSentences(item);
      const title = getTitle(item);
      for (const content of shuffle<string>(sentences)) {
        // 转繁体 (不用转繁体了, 直接已经批量转换)
        // const string = simplifiedToTraditional(content);
        const isContinue = callback(content.trim(), title);
        if (isContinue === false) {
          return;
        }
      }
    };
  }

  private static generateStrokeDirectory(): Record<string, number> {
    const stokes = readLocalData('stroke.dat');
    const directory: Record<string, number> = {};
    stokes.forEach((stoke) => {
      const [, name, count] = stoke.split('|');
      directory[name] = parseInt(count);
    });
    return directory;
  }

  private static generateCharSplitDirectory(): Record<string, string[]> {
   const lines = readLocalData('char-split.dat');
   const directory: Record<string, string[]> = {};

   lines.forEach((line) => {
      const blocks = line.split(/s/);
      if (blocks.length < 2) {
         return;
      }
      const [, name, ...sub] = blocks;
      directory[name] = sub;
   });

   return directory;
  }

  private static generateNamesDirectory(): Record<string, Gender> {
    const lines = readLocalData('names.dat');
    const directory: Record<string, Gender> = {};
 
    lines.forEach((line) => {
       const blocks = line.split(/,/);
       if (blocks.length < 2) {
          return;
       }
       const [name, gender] = blocks;

       // 只留名
       directory[name.trim().substring(1)] = convertGender(gender);
    });
 
    return directory; 
  }
}
