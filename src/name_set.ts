import * as fs from 'fs';
import { Name } from './name';
import { get_stroke_number } from './stroke_number';
import { simplifiedToTraditional, traditionalToSimplified } from './utils/convert';
import { readLocalData } from './utils/database';

// 简体转繁体
// 繁体转简体

export function get_source(source: number, validate: boolean, stroke_list: any[]): Name[] {
  const exist_name: { [key: string]: string } = {};
  if (validate) {
    // console.log('>>加载名字库...');
    // get_name_valid('names', exist_name);
  }
  let names: Name[] = [];
  // 默认
  if (source === 0) {
    get_name_dat('names', names, stroke_list);
  }
  // 诗经
  // else if (source === 1) {
  //   console.log('>>加载诗经...');
  //   get_name_json('诗经', names, 'content', stroke_list);
  // }
  // 楚辞
  // else if (source === 2) {
  //   console.log('>>加载楚辞...');
  //   get_name_txt('楚辞', names, stroke_list);
  // }
  // // 论语
  // else if (source === 3) {
  //   console.log('>>加载论语...');
  //   get_name_json('论语', names, 'paragraphs', stroke_list);
  // }
  // // 周易
  // else if (source === 4) {
  //   console.log('>>加载周易...');
  //   get_name_txt('周易', names, stroke_list);
  // }
  // 唐诗
  else if (source === 5) {
    console.log('>>加载唐诗...');
    for (let i = 0; i < 58000; i += 1000) {
      get_name_json('poet.tang/poet.tang.' + i, names, 'paragraphs', stroke_list);
    }
  }
  // 宋诗
  else if (source === 6) {
    console.log('>>加载宋诗...');
    for (let i = 0; i < 255000; i += 1000) {
      get_name_json('poet.song/poet.song.' + i, names, 'paragraphs', stroke_list);
    }
  }
  // 宋词
  else if (source === 7) {
    console.log('>>加载宋词...');
    for (let i = 0; i < 22000; i += 1000) {
      get_name_json('ci.song/ci.song.' + i, names, 'paragraphs', stroke_list);
    }
  } else {
    console.log('词库号输入错误');
  }

  console.log('>>筛选名字...');
  // 检查名字是否存在并添加性别
  if (validate) {
    if (source !== 0) {
      names = get_intersect(names, exist_name);
    }
  }

  return names;
}

export function get_intersect(names: Name[], exist_name: { [key: string]: string }): Name[] {
  const result: Name[] = [];
  for (const i of names) {
    if (i.first_name in exist_name) {
      i.gender = exist_name[i.first_name];
      result.push(i);
    }
  }
  return result;
}

// 加载名字库
export function get_name_valid(filePath: string, exist_names: { [key: string]: string }): void {
  const f = readLocalData(`${filePath}.dat`);
  f.forEach((line: string) => {
    const data = line.split(',');
    const name = data[0][1];
    let gender = data[1].replace('\n', '');
    if (name in exist_names) {
      if (gender !== exist_names[name] || gender === '未知') {
        exist_names[name] = '双';
      }
    } else {
      exist_names[name] = gender;
    }
  });
}

export function get_name_dat(path: string, names: Name[], stroke_list: any[]): void {
  const line_list = readLocalData(`${path}.dat`);
  const size = line_list.length;
  let progress = 0;
  for (let i = 0; i < size; i++) {
    // 生成进度
    if (((i + 1) * 100) / size - progress >= 5) {
      progress += 5;
      console.log('>>正在生成名字...' + progress + '%');
    }
    const data = line_list[i].split(',');
    let name = '';
    if (data[0].length === 2) {
      name = data[0];
    } else {
      name = data[0][1];
    }
    // 转繁体
    name = simplifiedToTraditional(name);
    const gender = data[1].replace('\n', '');
    if (name.length === 2) {
      // 转换笔画数
      const strokes: number[] = [];
      strokes.push(get_stroke_number(name[0]));
      strokes.push(get_stroke_number(name[1]));
      // 判断是否包含指定笔画数
      for (const stroke of stroke_list) {
        if (stroke[0] === strokes[0] && stroke[1] === strokes[1]) {
          names.push(new Name(name, '', gender));
        }
      }
    }
  }
}

let count = 0;
export function get_name_json(path: string, names: Name[], key: string, stroke_list: any[]): void {
  const data = require('./database/' + path + '.json');
  console.error(key);
  const size = data.length;
  let progress = 0;
  // const data = JSON.parse(f);
  for (let index = 0; index < size; index++) {
    const item = data[index];
    if ((index + 1) * 100 / size - progress >= 10) {
      progress += 10;
      console.log('>>正在生成名字...' + progress + '%');
    }
    for (const content of item[key]) {
      const startTime = Date.now();

      // 转繁体
      const string = simplifiedToTraditional(content);
      const string_list = string.split(/[！|？|，|。|,|.|?|!|\n]/);

      // console.error(`${Date.now() - startTime}ms`, string_list);
      check_and_add_names(names, string_list, stroke_list);
      console.error('names:', names);
      if (names.length >= 20) {
        return;
      }
    }
  }
}

