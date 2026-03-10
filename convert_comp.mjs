import fs from 'fs';
import path from 'path';
import babel from '@babel/core';
import prettier from 'prettier';

async function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const isTSX = filePath.endsWith('.tsx');

  const result = await babel.transformAsync(code, {
    filename: filePath,
    presets: [
      ['@babel/preset-react'],
      ['@babel/preset-typescript', { isTSX, allExtensions: true }]
    ],
    retainLines: true
  });

  let newCode = result.code;
  newCode = await prettier.format(newCode, { parser: 'babel' });

  let newExt = isTSX ? '.jsx' : '.js';
  let newPath = filePath.replace(/\.tsx?$/, newExt);
  
  fs.writeFileSync(newPath, newCode);
  fs.unlinkSync(filePath);
  console.log(`Converted ${filePath} to ${newPath}`);
}
processFile('./src/components/CampaignWorkspace.tsx').then(() => console.log('Done')).catch(console.error);
