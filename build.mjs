import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for (const f of ['index.html','styles.css','app.js','studio.js']) await copyFile(f,`dist/${f}`);
await cp('public','dist',{recursive:true});
console.log('FORME built → dist/');
