export const TYPES={pilates:'普拉提',yoga:'瑜伽',strength:'力量训练'};
export const INITIAL=12;
export function today(now=new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function addDays(date,n){const d=new Date(`${date}T12:00:00+08:00`);d.setUTCDate(d.getUTCDate()+n);return today(d);}
export function dateLabel(date){const d=new Date(`${date}T12:00:00+08:00`);return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',weekday:'short'}).format(d);}
const templates=[
 {time:'08:00',duration:50,type:'pilates',title:'晨间唤醒 · 核心床普拉提',coach:'林岚',level:'入门友好',format:'6 人小班',capacity:6},
 {time:'10:00',duration:60,type:'yoga',title:'流动瑜伽 · 呼吸与舒展',coach:'陈禾',level:'全级别',format:'8 人小班',capacity:8},
 {time:'10:30',duration:50,type:'pilates',title:'一对一 · 普拉提私教',coach:'林岚',level:'定制练习',format:'1 对 1',capacity:1},
 {time:'12:30',duration:50,type:'strength',title:'午间能量 · 功能性训练',coach:'周屿',level:'基础进阶',format:'6 人小班',capacity:6},
 {time:'18:00',duration:50,type:'strength',title:'基础力量 · 下班充电计划',coach:'周屿',level:'入门友好',format:'6 人小班',capacity:6},
 {time:'19:15',duration:60,type:'yoga',title:'晚间舒缓 · 拉伸与放松',coach:'陈禾',level:'入门友好',format:'8 人小班',capacity:8}
];
export function sessions(date){return templates.map((t,i)=>({...t,date,id:`${date}_${i}`,remaining:i===3?0:i===2?1:Math.min(t.capacity,2+((Number(date.slice(-2))+i)%4))}));}
export function sessionById(id){if(typeof id!=='string'||!/^\d{4}-\d{2}-\d{2}_[0-5]$/.test(id))return null;return sessions(id.slice(0,10)).find(s=>s.id===id)||null;}
export function fresh(){return {version:1,alias:'体验会员',records:[]};}
export function validState(s){return !!s&&s.version===1&&typeof s.alias==='string'&&s.alias.length<=20&&Array.isArray(s.records)&&s.records.length<=500&&s.records.every(r=>r&&typeof r.id==='string'&&/^[\w-]{1,80}$/.test(r.id)&&!!sessionById(r.sessionId)&&['booked','cancelled','attended'].includes(r.status)&&typeof r.trial==='boolean'&&typeof r.created==='string'&&!isNaN(Date.parse(r.created))&&(r.status!=='cancelled'||(typeof r.updated==='string'&&!isNaN(Date.parse(r.updated)))));}
export function balance(s){return INITIAL-s.records.filter(r=>!r.trial&&r.status!=='cancelled').length;}
export function start(s){return new Date(`${s.date}T${s.time}:00+08:00`).getTime();}
export function overlaps(a,b){return start(a)<start(b)+b.duration*60000&&start(b)<start(a)+a.duration*60000;}
export function bookingError(state,session,trial=false,now=new Date()){
 if(!session)return '请选择有效的课程场次。';
 if(start(session)<=now.getTime())return '这节课已经开始，请选择其他场次。';
 if(session.date<addDays(today(now),1)||session.date>addDays(today(now),14))return '请选择未来 14 天内的演示场次。';
 if(session.remaining<=0)return '这节课已满，请选择其他场次。';
 if(state.records.length>=500)return '演示记录已达上限，请先导出并清空记录。';
 const active=state.records.filter(r=>r.status!=='cancelled');
 if(active.some(r=>r.sessionId===session.id))return '你已经预约过这节课了。';
 if(active.some(r=>overlaps(session,sessionById(r.sessionId))))return '和已有预约的时间重叠，请换一节课。';
 if(trial&&active.some(r=>r.trial))return '每位演示会员限一节有效体验课，可在会员中心查看。';
 if(!trial&&balance(state)<1)return '演示课时不足，可先取消未签到预约或清空演示数据。';
 return '';
}
export function book(state,session,alias,trial=false,now=new Date(),id=globalThis.crypto.randomUUID()){
 const error=bookingError(state,session,trial,now);if(error)throw new Error(error);
 const clean=alias.trim();if(clean.length<1||clean.length>20)throw new Error('请填写 1–20 字的演示称呼。');
 return {...state,alias:clean,records:[...state.records,{id,sessionId:session.id,trial,status:'booked',created:now.toISOString()}]};
}
export function transition(state,id,status,now=new Date()){
 const r=state.records.find(x=>x.id===id);if(!r||r.status!=='booked'||!['cancelled','attended'].includes(status))throw new Error('预约状态已更新，请刷新后查看。');
 return {...state,records:state.records.map(x=>x.id===id?{...x,status,updated:now.toISOString()}:x)};
}
export function ledger(state){const list=[{label:'初始演示课时',change:INITIAL,when:'演示账户'}];for(const r of state.records){if(r.trial)continue;const s=sessionById(r.sessionId);list.push({label:`预约预扣 · ${s.title}`,change:-1,when:r.created});if(r.status==='cancelled')list.push({label:`取消返还 · ${s.title}`,change:1,when:r.updated});}return list.sort((a,b)=>a.when==='演示账户'?-1:b.when==='演示账户'?1:Date.parse(a.when)-Date.parse(b.when));}
