const opencc = require('node-opencc');

const str = opencc.simplifiedToTraditional('中国');
console.log(str === "中國");

const string = opencc.simplifiedToTraditional('落霞与孤鹜齐飞, 秋水共长天一色');
console.log(string === "落霞與孤鶩齊飛, 秋水共長天一色");