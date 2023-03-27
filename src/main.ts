import {
  name_source,
  last_name,
  dislike_words,
  min_stroke_count,
  max_stroke_count,
  allow_general,
  name_validate,
  gender,
  check_name,
  check_name_resource,
} from './config';
import { Name } from './name';
import { check_resource, get_source } from './name_set';
import { check_wuge_config, get_stroke_list } from './wuge';

function contain_bad_word(first_name: string): boolean {
  for (let word of first_name) {
    if (dislike_words.includes(word)) {
      return true;
    }
  }
  return false;
}

if (check_name.length === 3) {
  // 查看姓名配置
  check_wuge_config(check_name);
  if (check_name_resource) {
    check_resource(check_name);
  }
  console.log('>>输出完毕');
} else {
  // 起名
  const names: Name[] = [];
  const fs = require('fs');
  const stream = fs.createWriteStream('names.txt', { flags: 'a', encoding: 'utf-8' });
  for (let i of get_source(name_source, name_validate, get_stroke_list(last_name, allow_general))) {
    if (
      i.stroke_number1 < min_stroke_count ||
      i.stroke_number1 > max_stroke_count ||
      i.stroke_number2 < min_stroke_count ||
      i.stroke_number2 > max_stroke_count
    ) {
      // 笔画数过滤
      continue;
    }
    if (name_validate && gender !== '' && i.gender !== gender && i.gender !== '双' && i.gender !== '未知') {
      // 性别过滤
      continue;
    }
    if (contain_bad_word(i.first_name)) {
      // 不喜欢字过滤
      continue;
    }
    names.push(i);
  }
  console.log('>>输出结果...');
  names.sort();
  for (let i of names) {
    stream.write(last_name + i.toString() + 'n');
  }
  stream.end();
  console.log('>>输出完毕，请查看「names.txt」文件');
}
