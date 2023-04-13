const path = require('path');
const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
const iconv = require("iconv-lite");


const content = fs.readFileSync('char.txt', {encoding:'utf-8'});
const chars = content.split(/\n/).map(line => line.split('|')[1]);
const segUrl = 'http://www.jiahl.com/m/wuxing/result.php?words=';

function handleResponse(surname, html) {
    const $ = cheerio.load(html);
    const wuxing = $('.pfword1 font').text().replace('五行：', '');

    if (wuxing.trim().length === 0) {
        return;
    }

    const details = [
        $('.pfword1').html(),
        $('.pfword2').html(),
        $('.pfword3').html(),
    ];

    const wuxingContent = fs.readFileSync('wuxing.txt', { encoding: 'utf-8'});
    fs.writeFileSync('wuxing.txt', `${wuxingContent}\n${surname}:${wuxing}`, {
        encoding: 'utf-8'
    });

    const detailContent = fs.readFileSync('detail.txt', {encoding: 'utf-8'});
    fs.writeFileSync('detail.txt', `${detailContent}\n${JSON.stringify({
        surname,
        details,
    })}`, {
        encoding: 'utf-8'
    });
}

function encodeGB2312(char) {
    const buffer = iconv.encode(char, 'gb2312');
    const s = buffer.toString('hex').toUpperCase().split('');
    let group = [];
    let temp = '';
    for (let i=0; i<s.length; i++) {
        temp += s[i];
        if (temp.length === 2) {
            group.push(temp);
            temp = '';
        }
    }
    return '%' + group.join('%');
};

let len = 0;
function next() { 
    const surname = chars[len];
    http.get(segUrl+encodeGB2312(surname) ,function(res){
        let buffer = [];
        let bufferLength = 0;
        res.on("data", chunk => {
            buffer.push(chunk);
            bufferLength += chunk.length;
        });
        res.on("end", () => {
            const bufferData = Buffer.concat(buffer, bufferLength);
            const html = iconv.decode(bufferData, "GBK");
            handleResponse(surname, html);

            setTimeout(() => {
                console.error('len:', len, chars[len]);
                len++;
                next();
            }, Math.floor(Math.random() * 1000));
        });
    }).on('error',function(e){
        console.error('Error:' + e.message);
    });
}

next();