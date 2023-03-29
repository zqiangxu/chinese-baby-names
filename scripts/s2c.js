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

simplifiedToTraditional(path.join(__dirname, '../src/database/shijing/shijing.json'));
