'use strict';

// src/lib/pdf/generateCopdPdf.js

const PDFDocument      = require('pdfkit');
const { createCanvas } = require('@napi-rs/canvas');
const { PassThrough }  = require('stream');

const TEAL       = '#2b8a8a';
const TABLE_HEAD = '#4a9494';
const LIGHT_GRAY = '#f5f5f5';
const MID_GRAY   = '#cccccc';
const DARK_GRAY  = '#555555';
const RED        = '#e74c3c';
const GREEN      = '#27ae60';
const BLACK      = '#000000';
const WHITE      = '#ffffff';
const HIGHLIGHT  = '#d5eaea';

// ─── Radar chart ─────────────────────────────────────────────────────────────
// FIX: accept maxVal as parameter so CAT (0-5) and GAD/PHQ (0-3) scale correctly
function radarChartBuffer({ values, labels, bestVals, worstVals, size = 320, maxVal = 5 }) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');
  const N = labels.length, cx = size/2, cy = size/2, labelPad = 36;
  const R = size/2 - labelPad;
  const angle = (i) => Math.PI/2 - 2*Math.PI*i/N;
  const polar = (val, i) => ({ x: cx+(val/maxVal)*R*Math.cos(angle(i)), y: cy-(val/maxVal)*R*Math.sin(angle(i)) });

  ctx.clearRect(0, 0, size, size);
  // Grid rings — use maxVal rings
  for (let r=1; r<=maxVal; r++) {
    ctx.beginPath();
    for (let i=0; i<N; i++) { const p=polar(r,i); i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); }
    ctx.closePath(); ctx.strokeStyle='#dddddd'; ctx.lineWidth=0.6; ctx.stroke();
  }
  for (let i=0; i<N; i++) {
    const p=polar(maxVal,i); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y);
    ctx.strokeStyle='#dddddd'; ctx.lineWidth=0.6; ctx.stroke();
  }
  const poly = (vals, sc, fc, lw=1.5, dash=[]) => {
    ctx.beginPath(); ctx.setLineDash(dash);
    vals.forEach((v,i)=>{ const p=polar(v,i); i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); });
    ctx.closePath(); ctx.strokeStyle=sc; ctx.lineWidth=lw; ctx.stroke();
    if (fc) { ctx.fillStyle=fc; ctx.fill(); } ctx.setLineDash([]);
  };
  if (worstVals) poly(worstVals, RED,   null,        1.2, [4,3]);
  if (bestVals)  poly(bestVals,  GREEN, null,        1.2, [4,3]);
                 poly(values,    TEAL,  TEAL+'44',   2.2);

  ctx.fillStyle='#333'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`${size*0.055}px sans-serif`;
  labels.forEach((lbl,i) => {
    const p=polar(maxVal+0.95,i), lines=lbl.split('\n');
    lines.forEach((ln,li)=>ctx.fillText(ln, p.x, p.y+(li-(lines.length-1)/2)*size*0.062));
  });
  // legend
  const leg=[{color:GREEN,dash:[4,3],label:'Beste nivå'},{color:RED,dash:[4,3],label:'Verste nivå'},{color:TEAL,dash:[],label:'Siste uke'}];
  const lx=size-82, ly=size-54;
  leg.forEach(({color,dash,label},i)=>{
    const ly2=ly+i*16; ctx.beginPath(); ctx.setLineDash(dash); ctx.moveTo(lx,ly2); ctx.lineTo(lx+18,ly2);
    ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#333'; ctx.textAlign='left'; ctx.font=`${size*0.044}px sans-serif`; ctx.fillText(label,lx+22,ly2+1);
  });
  return canvas.toBuffer('image/png');
}

