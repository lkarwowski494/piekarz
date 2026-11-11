import { writeFileSync } from 'node:fs';
const L = {
 pl:['Chrupkość','Sprężystość','Kwasowość','Otwartość','Karmelizacja'],
 it:['Croccantezza','Elasticità','Acidità','Alveolatura','Caramellizzazione'],
 de:['Knusprigkeit','Elastizität','Säure','Offene Porung','Karamellisierung'],
 ja:['クリスピー感','弾力','酸味','オープンクラム','キャラメル化'],
};
const V=[4,4,3,3,4];
const geo=(size,rr)=>{const c=size/2;const R=size/2*rr;const p=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/5;return [c+r*Math.cos(a),c+r*Math.sin(a)]};return {c,R,p}};
const svgChart=(size,rr,labels)=>{const {c,R,p}=geo(size,rr);let s=`<svg width="${size}" height="${size}" style="overflow:hidden;background:#fff">`;
 for(const lv of [1,2,3,4,5]) s+=`<polygon points="${[0,1,2,3,4].map(i=>p(i,lv/5*R).join(',')).join(' ')}" fill="none" stroke="#6b5a4a" stroke-width="${lv==5?1.5:1}" ${lv<5?'stroke-dasharray="2,2"':''}/>`;
 for(let i=0;i<5;i++){const [x,y]=p(i,R);s+=`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#6b5a4a"/>`}
 s+=`<polygon points="${V.map((v,i)=>p(i,v/5*R).join(',')).join(' ')}" fill="none" stroke="#9a4a12" stroke-width="2.5"/>`;
 V.forEach((v,i)=>{const [x,y]=p(i,v/5*R);s+=`<circle cx="${x}" cy="${y}" r="4.5" fill="#9a4a12"/>`});
 if(labels) labels.forEach((l,i)=>{const [x,y]=p(i,R+14);const an=i==1||i==2?'start':i==3||i==4?'end':'middle';const dy=i==0?-4:i==2||i==3?10:4;s+=`<text x="${x}" y="${y+dy}" font-size="10" font-weight="600" text-anchor="${an}" fill="#2a2018">${l} (${V[i]})</text>`});
 return s+'</svg>'};
const lab=(l,i,al)=>`<div class="e" style="text-align:${al}">${l} (${V[i]})</div>`;
const po=(w,ls,big)=>`<div class="karta" style="width:${w}px"><div class="radar">${big?`<div style="align-self:center">${svgChart(170,0.93)}</div>${ls.map((l,i)=>lab(l,i,'left')).join('')}`:
 `${lab(ls[0],0,'center')}<div class="rz">${lab(ls[4],4,'left')}${lab(ls[1],1,'right')}</div><div style="align-self:center">${svgChart(170,0.93)}</div><div class="rz">${lab(ls[3],3,'left')}${lab(ls[2],2,'right')}</div>`}</div></div>`;
let h=`<html><head><meta charset=utf8><style>body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;margin:16px;background:#f3eee6;color:#2a2018}.k{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}.karta{background:#fffdf9;border:1px solid #d9cfc2;border-radius:16px;padding:16px;box-sizing:content-box}.radar{display:flex;flex-direction:column;gap:4px}.rz{display:flex;gap:8px}.rz .e{flex:1;min-width:0}.e{font-size:12px;font-weight:600;overflow-wrap:anywhere}h3{margin:16px 0 4px;font-size:14px}</style></head><body>`;
h+=`<h3>PRZED (obecny kod: etykiety w SVG 170 pt, kotwice start/end)</h3><div class="k">${['pl','it','de'].map(k=>`<div><div>${k}</div><div class="karta" style="width:254px;display:flex;justify-content:center">${svgChart(170,0.68,L[k])}</div></div>`).join('')}</div>`;
h+=`<h3>PO, 320 pt (karta 254 pt): etykiety w układzie (Text, podpis 12 pt)</h3><div class="k">${['pl','it','de','ja'].map(k=>`<div><div>${k}</div>${po(254,L[k])}</div>`).join('')}</div>`;
h+=`<h3>PO, 6,9″ (440 pt, karta 374 pt)</h3><div class="k">${['pl','it'].map(k=>`<div><div>${k}</div>${po(374,L[k])}</div>`).join('')}</div>`;
h+=`<h3>PO, duży tekst (fontScale ≥ 2, tu 12×2,5 pt): lista pod wykresem</h3><div class="k" id="ax">${['pl','it'].map(k=>`<div><div>${k}</div>${po(254,L[k],true).replace(/class="e"/g,'class="e" data-ax')}</div>`).join('')}</div>`;
h+=`<style>[data-ax]{font-size:30px}</style></body></html>`;
writeFileSync('mock.html',h);