export function get_name_txt(path: string, names: Name[], stroke_list: any[]): void {
  const f = require('database/' + path + '.txt');
  const re_chinese = /[\u4e00-\u9fa5]/g;
  const match = f.match(re_chinese);
  if (match) {
    for (let i = 0; i < match.length; i += 2) {
      let name = match[i];
      if (i + 1 < match.length) {
        name += match[i + 1];
      }
      // 转繁体
      name = simplifiedToTraditional(name);
      if (name.length === 2) {
        // 转换笔画数
        const strokes: number[] = [];
        strokes.push(get_stroke_number(name[0]));
        strokes.push(get_stroke_number(name[1]));
        // 判断是否包含指定笔画数
        for (const stroke of stroke_list) {
          if (stroke[0] === strokes[0] && stroke[1] === strokes[1]) {
            names.push(new Name(name, '', ''));
          }
        }
      }
    }
  }
}



export function check_and_add_names(names: Name[], string_list: string[], stroke_list: [number, number][]): void {
  for (const sentence of string_list) {
    let sentenceStr = sentence.trim();
    // 转换笔画数
    const strokes: number[] = [];
    for (const ch of sentenceStr) {
      if (is_chinese(ch)) {
        strokes.push(get_stroke_number(ch));
      } else {
        strokes.push(0);
      }
    }
    console.error(strokes);
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
export function is_chinese(uchar: string): boolean {
  if ('\u4e00' <= uchar && uchar <= '\u9fa5') {
    return true;
  } else {
    return false;
  }
}

export function check_resource(name: string): void {
  if (name.length !== 3) {
    return;
  }
  console.log('正在生成名字来源...\n');
  check_name_json('诗经', name, 'content');
  check_name_txt('楚辞', name);
  check_name_json('论语', name, 'paragraphs');
  check_name_txt('周易', name);
  for (let i = 0; i < 58000; i += 1000) {
    check_name_json(`唐诗/poet.tang.${i}`, name, 'paragraphs');
  }
  for (let i = 0; i < 255000; i += 1000) {
    check_name_json(`宋诗/poet.song.${i}`, name, 'paragraphs');
  }
  for (let i = 0; i < 22000; i += 1000) {
    check_name_json(`宋词/ci.song.${i}`, name, 'paragraphs');
  }
}

function check_name_json(path: string, name: string, column: string): void {
  const fileData = fs.readFileSync(`database/${path}.json`, 'utf-8');
  const data = JSON.parse(fileData);
  const size = data.length;
  for (let i = 0; i < size; i++) {
    const poem = data[i];
    for (const string of poem[column]) {
      const stringList = string.split(/[！？，。,.?! \n]/);
      let title = path;
      if (path === '诗经') {
        title = `诗经 ${poem['title']} ${poem['chapter']} ${poem['section']}`;
      } else if (path === '论语') {
        title = `论语 ${poem['chapter']}`;
      } else if (path.startsWith('唐诗')) {
        title = `唐诗 ${poem['title']} ${poem['author']}`;
      } else if (path.startsWith('宋诗')) {
        title = `宋诗 ${poem['title']} ${poem['author']}`;
      } else if (path.startsWith('宋词')) {
        title = `宋词 ${poem['rhythmic']} ${poem['author']}`;
      }
      check_name_resource(title, name, stringList);
    }
  }
}

export function check_name_txt(path: string, name: string): void {
  const fileData = fs.readFileSync(`database/${path}.txt`, 'utf-8');
  const lineList = fileData.split('\n');
  const size = lineList.length;
  for (let i = 0; i < size; i++) {
    if (!/\w/.test(lineList[i])) {
      continue;
    }
    const stringList = lineList[i].split(/[！？，。,.?! \n]/);
    check_name_resource(path, name, stringList);
  }
}

export function check_name_resource(title: string, name: string, stringList: string[]): void {
  for (let sentence of stringList) {
    if (title.startsWith('唐诗') || title.startsWith('宋诗')) {
      // 转简体
      title = traditionalToSimplified(title);
      sentence = traditionalToSimplified(sentence);
    }
    if (sentence.includes(name[1]) && sentence.includes(name[2])) {
      const index0 = sentence.indexOf(name[1]);
      const index1 = sentence.indexOf(name[2]);
      if (index0 < index1) {
        console.log(title);
        console.log(sentence.trim().replace(name[1], `「${name[1]}」`).replace(name[2], `「${name[2]}」`) + '\n');
      }
    }
  }
}
