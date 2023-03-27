import * as fs from 'fs';
import * as path from 'path';

/**
 * 读取本地数据
 * @param name 
 */
export function readLocalData(name: string):string[] {
 const resourcePath = path.join(__dirname, 'database', name);

 if (fs.statSync(resourcePath).isDirectory()) {
    return [];
 }

 if (!fs.existsSync(resourcePath)) {
    return [];
 }
 
 const content = fs.readFileSync(resourcePath, {encoding:'utf-8'}).split(/\n/);
 return content;
}