const opencc = require('node-opencc');
const fs = require('fs');
const path = require('path');

function simplifiedToTraditional(resourcePath) {
  const content = fs.readFileSync(resourcePath, { encoding: 'utf-8' }).split(/\n/);
  const lines = [];
  let index = 0;

  console.log('total:', content.length);
  for (const line of content) {
    lines.push(opencc.simplifiedToTraditional(line));
    if (++index % 50 === 0) {
      console.log('progress:', ((index / content.length) * 100).toFixed(2) + '%');
    }
  }

  console.log('处理完成');

  fs.writeFileSync(resourcePath, lines.join('\n'), {
    encoding: 'utf-8',
  });
}

// simplifiedToTraditional(path.join(__dirname, '../src/database/chuci/chuci.json'));
// for (let i = 0; i < 22; i++) {
//   simplifiedToTraditional(path.join(__dirname, '../src/database/ci.song/ci.song.' + i * 1000 + '.json'));
// }
// simplifiedToTraditional(path.join(__dirname, '../src/database/lunyu/lunyu.json'));
// 108
// for (let i = 108; i < 120; i++) {
//   simplifiedToTraditional(path.join(__dirname, '../src/database/poet.song/poet.song.' + i * 1000 + '.json'));
// }
for (let i = 0; i < 58; i++) {
  simplifiedToTraditional(path.join(__dirname, '../src/database/poet.tang/poet.tang.' + i * 1000 + '.json'));
}
simplifiedToTraditional(path.join(__dirname, '../src/database/zhouyi/zhouyi.txt'));
