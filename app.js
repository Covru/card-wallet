(() => {
  "use strict";
  // Categories are for cards you scan/show a barcode or QR for. Tap-only cards
  // (e.g. transit fare cards with an NFC chip) can't be stored here, so they're
  // intentionally not offered.
  const CATEGORIES = {
    gym:     { label:"Gym & Fitness", hue:"#E2724F" },
    grocery: { label:"Grocery",       hue:"#5BA572" },
    library: { label:"Library",       hue:"#9B7BE0" },
    cafe:    { label:"Cafe & Food",   hue:"#C98A4E" },
    events:  { label:"Events",        hue:"#DD6A92" },
    loyalty: { label:"Loyalty",       hue:"#D2A745" },
    other:   { label:"Other",         hue:"#8B949C" },
  };
  const CAT_KEYS = Object.keys(CATEGORIES);
  const FORMATS = [
    { v:"CODE128", label:"Code 128" },{ v:"EAN13", label:"EAN-13" },{ v:"EAN8", label:"EAN-8" },
    { v:"UPC", label:"UPC-A" },{ v:"CODE39", label:"Code 39" },{ v:"QR", label:"QR code" },
  ];
  const fmtLabel=v=>(FORMATS.find(f=>f.v===v)||{label:v}).label;
  function checkDigitOK(s){
    let sum=0;
    for(let i=s.length-2;i>=0;i--){ sum += (+s[i]) * (((s.length-2-i)%2===0)?3:1); }
    return ((10-(sum%10))%10)===(+s[s.length-1]);
  }
  function detectFormat(num){
    const s=(num||"").replace(/\s+/g,"");
    if(!s) return null;
    if(/^\d+$/.test(s)){
      if(s.length===13 && checkDigitOK(s)) return "EAN13";
      if(s.length===12 && checkDigitOK(s)) return "UPC";
      if(s.length===8 && checkDigitOK(s)) return "EAN8";
      return "CODE128";
    }
    return "CODE128";
  }
  function validFor(value,fmt){
    if(!value) return true; if(fmt==="QR") return true;
    try{ const svg=document.createElementNS("http://www.w3.org/2000/svg","svg"); JsBarcode(svg,value,{format:fmt,displayValue:false,margin:0,height:30}); return true; }catch(e){ return false; }
  }
  const ICON = (cat) => {
    const p={
      gym:'<rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/><rect x="5" y="10.5" width="2" height="3"/><rect x="17" y="10.5" width="2" height="3"/><line x1="7" y1="12" x2="17" y2="12"/>',
      grocery:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.5 12.5h11L20 7H6"/>',
      transit:'<rect x="5" y="3" width="14" height="14" rx="3"/><line x1="5" y1="11" x2="19" y2="11"/><circle cx="8.5" cy="14" r="1"/><circle cx="15.5" cy="14" r="1"/><line x1="7" y1="20" x2="5" y2="22"/><line x1="17" y1="20" x2="19" y2="22"/>',
      library:'<path d="M12 6c-2-1.5-5-1.5-8 0v13c3-1.5 6-1.5 8 0 2-1.5 5-1.5 8 0V6c-3-1.5-6-1.5-8 0z"/><line x1="12" y1="6" x2="12" y2="19"/>',
      cafe:'<path d="M5 8h12v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><line x1="8" y1="3" x2="8" y2="5"/><line x1="12" y1="3" x2="12" y2="5"/>',
      events:'<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><line x1="14" y1="6" x2="14" y2="16" stroke-dasharray="2 2"/>',
      loyalty:'<path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z"/>',
      other:'<rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>',
    };
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p[cat]||p.other}</svg>`;
  };
  const WAVE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" style="opacity:.8"><path d="M8.5 8a6 6 0 0 1 0 8M12 5.5a10 10 0 0 1 0 13M5 10.5a3 3 0 0 1 0 3"/></svg>';
  const STAR_F='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
  const closeIcon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const SHOW_IC='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  const INFO_IC='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/></svg>';
  const ARRANGE_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5v14M7 5L4 8M7 5l3 3"/><path d="M17 19V5M17 19l3-3M17 19l-3-3"/></svg>';
  const DRAG_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/></svg>';
  const FLIP_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a9 9 0 0 1 15-6.7L21 7"/><path d="M21 3v4h-4"/><path d="M21 13a9 9 0 0 1-15 6.7L3 17"/><path d="M3 21v-4h4"/></svg>';
  const CAM_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>';
  const IMG_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
  const TYPE_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const CHEV_R='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  function shade(hex,amt){const n=parseInt(hex.slice(1),16);const r=Math.max(0,Math.min(255,(n>>16)+amt));const g=Math.max(0,Math.min(255,((n>>8)&255)+amt));const b=Math.max(0,Math.min(255,(n&255)+amt));return"#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");}
  // mix `hex` toward `to` by ratio t (0..1)
  function mix(hex,to,t){const a=parseInt(hex.slice(1),16),b=parseInt(to.slice(1),16);
    const r=Math.round(((a>>16)&255)+(((b>>16)&255)-((a>>16)&255))*t);
    const g=Math.round(((a>>8)&255)+(((b>>8)&255)-((a>>8)&255))*t);
    const c=Math.round((a&255)+((b&255)-(a&255))*t);
    return"#"+((r<<16)|(g<<8)|c).toString(16).padStart(6,"0");}
  // "Coal" card: a dark charcoal field tinted by the category hue
  const grad=(hue)=>`linear-gradient(160deg, ${mix(hue,'#222227',.5)} 0%, ${mix(hue,'#19191D',.7)} 56%, ${mix(hue,'#131316',.8)} 100%)`;
  const accentLt=(hue)=>mix(hue,'#ffffff',.3);
  const artCol=(hue)=>mix(hue,'#ffffff',.42);
  const ricGrad=(hue)=>`linear-gradient(160deg, ${mix(hue,'#222227',.4)}, ${mix(hue,'#19191D',.7)})`;
  // set the per-card CSS custom properties used by styles.css
  function cardVars(el,hue){el.style.setProperty('--grad',grad(hue));el.style.setProperty('--accent',hue);el.style.setProperty('--accent-lt',accentLt(hue));el.style.setProperty('--art',artCol(hue));}

  // ---------- per-category card art (illustration based on what the card is) ----------
  function rep(n,fn){let s="";for(let i=0;i<n;i++)s+=fn(i);return s;}
  const CARD_ART = {
    gym:()=>`<path d="M150 92 h22 l6 -15 l9 32 l8 -21 h46" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".32"/><g fill="currentColor" opacity=".5"><rect x="160" y="150" width="150" height="9" rx="4.5"/><rect x="192" y="134" width="13" height="42" rx="3"/><rect x="209" y="126" width="15" height="58" rx="3"/><rect x="250" y="126" width="15" height="58" rx="3"/><rect x="269" y="134" width="13" height="42" rx="3"/></g>`,
    grocery:()=>`<g fill="currentColor" opacity=".34">${rep(18,i=>`<rect x="${150+i*9}" y="172" width="${i%3?2:4}" height="22"/>`)}</g><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity=".52"><path d="M152 112 h16 l18 56 h70 l15 -42 H182"/><circle cx="198" cy="180" r="6.5"/><circle cx="250" cy="180" r="6.5"/></g>`,
    transit:()=>`<path d="M150 150 C212 150 212 70 320 70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="2 9" opacity=".26"/><path d="M150 176 C200 176 202 96 252 96 C292 96 304 96 320 96" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".5"/><g opacity=".55"><circle cx="150" cy="176" r="6" fill="currentColor"/><circle cx="200" cy="136" r="5.5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="252" cy="96" r="6" fill="currentColor"/></g>`,
    library:()=>`<g opacity=".5" fill="currentColor"><g transform="translate(176 64)"><rect x="0" y="44" width="17" height="90" rx="3"/><rect x="21" y="22" width="17" height="112" rx="3"/><rect x="42" y="50" width="17" height="84" rx="3"/><g transform="rotate(13 86 134)"><rect x="64" y="36" width="17" height="98" rx="3"/></g><rect x="92" y="30" width="17" height="104" rx="3"/></g></g>`,
    cafe:()=>`<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity=".52"><path d="M196 116 h54 v26 a27 27 0 0 1 -54 0 z"/><path d="M250 122 h12 a13 13 0 0 1 0 26 h-7"/><path d="M210 104 c0 -7 -7 -9 -7 -17 M228 104 c0 -7 -7 -9 -7 -17"/></g><g opacity=".3" fill="none" stroke="currentColor" stroke-width="2">${rep(4,i=>`<circle cx="${164+i*22}" cy="182" r="6"/>`)}</g>`,
    events:()=>`<g opacity=".5" stroke="currentColor" stroke-width="3" fill="none" stroke-linejoin="round"><path d="M172 108 h104 a8 8 0 0 1 8 8 a11 11 0 0 0 0 22 a8 8 0 0 1 -8 8 H172 a8 8 0 0 1 -8 -8 a11 11 0 0 0 0 -22 a8 8 0 0 1 8 -8 z"/><line x1="238" y1="110" x2="238" y2="162" stroke-dasharray="2 7"/></g>`,
    loyalty:()=>`<g fill="currentColor" opacity=".5"><path d="M244 96 l11 25 27 2 -20.5 18 6 26.5 -23.5 -14 -23.5 14 6 -26.5 -20.5 -18 27 -2 z"/></g><g fill="currentColor" opacity=".3">${rep(3,i=>`<path transform="translate(${168+i*30} ${70+(i%2)*70}) scale(.4)" d="M12 0 l4 9 10 1 -7.5 6.5 2 9.5 -8.5 -5 -8.5 5 2 -9.5 -7.5 -6.5 10 -1 z"/>`)}</g>`,
    other:()=>`<g fill="none" stroke="currentColor" stroke-width="2.5" opacity=".34">${rep(4,i=>`<circle cx="262" cy="132" r="${18+i*20}"/>`)}</g>`,
  };
  const artSVG=(cat)=>`<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">${(CARD_ART[cat]||CARD_ART.other)()}</svg>`;

  function h(tag,props={},...kids){
    const el=document.createElement(tag);
    for(const[k,v] of Object.entries(props||{})){
      if(k==="class")el.className=v;else if(k==="html")el.innerHTML=v;else if(k==="style")el.setAttribute("style",v);
      else if(k.startsWith("on"))el.addEventListener(k.slice(2).toLowerCase(),v);
      else if(v!==false&&v!=null)el.setAttribute(k,v);
    }
    for(const kid of kids.flat()){if(kid==null||kid===false)continue;el.appendChild(typeof kid==="string"?document.createTextNode(kid):kid);}
    return el;
  }
  const $=(s)=>document.querySelector(s);

  const DB_NAME="wallet-db", STORE="cards", META="meta";
  let _db=null, cards=[];
  let settings={sortMode:"used",lastBackup:0,snoozeUntil:0};
  function uid(){try{return crypto.randomUUID();}catch(e){return Date.now()+"-"+Math.floor(Math.random()*1e9);}}
  function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,2);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"});if(!db.objectStoreNames.contains(META))db.createObjectStore(META,{keyPath:"k"});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
  function metaGet(k){return new Promise((res)=>{try{const q=_db.transaction(META,"readonly").objectStore(META).get(k);q.onsuccess=()=>res(q.result?q.result.v:null);q.onerror=()=>res(null);}catch(e){res(null);}});}
  function metaPut(k,v){return new Promise((res,rej)=>{try{const q=_db.transaction(META,"readwrite").objectStore(META).put({k,v});q.onsuccess=()=>res();q.onerror=()=>rej(q.error);}catch(e){rej(e);}});}
  function saveSettings(){return metaPut("settings",settings).catch(()=>{});}
  function tx(m){return _db.transaction(STORE,m).objectStore(STORE);}
  function dbGetAll(){return new Promise((res,rej)=>{const q=tx("readonly").getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error);});}
  function dbPut(c){return new Promise((res,rej)=>{const q=tx("readwrite").put(c);q.onsuccess=()=>res();q.onerror=()=>rej(q.error);});}
  function dbDelete(id){return new Promise((res,rej)=>{const q=tx("readwrite").delete(id);q.onsuccess=()=>res();q.onerror=()=>rej(q.error);});}
  function dbClear(){return new Promise((res,rej)=>{const q=tx("readwrite").clear();q.onsuccess=()=>res();q.onerror=()=>rej(q.error);});}
  function dbReplaceAll(recs){return new Promise((res,rej)=>{const t=_db.transaction(STORE,"readwrite");const s=t.objectStore(STORE);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error);try{s.clear();for(const rec of recs)s.put(rec);}catch(e){try{t.abort();}catch(_){}rej(e);}});}
  const urlCache=new Map();
  function imgURL(card){if(!card.image)return null;if(urlCache.has(card.id))return urlCache.get(card.id);const u=URL.createObjectURL(card.image);urlCache.set(card.id,u);return u;}
  function dropURL(id){if(urlCache.has(id)){URL.revokeObjectURL(urlCache.get(id));urlCache.delete(id);}}

  function renderCode(holder,card,height){
    holder.innerHTML="";const fmt=card.format||"CODE128";const value=(fmt==="QR")?(card.number||"").trim():(card.number||"").replace(/\s+/g,"");
    if(!value){holder.appendChild(h("p",{style:"color:#999;font-size:13px"},"No number saved"));return;}
    if(fmt==="QR"){const c=document.createElement("canvas");holder.appendChild(c);
      QRCode.toCanvas(c,value,{margin:1,width:height?Math.min(height*1.4,230):170,color:{dark:"#16130f",light:"#fff"}},(err)=>{if(err){holder.innerHTML="";holder.appendChild(h("p",{style:"color:#c0392b;font-size:13px"},"Invalid for this format"));}});return;}
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");holder.appendChild(svg);
    const o={format:fmt,displayValue:false,margin:0,height:height||70,width:2,lineColor:"#16130f"};
    try{JsBarcode(svg,value,o);}catch(e){try{JsBarcode(svg,value,{...o,format:"CODE128"});}catch(e2){holder.innerHTML="";holder.appendChild(h("p",{style:"color:#c0392b;font-size:13px"},"Invalid for this format"));}}
  }

  let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.setAttribute("data-show","true");clearTimeout(toastT);toastT=setTimeout(()=>t.setAttribute("data-show","false"),2100);}

  let mode="stack",query="",activeCat="all";

  function sortCards(arr){
    const fav=c=>c.favorite?0:1;
    if(settings.sortMode==="custom")
      return arr.sort((a,b)=>(a.order??1e9)-(b.order??1e9)||a.name.localeCompare(b.name));
    return arr.sort((a,b)=>fav(a)-fav(b)||(b.uses||0)-(a.uses||0)||(a.order??1e9)-(b.order??1e9)||a.name.localeCompare(b.name));
  }
  function sortNow(){ sortCards(cards); }
  function visible(){
    const q=query.toLowerCase().trim();
    return cards.filter(c=>activeCat==="all"||c.category===activeCat)
      .filter(c=>{
        if(!q)return true;
        const cat=(CATEGORIES[c.category]||CATEGORIES.other).label.toLowerCase();
        return c.name.toLowerCase().includes(q)
          || (c.number||"").toLowerCase().includes(q)
          || cat.includes(q)
          || (c.notes||"").toLowerCase().includes(q);
      });
  }

  // ---------- card faces ----------
  function baseFace(card,onClick){
    const cat=CATEGORIES[card.category]||CATEGORIES.other;
    const f=h("div",{class:"face",role:"button",tabindex:"0",onClick});
    cardVars(f,cat.hue);
    f.appendChild(h("div",{class:"art",html:artSVG(card.category)}));
    f.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick();}});
    return f;
  }
  function cardHead(card,cat,nameStyle){
    return h("div",{class:"hd"},
      h("div",{class:"htext"},
        h("div",{class:"catline"},h("span",{class:"dot"}),h("p",{class:"clabel"},cat.label)),
        h("p",{class:"cname",style:nameStyle||""},card.name)),
      h("div",{style:"display:flex;align-items:center;gap:8px;flex:0 0 auto"},
        card.favorite?h("span",{class:"star",html:STAR_F}):null,
        h("button",{class:"info-btn","aria-label":"Card details",onClick:e=>{e.stopPropagation();openDetail(card);},html:INFO_IC})));
  }
  function faceStack(card){
    const cat=CATEGORIES[card.category]||CATEGORIES.other;
    const f=baseFace(card,()=>openCard(card));
    f.appendChild(cardHead(card,cat));
    if(card.number)f.appendChild(h("div",{class:"foot"},
      h("p",{class:"cnum"},h("b",{},"No."),card.number)));
    return f;
  }
  function listRow(card){
    const cat=CATEGORIES[card.category]||CATEGORIES.other;
    const row=h("div",{class:"row",role:"button",tabindex:"0",onClick:()=>openCard(card),
        onKeydown:e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openCard(card);}}},
      h("div",{class:"spine"}),
      h("div",{class:"ric",html:ICON(card.category)}),
      h("div",{class:"rmid"},
        h("p",{class:"rname"},card.name),
        h("p",{class:"rlabel"},cat.label)),
      h("div",{style:"text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px"},
        card.favorite?h("span",{class:"star",html:STAR_F}):null,
        card.number?h("span",{class:"rnum"},card.number):null),
      h("button",{class:"chev","aria-label":"Card details",onClick:e=>{e.stopPropagation();openDetail(card);},
        html:INFO_IC})
    );
    row.style.setProperty('--accent',cat.hue);
    row.style.setProperty('--grad',ricGrad(cat.hue));
    return row;
  }

  // ---------- layout renderers ----------
  function renderStack(content,list){
    const stack=h("div",{class:"stack"});
    list.forEach((c,i)=>{const f=faceStack(c);f.style.zIndex=String(i+1);stack.appendChild(f);});
    content.appendChild(stack);
  }
  function renderList(content,list){
    const wrap=h("div",{class:"list"});
    list.forEach(c=>wrap.appendChild(listRow(c)));
    content.appendChild(wrap);
  }

  function render(){
    // segmented
    [...$("#seg").children].forEach(b=>b.setAttribute("data-on",String(b.dataset.mode===mode)));
    // chips
    const used=CAT_KEYS.filter(k=>cards.some(c=>c.category===k));
    if(activeCat!=="all" && !used.includes(activeCat))activeCat="all";
    const chips=$("#chips");chips.innerHTML="";
    const mk=(key,label)=>h("button",{class:"chip","data-on":String(activeCat===key),onClick:()=>{activeCat=key;render();}},label);
    chips.appendChild(mk("all","All"));
    used.forEach(k=>chips.appendChild(mk(k,CATEGORIES[k].label)));
    // content
    const content=$("#content");content.innerHTML="";
    const list=visible();
    if(list.length===0){
      content.appendChild(h("div",{class:"empty"},
        h("div",{class:"box",html:'<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'}),
        h("p",{style:"margin-top:14px"}, cards.length?"No cards match.":"Your wallet is empty."),
        cards.length
          ? h("button",{onClick:()=>{query="";activeCat="all";const _sb=$("#searchInput");if(_sb)_sb.value="";render();}},"Clear search")
          : h("button",{onClick:()=>openAdd()},"Add your first card")));
      return;
    }
    maybeBackupBanner(content);
    content.appendChild(h("div",{style:"display:flex;align-items:center;justify-content:space-between;margin:26px 0 12px"},
      h("p",{class:"eyebrow",style:"margin:0"}, mode==="stack"?"Your wallet":"All cards"),
      h("button",{class:"arrange-btn",onClick:openArrange},h("span",{html:ARRANGE_IC}),settings.sortMode==="custom"?"Custom order":"Most used")));
    if(mode==="list")renderList(content,list);
    else renderStack(content,list);
  }

  function maybeBackupBanner(content){
    const now=Date.now();
    if(!(cards.length>0 && (now-(settings.lastBackup||0)>14*864e5) && now>(settings.snoozeUntil||0))) return;
    content.appendChild(h("div",{class:"backup-banner"},
      h("div",{style:"flex:1;min-width:0"},
        h("p",{style:"margin:0;font-weight:600;font-size:13.5px;color:var(--text)"},"Back up your wallet"),
        h("p",{style:"margin:3px 0 0;font-size:12px;color:var(--muted);line-height:1.4"},"Your cards live only on this device. Save a backup file so you don't lose them.")),
      h("button",{class:"banner-go",onClick:exportBackup},"Back up"),
      h("button",{class:"banner-x","aria-label":"Dismiss",html:closeIcon,onClick:async()=>{settings.snoozeUntil=Date.now()+7*864e5;await saveSettings();render();}})));
  }

  function openArrange(){
    const wrapList=h("div",{class:"reorder-list"});
    let workingIds=sortCards(cards.slice()).map(c=>String(c.id));
    async function persistOrder(){for(let i=0;i<workingIds.length;i++){const c=cards.find(x=>String(x.id)===workingIds[i]);if(c){c.order=i;await dbPut(c);}}}
    function enableDrag(){
      // Smooth reorder: the dragged row lifts and tracks the pointer (instant,
      // no transition), while the other rows slide to open a gap (transitioned).
      // The DOM is only re-sequenced once, on drop, so nothing jumps mid-drag.
      wrapList.querySelectorAll(".drag-handle").forEach(handle=>{
        const row=handle.closest(".reorder-row");if(!row)return;
        handle.addEventListener("pointerdown",(e)=>{
          e.preventDefault();
          const rows=[...wrapList.querySelectorAll(".reorder-row")];
          const startIndex=rows.indexOf(row);
          const rects=rows.map(r=>r.getBoundingClientRect());
          const step=rows.length>1?(rects[1].top-rects[0].top):(rects[0].height+8);
          const startY=e.clientY;
          let newIndex=startIndex,done=false;
          row.classList.add("dragging");
          const move=(ev)=>{
            const dy=ev.clientY-startY;
            row.style.transform="translateY("+dy+"px)";
            const center=rects[startIndex].top+rects[startIndex].height/2+dy;
            let ni=0;
            rows.forEach((r,i)=>{ if(i!==startIndex && center>rects[i].top+rects[i].height/2) ni++; });
            if(ni!==newIndex){
              newIndex=ni;
              rows.forEach((r,i)=>{
                if(i===startIndex)return;
                let s=0;
                if(startIndex<newIndex && i>startIndex && i<=newIndex) s=-step;
                else if(startIndex>newIndex && i>=newIndex && i<startIndex) s=step;
                r.style.transform = s ? "translateY("+s+"px)" : "";
              });
            }
          };
          const up=()=>{
            if(done)return;done=true;
            document.removeEventListener("pointermove",move);
            document.removeEventListener("pointerup",up);
            document.removeEventListener("pointercancel",up);
            // commit the new order in one go, with transitions off so it doesn't slide
            rows.forEach(r=>r.style.transition="none");
            const ids=rows.map(r=>r.dataset.id);
            const [moved]=ids.splice(startIndex,1); ids.splice(newIndex,0,moved);
            workingIds=ids;
            ids.forEach(id=>{ const r=rows.find(x=>x.dataset.id===id); if(r)wrapList.appendChild(r); });
            rows.forEach(r=>{r.style.transform="";});
            row.classList.remove("dragging");
            requestAnimationFrame(()=>rows.forEach(r=>{r.style.transition="";}));
            persistOrder().then(()=>{sortNow();render();});
          };
          document.addEventListener("pointermove",move);
          document.addEventListener("pointerup",up);
          document.addEventListener("pointercancel",up);
        });
      });
    }
    function paint(){
      wrapList.innerHTML="";const byId=new Map(cards.map(c=>[String(c.id),c]));
      workingIds.forEach(id=>{const c=byId.get(id);if(!c)return;const cat=CATEGORIES[c.category]||CATEGORIES.other;
        wrapList.appendChild(h("div",{class:"reorder-row","data-id":String(id)},
          h("div",{style:`background:${grad(cat.hue)};width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:#fff;flex:0 0 auto`,html:ICON(c.category)}),
          h("div",{style:"flex:1;min-width:0"},
            h("p",{class:"rname",style:"font-size:14px"},(c.favorite?"★ ":"")+c.name),
            h("p",{class:"rlabel"},cat.label)),
          settings.sortMode==="custom"
            ? h("div",{class:"drag-handle","aria-label":"Drag to reorder",html:DRAG_IC})
            : h("span",{class:"rnum",style:"color:var(--faint)"},(c.uses||0)+"×")));
      });
      if(settings.sortMode==="custom")enableDrag();
    }
    const seg=h("div",{class:"mini-seg"},
      h("button",{"data-on":String(settings.sortMode==="used"),onClick:async()=>{settings.sortMode="used";await saveSettings();workingIds=sortCards(cards.slice()).map(c=>String(c.id));sync();paint();sortNow();render();}},"Most used"),
      h("button",{"data-on":String(settings.sortMode==="custom"),onClick:async()=>{settings.sortMode="custom";await persistOrder();await saveSettings();sync();paint();sortNow();render();}},"Custom"));
    function sync(){const bs=seg.children;bs[0].setAttribute("data-on",String(settings.sortMode==="used"));bs[1].setAttribute("data-on",String(settings.sortMode==="custom"));}
    paint();
    sheet(
      h("div",{class:"sheet-bar"},
        h("h2",{style:"font-size:17px;margin:0;font-weight:600"},"Arrange cards"),
        h("button",{style:"color:var(--muted)","aria-label":"Close",html:closeIcon,onClick:closeModal})),
      h("p",{style:"font-size:12.5px;color:var(--muted);margin:2px 0 12px;line-height:1.5"},"“Most used” keeps your frequent and pinned (★) cards on top automatically. Switch to “Custom” to drag every card into the exact order you want."),
      seg, wrapList
    );
  }

  // ---------- modals ----------
  let modalReturnFocus=null;
  function trapModal(overlay,label){
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    if(label)overlay.setAttribute("aria-label",label);
    const SEL='button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    overlay.addEventListener("keydown",e=>{
      if(e.key!=="Tab")return;
      const f=[...overlay.querySelectorAll(SEL)].filter(el=>!el.disabled&&el.offsetParent!==null);
      if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey){if(document.activeElement===first||!overlay.contains(document.activeElement)){e.preventDefault();last.focus();}}
      else{if(document.activeElement===last||!overlay.contains(document.activeElement)){e.preventDefault();first.focus();}}
    });
    if(!modalReturnFocus)modalReturnFocus=document.activeElement;
    requestAnimationFrame(()=>{const el=overlay.querySelector(SEL);if(el)try{el.focus();}catch(_){}});
  }
  function closeModal(){releaseWake();$("#modalRoot").innerHTML="";const r=modalReturnFocus;modalReturnFocus=null;if(r)try{r.focus();}catch(_){}}
  function sheet(...children){
    const root=$("#modalRoot");
    const overlay=h("div",{class:"overlay",onClick:e=>{if(e.target===overlay)closeModal();}});
    overlay.appendChild(h("div",{class:"sheet"},...children));
    root.innerHTML="";root.appendChild(overlay);
    const head=overlay.querySelector("h2");
    trapModal(overlay,head?head.textContent:"Dialog");
  }

  function openDetail(card){
    const cat=CATEGORIES[card.category]||CATEGORIES.other;
    const face=baseFace(card,()=>{});face.classList.add("detail-face");face.removeAttribute("role");face.removeAttribute("tabindex");
    face.appendChild(h("div",{class:"hd"},
      h("div",{class:"htext"},
        h("div",{class:"catline"},h("span",{class:"dot"}),h("p",{class:"clabel"},cat.label)),
        h("p",{class:"cname",style:"font-size:21px"},card.name))));
    if(card.image)face.appendChild(h("div",{class:"mid"},h("img",{class:"photo",src:imgURL(card),alt:""})));
    const holder=h("div",{class:"holder"});
    const codeCard=h("div",{class:"code-card"},holder,h("p",{class:"digits"},card.number||"-"));
    setTimeout(()=>renderCode(holder,card,70),0);
    const typeLabel = card.format==="QR" ? "QR code" : "Barcode";
    const infoRow=(k,v,mono)=>h("div",{class:"info-row"},h("span",{class:"k"},k),h("span",{class:"v"+(mono?" mono":"")},v));
    const info=h("div",{class:"info-list"},
      infoRow("Category",cat.label),
      card.number?infoRow("Number",card.number,true):null,
      infoRow("Type",typeLabel),
      card.notes?infoRow("Notes",card.notes):null);
    const star=card.favorite
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#C9971E" stroke="#C9971E" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
    sheet(
      h("div",{class:"sheet-bar"},
        h("button",{style:"color:var(--muted)","aria-label":"Close",onClick:closeModal,
          html:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>'}),
        h("div",{class:"tools"},
          h("button",{"aria-label":"Pin",html:star,onClick:async()=>{card.favorite=!card.favorite;try{await dbPut(card);}catch(err){card.favorite=!card.favorite;toast("Couldn't save. Storage may be full.");return;}sortNow();render();openDetail(card);}}),
          h("button",{"aria-label":"Edit",html:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',onClick:()=>openForm(card)}),
          h("button",{"aria-label":"Delete",style:"color:var(--danger)",html:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
            onClick:async()=>{if(confirm("Delete “"+card.name+"”?")){try{await dbDelete(card.id);}catch(err){toast("Couldn't delete. Storage error.");return;}dropURL(card.id);cards=cards.filter(c=>c.id!==card.id);closeModal();render();toast("Card deleted");}}}))),
      face, codeCard, info,
      h("button",{class:"primary",onClick:()=>openCard(card)},h("span",{html:SHOW_IC}),"Show full screen")
    );
    acquireWake(); // a scannable barcode is visible here too - keep the screen lit
  }

  let wakeLock=null;
  async function acquireWake(){try{if("wakeLock" in navigator){wakeLock=await navigator.wakeLock.request("screen");}}catch(e){}}
  function releaseWake(){try{wakeLock&&wakeLock.release();}catch(e){}wakeLock=null;}
  function openCard(card){
    card.uses=(card.uses||0)+1;dbPut(card).catch(()=>{card.uses=Math.max(0,(card.uses||0)-1);});sortNow();render();
    const cat=CATEGORIES[card.category]||CATEGORIES.other;
    const front=h("div",{class:"flip-front"});
    front.style.background=grad(cat.hue);cardVars(front,cat.hue);
    front.appendChild(h("div",{class:"art",html:artSVG(card.category)}));
    front.appendChild(h("div",{class:"hd"},
      h("div",{class:"htext"},
        h("div",{class:"catline"},h("span",{class:"dot"}),h("p",{class:"clabel"},cat.label)),
        h("p",{class:"cname",style:"font-size:19px"},card.name))));
    if(card.image)front.appendChild(h("div",{class:"mid"},h("img",{class:"photo",src:imgURL(card),alt:""})));
    const holder=h("div",{class:"flip-holder"});
    const back=h("div",{class:"flip-back"},h("div",{class:"punch",style:`background:${shade(cat.hue,-18)}`}),h("p",{class:"flip-name"},card.name),holder,h("p",{class:"flip-digits"},card.number||"-"));
    // Open already showing the barcode (the reason you tapped the card); "Flip" reveals the face.
    const inner=h("div",{class:"flip-inner flipped"},front,back);
    const stage=h("div",{class:"flip-stage"},inner);
    const tools=h("div",{class:"flip-tools"},
      h("button",{class:"flip-tool",onClick:()=>inner.classList.toggle("flipped")},h("span",{html:FLIP_IC}),"Flip"),
      h("button",{class:"flip-tool",onClick:()=>{closeCard();openShow(card);}},h("span",{html:SHOW_IC}),"Enlarge"),
      h("button",{class:"flip-tool",onClick:()=>{closeCard();openDetail(card);}},h("span",{html:INFO_IC}),"Details"));
    const overlay=h("div",{class:"flip-overlay",style:`background:radial-gradient(90% 56% at 50% 34%, ${mix(cat.hue,'#000000',.25)}, ${mix(cat.hue,'#000000',.66)})`,onClick:e=>{if(e.target===overlay)closeCard();}},
      h("div",{class:"spill"}),
      h("button",{class:"flip-close","aria-label":"Close",html:closeIcon,onClick:()=>closeCard()}),
      stage, tools, h("p",{class:"flip-hint"},"Won’t scan? Tap Enlarge for a bigger code."));
    $("#modalRoot").innerHTML="";$("#modalRoot").appendChild(overlay);trapModal(overlay,card.name||"Card");
    setTimeout(()=>renderCode(holder,card,86),0);
    acquireWake();
    function closeCard(){releaseWake();closeModal();}
  }
  function openShow(card){
    const holder=h("div",{class:"holder"});
    const screen=h("div",{class:"show"},
      h("button",{class:"close","aria-label":"Close",html:closeIcon,onClick:closeShow}),
      h("p",{class:"nm"},card.name), holder,
      h("p",{class:"digits"},card.number||"-"),
      h("button",{class:"show-details",onClick:()=>{closeShow();openDetail(card);}},"Details & edit"),
      h("p",{class:"hint"},"Keep screen bright · tap ✕ to close"));
    $("#modalRoot").innerHTML="";$("#modalRoot").appendChild(screen);trapModal(screen,card.name||"Card");
    setTimeout(()=>renderCode(holder,card,150),0);
    acquireWake();
    try{screen.requestFullscreen&&screen.requestFullscreen();}catch(e){}
    function closeShow(){releaseWake();try{document.fullscreenElement&&document.exitFullscreen();}catch(e){}closeModal();}
  }

  function openAdd(){
    const choice=(icon,title,sub,onClick,rec)=>h("button",{class:"add-choice"+(rec?" rec":""),onClick},
      h("span",{class:"add-ic",html:icon}),
      h("span",{class:"add-mid"},
        h("p",{class:"add-t"},title,rec?h("span",{class:"rec-tag"},"Fastest"):null),
        h("p",{class:"add-s"},sub)),
      h("span",{class:"add-chev",html:CHEV_R}));
    sheet(
      h("div",{class:"sheet-bar"},
        h("h2",{style:"font-size:18px;margin:0;font-weight:600"},"Add a card"),
        h("button",{style:"color:var(--muted)","aria-label":"Close",html:closeIcon,onClick:closeModal})),
      choice(CAM_IC,"Scan with camera","Point at the barcode and we fill the number and type for you.",()=>openScanner((v,f)=>openForm({number:v,format:f})),true),
      choice(IMG_IC,"Use a photo","Read a barcode from a screenshot or gallery picture.",()=>pickPhoto()),
      choice(TYPE_IC,"Enter by hand","Type the number from the card yourself.",()=>openForm(null))
    );
  }
  function pickPhoto(){
    const inp=h("input",{type:"file",accept:"image/*",hidden:true,onChange:e=>{const f=e.target.files&&e.target.files[0];inp.remove();if(f)decodeImageFile(f);}});
    document.body.appendChild(inp);
    // Don't detach on a timer - that discards the picker's selection on many mobile WebViews.
    // The change handler removes it; this only cleans up after the picker closes if the user cancels.
    const cleanup=()=>{window.removeEventListener("focus",cleanup);setTimeout(()=>{if(inp.isConnected)inp.remove();},1000);};
    window.addEventListener("focus",cleanup);
    inp.click();
  }
  function decodeImageFile(file){
    const url=URL.createObjectURL(file);
    try{
      const rd=new ZXing.BrowserMultiFormatReader();
      rd.decodeFromImageUrl(url).then(res=>{URL.revokeObjectURL(url);const f=mapZXing(res.getBarcodeFormat());openForm({number:res.getText(),format:f,image:file});toast("Found a "+fmtLabel(f)+" code");})
        .catch(()=>{URL.revokeObjectURL(url);toast("No barcode found. Enter it manually.");openForm({image:file});});
    }catch(e){URL.revokeObjectURL(url);toast("Couldn't read that image");openForm({image:file});}
  }
  function openForm(existing){
    const base={id:null,name:"",category:"loyalty",format:"CODE128",number:"",notes:"",image:null,favorite:false};
    const card={...base,...(existing||{})};
    let pending=card.image||null;
    const nameI=h("input",{id:"f-name",type:"text",value:card.name,placeholder:"e.g. Equinox",maxlength:"40"});
    const numI=h("input",{id:"f-number",type:"text",class:"mono",value:card.number,placeholder:"Digits under the barcode"});
    const numLabel=h("label",{for:"f-number"},"Barcode number");
    const fmtS=h("select",{id:"f-type"},...FORMATS.map(f=>{const o=h("option",{value:f.v},f.label);if(f.v===card.format)o.selected=true;return o;}));
    const notesI=h("textarea",{id:"f-notes",rows:"2",placeholder:"e.g. member since 2019, home branch"});notesI.value=card.notes;
    const cats=h("div",{class:"cats"});let chosen=card.category;
    CAT_KEYS.forEach(k=>{const b=h("button",{class:"catopt","data-on":String(k===chosen),onClick:()=>{chosen=k;[...cats.children].forEach((c,i)=>c.setAttribute("data-on",String(CAT_KEYS[i]===chosen)));}},CATEGORIES[k].label);b.style.setProperty('--accent',CATEGORIES[k].hue);cats.appendChild(b);});
    const photo=h("label",{class:"photo-drop"},
      h("span",{html:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'}),
      h("span",{id:"ptext"}, pending?"Photo added. Tap to replace.":"Add a photo of the card"),
      h("input",{type:"file",accept:"image/*",hidden:true,onChange:e=>{const f=e.target.files&&e.target.files[0];if(f){pending=f;$("#ptext").textContent="Photo added. Tap to replace.";}}}));
    let autoFmt = !(existing && existing.format);
    const prev=h("div",{class:"code-preview",style:"display:none"});
    // The exact symbology (Code 128, EAN-13, …) is detected automatically and hidden behind
    // a "Change" link, so a normal user only ever sees "Barcode" or "QR code".
    const typeName=(v)=> v==="QR" ? "QR code" : "Barcode";
    const typeLabel=h("span",{class:"type-name"},typeName(fmtS.value));
    const typeWrap=h("div",{class:"field",style:"display:none;margin-top:10px"},h("label",{for:"f-type"},"Barcode type (advanced)"),fmtS);
    const typeRow=h("div",{class:"type-row"},h("span",{},"Code type:"),typeLabel,
      h("button",{class:"type-change",type:"button",onClick:()=>{typeWrap.style.display=(typeWrap.style.display==="none"?"block":"none");}},"Change"));
    function syncTypeName(){typeLabel.textContent=typeName(fmtS.value);numLabel.textContent=fmtS.value==="QR"?"Code content":"Barcode number";}
    function updatePreview(){const v=numI.value.trim();if(!v){prev.style.display="none";return;}prev.style.display="flex";renderCode(prev,{number:v,format:fmtS.value},56);}
    numI.addEventListener("input",()=>{if(autoFmt){const d=detectFormat(numI.value);if(d)fmtS.value=d;}syncTypeName();updatePreview();});
    fmtS.addEventListener("change",()=>{autoFmt=false;syncTypeName();updatePreview();});
    let saving=false;
    const save=async()=>{
      if(saving)return;
      const name=nameI.value.trim();if(!name){toast("Give the card a name");nameI.focus();return;}
      let fmt=fmtS.value; const num=(fmt==="QR")?numI.value.trim():numI.value.replace(/\s+/g,"");
      if(num && !validFor(num,fmt)){
        if(fmt!=="CODE128" && validFor(num,"CODE128")){ if(confirm("That number isn’t a valid "+fmtLabel(fmt)+". Save it as a Code 128 barcode instead?")){fmt="CODE128";} else {return;} }
        else if(confirm("That value can’t be encoded as a "+fmtLabel(fmt)+". Save it as a QR code instead?")){ fmt="QR"; }
        else { return; }
      }
      saving=true;
      const rec={id:card.id||uid(),name,category:chosen,format:fmt,number:num,notes:notesI.value.trim(),image:pending||null,favorite:!!card.favorite,uses:card.uses||0,order:card.order};
      try{
        await dbPut(rec);dropURL(rec.id);
        const i=cards.findIndex(c=>c.id===rec.id);if(i>=0)cards[i]=rec;else cards.push(rec);
        // Clear any active search/filter so the saved card is always visible afterward.
        closeModal();query="";activeCat="all";const _sb=$("#searchInput");if(_sb)_sb.value="";
        sortNow();render();toast(card.id?"Card updated":"Card added");
      }catch(e){saving=false;toast("Couldn't save the card");}
    };
    sheet(
      h("div",{class:"sheet-bar"},
        h("h2",{style:"font-size:17px;margin:0;font-weight:600"}, card.id?"Edit card":"Add card"),
        h("button",{style:"color:var(--muted)","aria-label":"Close",html:closeIcon,onClick:closeModal})),
      h("button",{class:"ghost",style:"margin-top:4px",onClick:()=>openScanner((value,fmt)=>{numI.value=value;if(fmt){fmtS.value=fmt;autoFmt=false;}updatePreview();toast("Scanned "+value);})},
        h("span",{html:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>'}),"Scan barcode"),
      h("div",{class:"field"},h("label",{for:"f-name"},"Card name"),nameI),
      h("div",{class:"field"},h("label",{},"Category"),cats),
      h("div",{class:"field"},numLabel,numI),
      typeRow, typeWrap,
      h("div",{class:"field"},h("label",{},"Preview"),prev),
      h("div",{class:"field"},h("label",{},"Front photo (optional)"),photo),
      h("div",{class:"field"},h("label",{for:"f-notes"},"Notes"),notesI),
      h("button",{class:"primary",onClick:save}, card.id?"Save changes":"Add to wallet")
    );
    syncTypeName();updatePreview();
  }
  let reader=null;
  function openScanner(onResult){
    const video=h("video",{playsinline:true,muted:true});
    const errBox=h("div",{class:"cam-err",style:"display:none"});
    const screen=h("div",{class:"cam-screen"},
      video,
      h("div",{class:"cam-frame"}),
      h("div",{class:"cam-bar"},
        h("span",{style:"font-weight:600"},"Scan barcode"),
        h("button",{style:"color:#fff","aria-label":"Close",html:closeIcon,onClick:stop})),
      h("p",{class:"cam-tip"},"Point at the barcode on your card"),
      errBox);
    $("#modalRoot").appendChild(screen);
    if(!window.isSecureContext){showErr("Scanning needs a secure page (https or localhost). You can still type the number in by hand.");return;}
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){showErr("This browser can't open the camera here. Type the number in instead.");return;}
    try{
      try{reader&&reader.reset();}catch(_){}reader=new ZXing.BrowserMultiFormatReader();
      const handle=(result)=>{if(result){const value=result.getText();const fmt=mapZXing(result.getBarcodeFormat());stop();onResult(value,fmt);}};
      reader.decodeFromConstraints({video:{facingMode:{ideal:"environment"}}},video,handle)
        .catch(()=>reader.decodeFromVideoDevice(null,video,handle)
          .catch(()=>showErr("Couldn't access the camera. Check permissions, or type the number in by hand.")));
    }catch(e){showErr("Scanner unavailable. Type the number in instead.");}
    function showErr(msg){errBox.style.display="flex";errBox.textContent=msg;}
    function stop(){try{reader&&reader.reset();}catch(e){}reader=null;screen.remove();}
  }
  function mapZXing(fmtEnum){try{const B=ZXing.BarcodeFormat;const m={[B.QR_CODE]:"QR",[B.EAN_13]:"EAN13",[B.EAN_8]:"EAN8",[B.UPC_A]:"UPC",[B.CODE_39]:"CODE39",[B.CODE_128]:"CODE128"};return m[fmtEnum]||"CODE128";}catch(e){return "CODE128";}}

  function blobToDataURL(blob){return new Promise((res)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>res(null);r.readAsDataURL(blob);});}
  async function dataURLToBlob(d){const r=await fetch(d);return await r.blob();}
  async function exportBackup(){
    const out=[];let failed=0;
    for(const c of cards){let image=null;if(c.image){image=await blobToDataURL(c.image);if(image==null)failed++;}out.push({id:c.id,name:c.name,category:c.category,format:c.format,number:c.number,notes:c.notes,favorite:c.favorite,uses:c.uses||0,order:c.order,image});}
    const blob=new Blob([JSON.stringify({app:"wallet",version:2,cards:out},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="wallet-backup.json";a.click();URL.revokeObjectURL(a.href);
    settings.lastBackup=Date.now();await saveSettings();render();
    toast(failed?("Backup saved, but "+failed+" card photo"+(failed>1?"s":"")+" couldn't be included"):"Backup saved to your device");
  }
  async function importBackup(file){
    let list;
    try{const data=JSON.parse(await file.text());list=Array.isArray(data)?data:data.cards;if(!Array.isArray(list))throw 0;}
    catch(e){toast("Couldn't read that backup file");return;}
    if(!list.length){toast("That backup has no cards in it");return;}
    if(!confirm("Import "+list.length+" cards? This replaces what's here now."))return;
    // Rebuild every record in memory FIRST, so a malformed file can't wipe the existing wallet.
    const recs=[];const seenIds=new Set();
    for(const c of list){
      let image=null;
      if(c.image){try{image=await dataURLToBlob(c.image);}catch(_){image=null;}}
      let id=c.id||uid();if(seenIds.has(String(id)))id=uid();seenIds.add(String(id));
      recs.push({id,name:c.name||"Card",category:c.category||"other",format:c.format||"CODE128",number:c.number||"",notes:c.notes||"",favorite:!!c.favorite,uses:c.uses||0,order:c.order,image});
    }
    try{
      await dbReplaceAll(recs);
      urlCache.forEach(u=>URL.revokeObjectURL(u));urlCache.clear();
      cards=recs.slice();
      sortNow();render();toast("Imported "+cards.length+" cards");
    }catch(e){cards=await dbGetAll();sortNow();render();toast("Import failed. Nothing changed.");}
  }

  function hideSplash(){const s=$("#splash");if(s){s.classList.add("hide");setTimeout(()=>{s&&s.remove();},500);}}
  async function init(){
    setTimeout(hideSplash,4000);
    try{_db=await openDB();}
    catch(e){$("#content").innerHTML="";$("#content").appendChild(h("p",{style:"color:var(--muted);margin-top:30px;line-height:1.5"},"Storage isn't available in this context. Open the app from a hosted page (https or localhost) so it can save your cards on this device."));["#addBtn","#exportBtn","#importBtn","#searchInput","#seg","#chips"].forEach(s=>{const el=$(s);if(el){el.setAttribute("aria-disabled","true");el.style.opacity=".4";el.style.pointerEvents="none";}});const _sb=$("#searchInput");if(_sb)_sb.disabled=true;hideSplash();return;}
    cards=await dbGetAll();
    const saved=await metaGet("settings");
    if(saved)settings=Object.assign(settings,saved);else{settings.lastBackup=Date.now();await saveSettings();}
    try{if(navigator.storage&&navigator.storage.persist){await navigator.storage.persist();}}catch(e){}
    sortNow();render();
    hideSplash();
    $("#seg").addEventListener("click",e=>{const b=e.target.closest("button");if(b){mode=b.dataset.mode;render();}});
    $("#addBtn").addEventListener("click",()=>openAdd());
    $("#searchInput").addEventListener("input",e=>{query=e.target.value;render();});
    $("#exportBtn").addEventListener("click",exportBackup);
    $("#importBtn").addEventListener("click",()=>$("#importInput").click());
    $("#importInput").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];if(f)importBackup(f);e.target.value="";});
    document.addEventListener("keydown",e=>{
      if(e.key!=="Escape")return;
      const _cam=$(".cam-screen");if(_cam){try{reader&&reader.reset();}catch(_){}reader=null;_cam.remove();return;}
      if($(".show")||$(".flip-overlay")){releaseWake();try{document.fullscreenElement&&document.exitFullscreen();}catch(_){}}
      if($("#modalRoot").children.length)closeModal();
    });
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&($(".show")||$(".flip-overlay")))acquireWake();});
    document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&$(".show")){releaseWake();closeModal();}});
  }
  init();
})();