// ─── Mini calendar ────────────────────────────────────────────────────────────
function getMonthWeeks(year, month) {
  const first=(new Date(year,month-1,1).getDay()+6)%7, days=new Date(year,month,0).getDate();
  const weeks=[]; let week=Array(first).fill(0);
  for (let d=1;d<=days;d++) { week.push(d); if(week.length===7){weeks.push(week);week=[];} }
  if (week.length) { while(week.length<7)week.push(0); weeks.push(week); }
  return weeks;
}
function miniCalendarBuffer({ year, month, highlightDays=[], cellPx=20, headerPx=22 }) {
  const DOW=['Ma','Ti','On','To','Fr','Lø','Sø'], rows=getMonthWeeks(year,month);
  const W=cellPx*7, H=headerPx+16+rows.length*cellPx+4;
  const canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=TABLE_HEAD; ctx.fillRect(0,0,W,headerPx);
  ctx.fillStyle=WHITE; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`bold ${headerPx*0.52}px sans-serif`;
  const MONTH_NAMES=['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];
  ctx.fillText(MONTH_NAMES[month-1], W/2, headerPx/2);
  ctx.fillStyle=DARK_GRAY; ctx.font=`${headerPx*0.42}px sans-serif`;
  DOW.forEach((d,i)=>ctx.fillText(d,i*cellPx+cellPx/2,headerPx+10));
  rows.forEach((week,wi)=>week.forEach((day,di)=>{
    if (!day) return;
    const x=di*cellPx+cellPx/2, y=headerPx+16+wi*cellPx+cellPx/2;
    if (highlightDays.includes(day)) {
      ctx.beginPath(); ctx.arc(x,y,cellPx*0.4,0,Math.PI*2); ctx.fillStyle=TEAL; ctx.fill(); ctx.fillStyle=WHITE;
    } else { ctx.fillStyle=DARK_GRAY; }
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`${cellPx*0.48}px sans-serif`;
    ctx.fillText(String(day),x,y);
  }));
  return canvas.toBuffer('image/png');
}

// ─── Buffer factory ───────────────────────────────────────────────────────────
function generateCopdPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const chunks=[]; const pass=new PassThrough();
    pass.on('data', c=>chunks.push(c));
    pass.on('end',  ()=>resolve(Buffer.concat(chunks)));
    pass.on('error', reject);
    try { buildPdf(data, pass); } catch(e) { reject(e); }
  });
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function buildPdf(data, stream) {
  const doc = new PDFDocument({ size:'A4', margin:0, compress:true });
  doc.pipe(stream);

  const PW=doc.page.width, PH=doc.page.height, M=42, W=PW-M*2;

  const drawCheck=(x,y,size,checked)=>{
    doc.save().roundedRect(x,y,size,size,2).fillAndStroke(checked?GREEN:RED,checked?GREEN:RED)
      .fillColor(WHITE).font('Helvetica-Bold').fontSize(size*0.65)
      .text(checked?'✓':'✗',x,y+size*0.08,{width:size,align:'center'}).restore();
  };

  const records=data.records||[], medicinesList=data.medicines||[];
  const medMap=Object.fromEntries(medicinesList.map(m=>[m.id,m.name]));
  const sorted=[...records].sort((a,b)=>a.date.localeCompare(b.date));
  const latest=sorted[sorted.length-1]||{};
  const catScore=latest.cat8||0, weightLatest=latest.weight||80, heightCm=data.height||177;
  const bmi=(weightLatest/Math.pow(heightCm/100,2)).toFixed(1);

  // FIX: use rolling 12-month window from today
  const cutoff=new Date(); cutoff.setFullYear(cutoff.getFullYear()-1);
  let moderate=0,serious=0;
  for (const r of records) {
    if (new Date(r.date)>=cutoff) {
      if(r.moderateExacerbations) moderate++;
      if(r.seriousExacerbations)  serious++;
    }
  }

  const smoking=data.smoking||{}, smokeCode=smoking.smoking||0;
  let smokeLabel='Ikke-røyker.', packYears=0;
  if (smokeCode===1||smokeCode===2) {
    smokeLabel=smokeCode===1?'Eks-røyker.':'Aktiv røyker.';
    const start=smoking.startAge||0, end=smokeCode===1?(smoking.endAge||(data.age-start)):(data.age-start);
    packYears=Math.max(0,Math.round((end-start)*(smoking.frequency||0)/20));
  }

  const vacc=(data.vaccinations||[{}]).slice(-1)[0]||{};
  const gad=data.latestGad7||{}, phq=data.latestPhq9||{}, alpha1=data.latestAlpha1||{};
  const gadScore=['feelingNervous','noWorryingControl','worrying','troubleRelaxing','restless','easilyAnnoyed','afraid'].reduce((s,k)=>s+(gad[k]||0),0);
  const phqScore=['noPleasureDoingThings','depressed','stayingAsleep','noEnergy','noAppetite','selfPity','troubleConcentration','slowMovingSpeeking','suicidal'].reduce((s,k)=>s+(phq[k]||0),0);
  const paMap={1:'< 1 time/uke',2:'1-2 timer/uke',3:'2-3 timer/uke',4:'3-4 timer/uke',5:'> 4 timer/uke'};
  const satLabels={1:'Svært misfornøyd',2:'Misfornøyd',3:'Nøytral',4:'Fornøyd',5:'Svært fornøyd'};
  const diagText=data.copdDiagnosed?'KOLS (Bekreftet av lege)':'KOLS (Ikke bekreftet av lege)';
  const a1Label=alpha1.alpha1Tested?'Utført.':'Ikke utført.';

  // FIX: build exacMap spanning actual record dates (not just current year)
  const exacMap={};
  for (const r of records) {
    if (r.moderateExacerbations||r.seriousExacerbations) {
      const d=new Date(r.date), key=`${d.getFullYear()}-${d.getMonth()+1}`;
      (exacMap[key]=exacMap[key]||[]).push(d.getDate());
    }
  }

  // ── Header ───────────────────────────────────────────────────────────────────
  const logoSz=60;
  doc.save().roundedRect(M,M,logoSz,logoSz,4).fill(TEAL).restore();
  const lx=M+logoSz/2, ly=M+logoSz/2;
  doc.save().fillColor(WHITE)
    .moveTo(lx-2,ly-8).bezierCurveTo(lx-14,ly-8,lx-18,ly+4,lx-10,ly+14).bezierCurveTo(lx-6,ly+18,lx-2,ly+10,lx-2,ly+6).fill().restore();
  doc.save().fillColor(WHITE)
    .moveTo(lx+2,ly-8).bezierCurveTo(lx+14,ly-8,lx+18,ly+4,lx+10,ly+14).bezierCurveTo(lx+6,ly+18,lx+2,ly+10,lx+2,ly+6).fill().restore();
  doc.save().strokeColor(WHITE).lineWidth(2).moveTo(lx,ly-8).lineTo(lx,ly-16).stroke().restore();

  const infoX=M+logoSz+14;
  doc.font('Helvetica').fontSize(9).fillColor(BLACK);
  doc.text('Navn: _________________________________',infoX,M+4);
  doc.text(`Alder: ${data.age||''}`,infoX,M+17);
  doc.text(`Vekt:  ${weightLatest} kg.`,infoX,M+30);
  doc.text(`Høyde: ${heightCm} cm.    BMI: ${bmi} kg/m²`,infoX,M+43);

  const bmiSils=[{label:'BMI\n<18,5',active:bmi<18.5},{label:'BMI\n18,5-25',active:bmi>=18.5&&bmi<25},{label:'BMI\n25-30',active:bmi>=25&&bmi<30},{label:'BMI\n>30',active:bmi>=30}];
  const bmiColors=['#e74c3c','#27ae60','#27ae60','#3498db'];
  const bmiX0=PW-M-4*32;
  bmiSils.forEach(({label,active},i)=>{
    const bx=bmiX0+i*32+10, by=M+8, col=bmiColors[i], bw=[6,8,11,14][i];
    doc.save().opacity(active?1:0.3);
    doc.circle(bx,by+4,5).fill(col);
    doc.rect(bx-bw/2,by+10,bw,16).fill(col);
    doc.moveTo(bx-2,by+26).lineTo(bx-5,by+38).moveTo(bx+2,by+26).lineTo(bx+5,by+38).strokeColor(col).lineWidth(2).stroke();
    doc.restore();
    doc.font('Helvetica').fontSize(5).fillColor(DARK_GRAY).opacity(active?1:0.3);
    label.split('\n').forEach((ln,li)=>doc.text(ln,bx-14,by+42+li*7,{width:28,align:'center'}));
    doc.opacity(1);
    const dc=[[col],[col,col,col],[col,col],[col,col,col]][i];
    dc.forEach((c,di)=>doc.circle(bx-(dc.length-1)*3.5/2+di*3.5,by+57,2).fill(c));
  });

  let curY=M+logoSz+10;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK).text(`Diagnose: ${diagText}`,M,curY); curY+=13;
  doc.font('Helvetica').fontSize(9).text(`Alpha-1-antitrypsinmangel screening: ${a1Label}`,M,curY); curY+=13;
  doc.text(`Røykestatus: ${smokeLabel} Pakkeår ${packYears}.`,M,curY); curY+=13;
  doc.text(`Fysisk aktivitet: ${paMap[latest.physicalActivity]||'Ukjent'}`,M,curY); curY+=16;

  const bannerH=18;
  doc.rect(M,curY,W,bannerH).fill(TEAL);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE)
    .text(`Eksaserbasjoner siste 12 måneder: ${moderate+serious} (${serious} sykehusinnleggelser)`,M+4,curY+4,{width:W-8});
  curY+=bannerH+4;

  // ── Calendars — FIX: show the 12 months that span the actual data window ────
  // Determine the 12-month window ending today
  const calCellPx=20, calHdrPx=22;
  const calW=calCellPx*7, calH=calHdrPx+16+6*calCellPx+2;
  const calGapX=(W-4*calW)/5, calGapY=4, calAreaH=3*(calH+calGapY);

  // Build array of {year, month} for last 12 months ending this month
  const calMonths=[];
  const refDate=new Date();
  for (let i=11; i>=0; i--) {
    const d=new Date(refDate.getFullYear(), refDate.getMonth()-i, 1);
    calMonths.push({ year:d.getFullYear(), month:d.getMonth()+1 });
  }

  for (let mi=0; mi<12; mi++) {
    const col=mi%4, row=Math.floor(mi/4);
    const { year:yr, month:mo } = calMonths[mi];
    const cx=M+calGapX+col*(calW+calGapX), cy=curY+row*(calH+calGapY);
    const buf=miniCalendarBuffer({year:yr,month:mo,highlightDays:exacMap[`${yr}-${mo}`]||[],cellPx:calCellPx,headerPx:calHdrPx});
    doc.image(buf,cx,cy,{width:calW});
  }

  // ── CAT radar ────────────────────────────────────────────────────────────────
  // FIX: correct label order matching CAT-8 fields, maxVal=5 is correct for CAT
  const catFields=[
    ['cat8Cough',          'Hoste'],
    ['cat8Phlegm',         'Slim'],
    ['cat8ChestTightness', 'Tetthet\ni brystet'],
    ['cat8Breathlessness', 'Åndenød'],
    ['cat8Activities',     'Begrenset\naktivitet'],
    ['cat8Confidence',     'Selvtillit'],
    ['cat8Sleep',          'Søvn'],
    ['cat8Energy',         'Fatigue'],
  ];
  const catVals  = catFields.map(([f])=>latest[f]||0);
  const catBest  = catFields.map(([f])=>Math.min(...records.map(r=>r[f]||0)));
  const catWorst = catFields.map(([f])=>Math.max(...records.map(r=>r[f]||0)));
  const radarSz=160;
  const catBuf=radarChartBuffer({values:catVals,labels:catFields.map(([,l])=>l),bestVals:catBest,worstVals:catWorst,size:radarSz,maxVal:5});
  const catX=M+W-radarSz+4, catImgY=curY+calAreaH/2-radarSz/2-20;
  doc.image(catBuf,catX,catImgY,{width:radarSz-4});
  const scY=catImgY+radarSz+2;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK).text(`CAT-skår: ${catScore}/40`,catX,scY,{width:radarSz-4,align:'center'});
  doc.font('Helvetica').fontSize(7.5).fillColor(GREEN).text('CAT < 10 - færre symptomer',catX,scY+12,{width:radarSz-4,align:'center'});
  doc.fillColor(RED).text('CAT ≥ 10 - flere symptomer',catX,scY+22,{width:radarSz-4,align:'center'});
  curY+=calAreaH+8;

  // ── Medications & satisfaction ────────────────────────────────────────────────
  const halfW=W*0.45;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK).text('Medisin:',M,curY).text('Pasienttilfredshet:',M+halfW,curY);
  curY+=16;
  const medSatList=(data.latestMedicineSatisfaction||{}).medicines||[];
  for (const ms of medSatList) {
    const mName=medMap[ms.medicineId]||`Med ${ms.medicineId}`, sat=ms.satisfaction||0;
    doc.roundedRect(M,curY-2,22,16,3).fill('#e8e8e8');
    doc.roundedRect(M+1,curY-1,20,14,2).fill('#c0392b');
    doc.font('Helvetica-Bold').fontSize(5).fillColor(WHITE).text(mName.substring(0,8),M+1,curY+3,{width:20,align:'center'});
    doc.font('Helvetica').fontSize(9).fillColor(BLACK).text(mName.charAt(0).toUpperCase()+mName.slice(1),M+26,curY+1);
    for (let di=0;di<5;di++) doc.circle(M+halfW+di*10+5,curY+6,4).fill(di<sat?TEAL:MID_GRAY);
    doc.font('Helvetica').fontSize(9).fillColor(BLACK).text(satLabels[sat]||'',M+halfW+58,curY+1);
    curY+=18;
  }

  // ── Vaccinations ─────────────────────────────────────────────────────────────
  const vaccItems=[['Influensae',vacc.flue],['Sars-COV-2 vac',vacc.covid],['Pneumococcus',vacc.pneumococ],['RS-virus',vacc.rs],['Pertussis',vacc.pertussis]];
  const vaccStartY=curY-medSatList.length*18-14, vaccX=M+W-130;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK).text('Vaksiner:',vaccX,vaccStartY);
  let vy=vaccStartY+14;
  for (const [vname,vdone] of vaccItems) {
    doc.font('Helvetica').fontSize(8.5).fillColor(BLACK).text(vname,vaccX,vy+1);
    drawCheck(vaccX+110,vy-1,12,!!vdone); vy+=14;
  }
  curY+=10;

  // ── GAD-7 & PHQ-9 radars ──────────────────────────────────────────────────────
  // FIX: correct GAD-7 labels (no more 'Slim' copy-paste), maxVal=3 for GAD/PHQ
  const gadFields=[
    ['feelingNervous',    'Nervøsitet'],
    ['noWorryingControl', 'Bekymrings-\nkontroll'],   // FIX was 'Slim'
    ['worrying',          'Bekymring'],
    ['troubleRelaxing',   'Katastrofe-\ntanker'],
    ['restless',          'Rastløshet'],
    ['easilyAnnoyed',     'Irritabilitet'],
    ['afraid',            'Frykt'],
  ];
  const phqFields=[
    ['noPleasureDoingThings','Lite\ninteresse'],
    ['depressed',            'Nedstemthet'],
    ['stayingAsleep',        'Søvn'],
    ['noEnergy',             'Lite\nenergi'],
    ['noAppetite',           'Dårlig\nappetitt'],
    ['selfPity',             'Negativ\nselvfølelse'],
    ['troubleConcentration', 'Konsentr-\nasjons-\nvansker'],
    ['slowMovingSpeeking',   'Langsomme\nbevegelser'],
    ['suicidal',             'Selvmords-\ntanker'],
  ];

  const gadVals=gadFields.map(([f])=>gad[f]||0);
  const phqVals=phqFields.map(([f])=>phq[f]||0);
  const chartW=W/2-6, chartSz=155;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK)
    .text('GAD-7 Angst',M,curY).text('PHQ-9 - Depresjon',M+W/2,curY);
  curY+=4;

  // FIX: pass maxVal=3 so GAD/PHQ scores (0-3) fill the radar correctly
  doc.image(radarChartBuffer({values:gadVals,labels:gadFields.map(([,l])=>l),size:chartSz,maxVal:3}),M,curY,{width:chartW});
  doc.image(radarChartBuffer({values:phqVals,labels:phqFields.map(([,l])=>l),size:chartSz,maxVal:3}),M+W/2,curY,{width:chartW});
  curY+=chartW+6;

  // ── Score tables ──────────────────────────────────────────────────────────────
  const drawTable=(tx,ty,title,score,trows)=>{
    const tW=W/2-6, rH=14, c1W=tW*0.32;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK).text(`${title}: ${score}`,tx,ty);
    let ty2=ty+14;
    doc.rect(tx,ty2,tW,rH).fill(TEAL);
    doc.font('Helvetica-Bold').fontSize(7).fillColor(WHITE)
      .text('Total skår',tx+2,ty2+3,{width:c1W})
      .text('Alvorlighetsgrad',tx+c1W+2,ty2+3,{width:tW-c1W});
    ty2+=rH;
    for (const [lo,hi,label] of trows) {
      const active=score>=lo&&score<=hi;
      doc.rect(tx,ty2,tW,rH).fill(active?HIGHLIGHT:LIGHT_GRAY);
      doc.font(active?'Helvetica-Bold':'Helvetica').fontSize(7).fillColor(BLACK)
        .text(`${lo}–${hi}`,tx+2,ty2+3,{width:c1W})
        .text(label,tx+c1W+2,ty2+3,{width:tW-c1W});
      ty2+=rH;
    }
  };
  drawTable(M,     curY,'GAD-7 skår',gadScore,[[0,4,'Minimal angst'],[5,9,'Mild angst'],[10,14,'Moderat angst'],[15,21,'Alvorlig angst']]);
  drawTable(M+W/2, curY,'PHQ-9 skår',phqScore,[[0,4,'Ingen eller minimal depresjon'],[5,9,'Mild depresjon'],[10,14,'Moderat depresjon'],[15,19,'Moderat alvorlig depresjon'],[20,27,'Alvorlig depresjon']]);

  doc.end();
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
if (require.main===module) {
  const fs=require('fs'), path=require('path');
  const inFile=process.argv[2]||'patient.json', outFile=process.argv[3]||'copd_report.pdf';
  const data=JSON.parse(fs.readFileSync(path.resolve(inFile),'utf8'));
  generateCopdPdfBuffer(data).then(buf=>{ fs.writeFileSync(path.resolve(outFile),buf); console.log(`✅  Saved: ${outFile}`); }).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { generateCopdPdfBuffer };