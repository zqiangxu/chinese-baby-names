import { readLocalData } from './utils/database';
const stroke_dic: { [key: string]: number } = {};

// 笔画
const data1 = readLocalData('stoke.dat');
for (let string of data1) {
  const temp = string.split('|');
  if (temp[2]) {
    temp[2] = temp[2].replace('n', '');
    stroke_dic[temp[1]] = parseInt(temp[2]);
  }
}

const split_dic: { [key: string]: string[] } = {};

// 拆字. split_dic
const data2 = readLocalData('chaizi.dat');
for (let string of data2) {
  const temp = string.split(/s/);
  if (temp.length < 2) {
    continue;
  }
  const split_list: string[] = [];
  for (let index = 1; index < temp.length - 1; index++) {
    split_list.push(temp[index]);
  }
  split_dic[temp[0]] = split_list;
}

export function get_stroke_number(word: string): number {
  let total = 0;
  for (let i of word) {
    if (i.includes('一')) {
      total += 1;
    } else if (i.includes('二')) {
      total += 2;
    } else if (i.includes('三')) {
      total += 3;
    } else if (i.includes('四')) {
      total += 4;
    } else if (i.includes('五')) {
      total += 5;
    } else if (i.includes('六')) {
      total += 6;
    } else if (i.includes('七')) {
      total += 7;
    } else if (i.includes('八')) {
      total += 8;
    } else if (i.includes('九')) {
      total += 9;
    } else if (i.includes('十')) {
      total += 10;
    } else {
      total += stroke_dic[i];
    }
  }
  return get_final_number(word, total);
}


function get_final_number(word: string, number: number): number {
  for (let i of word) {
    if (i in split_dic) {
      const splits = split_dic[i];
      if (splits.includes('氵')) {
        // 水
        number += 1;
      }
      if (splits.includes('扌')) {
        // 手
        number += 1;
      }
      if (splits[0] === '月') {
        // 肉
        number += 2;
      }
      if (splits.includes('艹')) {
        // 艸
        number += 3;
      }
      if (splits.includes('辶')) {
        // 辵
        number += 4;
      }
      if (splits[0] === '阜') {
        // 左阝 阜
        number += 6;
      }
      if (splits.includes('邑') && splits.includes('阝')) {
        // 右阝 邑
        number += 5;
      }
      if (splits[0] === '玉') {
        // 王字旁 玉
        number += 1;
      }
      if (splits[0] === '示') {
        // 礻 示
        number += 1;
      }
      if (splits[0] === '衣') {
        // 衤 衣
        number += 1;
      }
      if (splits[0] === '犭') {
        // 犭 犬
        number += 1;
      }
      if (splits[0] === '心') {
        // 忄 心
        number += 1;
      }
    }
  }
  return number;
}
