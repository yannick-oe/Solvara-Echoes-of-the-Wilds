const fs = require('fs');
const raw = fs.readFileSync('assets/data/levels/level_01.json', 'utf8');
const lvl = JSON.parse(raw);

const rows = lvl.map.length;
const colCounts = lvl.map.map(r => r.length);
const allSame = colCounts.every(c => c === lvl.meta.columns);
console.log('rows:', rows, '(expected', lvl.meta.rows + ')');
console.log('col count match:', allSame ? 'PASS' : 'FAIL – mismatches: ' + colCounts.map((c,i)=>c!==lvl.meta.columns?i+':'+c:'').filter(Boolean).join(','));

let tiles = 0;
lvl.map.forEach(r => r.forEach(c => { if(c) tiles++; }));
console.log('non-null tiles:', tiles);

const registry = ['g','d','p','l','g2','di','dv','dv2','d2','de','dg','sc','st','sta','sd','sda','stf','staf','sdf','sdaf','stt','sdt','stb','sdb','gf','df','dvf','ddf','srr','src','srg','srt','slg','slt','src2','slc2','srh','slh','srs','sls','srfb','srfm','slfm','slfb','gtl','gtr','ll2','lr2','dcl','dcr','ab','ab2','ab3','pt','pm','pb','atl','atm','atr','ate','abl','abr','tb','tba','tbd','brl','brr','cb1','cb2','cb3','cb4','cw1','cw2','cw3','tbt','tbm','tbe','cl1','cl2','cl3','cl4','cp','cm1','cm2','cv1','ts1','ts2','ts3','ts4','ts5','cb5','cb6','cb7','cb8','cv2','ts6','ts7','cfl','cfc','cfr','cfre','cvd','cvs','cvc','ta1','ta2','tv1','tv2','tv3','ctp1','ctp2','ctp3','cbd1','cbd2','cbd3','pvd','pvb1','pvb2','pvb3','ctp4','ctp5','cbd4','cbd5','cbd6','pvb4','pvb5','pvb6'];
const used = new Set();
lvl.map.forEach(r => r.forEach(c => { if(c) used.add(c); }));
const unknown = [...used].filter(k => !registry.includes(k));
console.log('used keys:', [...used].join(', '));
console.log('unknown keys:', unknown.length === 0 ? 'none' : unknown.join(', '));
console.log('gems:', lvl.content.pickups.filter(p=>p.type==='gem').length);
console.log('starCoins:', lvl.content.pickups.filter(p=>p.type==='starCoin').length);
console.log('cherries:', lvl.content.pickups.filter(p=>p.type==='cherry').length);
console.log('enemies:', lvl.content.enemies.length);
console.log('hazards:', lvl.content.hazards.length);
console.log('interactables:', lvl.content.interactables.length);
console.log('props:', lvl.content.props.length);
