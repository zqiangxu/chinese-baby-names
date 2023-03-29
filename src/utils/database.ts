import * as fs from 'fs';
import * as path from 'path';
import { PoetryType } from '../enums/PoetryType';
import { simplifiedToTraditional } from './convert';

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
  [PoetryType.DEFAULT]: {
    type: StorageType.DAT,
    locate: 'names',
  },
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
  [PoetryType.ZHOU_YI]: {
    type: StorageType.TEXT,
    locate: 'zhouyi/zhouyi',
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

export class Database {
  public static getJsonData(locate: string, contentKey: string, callback: (sentences: string[]) => void | boolean): void {
    const data = require(`./database/${locate}.json`);
    for (const item of data)  {
      for (const content of item[contentKey]) {
        // 转繁体
        const string = simplifiedToTraditional(content);
        const sentences = string.split(/[！？，。,.?!\n]/);
        const isContinue = callback(sentences);
        if (isContinue === false) {
          return;
        }
      }
    };
  }

  public static getTextData(locate: string, callback: (sentences: string[]) => void | boolean): void {
    const lines = readLocalData(`${locate}.txt`);
    for(const line of lines) {
      const startTime = Date.now();
      const string = simplifiedToTraditional(line);
      console.error('cost:', Date.now() - startTime + 'ms');
      const sentences = string.split(/[！？，。,.?!\n]/);
      const isContinue = callback(sentences);
      if (isContinue === false) {
         return;
      }
    };
  }

  public static getStrokeDirectory(): Record<string, number> {
    const stokes = readLocalData('stroke.dat');
    const directory = {};
    stokes.forEach((stoke) => {
      const [, name, count] = stoke.split('|');
      directory[name] = parseInt(count);
    });
    return directory;
  }

  public static getCharSplitDirectory(): Record<string, string[]> {
   const lines = readLocalData('char-split.dat');
   const directory = {};

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
}
