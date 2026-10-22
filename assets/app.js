/* Static explorer. All analytical results are exported from the original R algorithms. */
(() => {
  'use strict';
  const D = window.CHANGHUA_DATA;
  const $ = id => document.getElementById(id);
  const state = {lang: 'zh', metric: 'betweenness', mode: 'original', selected: 24};
  const translations = {
    skip:['跳至路網分析','Skip to network explorer'], archive:['2021 研究典藏','2021 RESEARCH ARCHIVE'],
    eyebrow:['彰化縣 · 公車路網研究','CHANGHUA COUNTY · BUS NETWORK RESEARCH'],
    title:['一張路網，26 個鄉鎮的連結。','One network. 26 connected townships.'],
    subtitle:['從地方到整體，探索公車路線如何串起彰化。','Explore the connections that shape Changhua’s bus network.'],
    townships:['鄉鎮節點','Township nodes'], connections:['網絡連結','Network edges'], sequences:['原始整理序列','Curated sequences'],
    betweenness:['中介中心性','Betweenness'], eigen:['特徵向量中心性','Eigenvector'], constraint:['結構限制','Constraint'],
    network:['網絡模式','Network'],original:['既有路網 · 無加權','Existing · Unweighted'],weighted:['既有路網 · 路線數加權','Existing · Route-weighted'],full:['假設補線 · 無加權','Proposed links · Unweighted'],
    mapTitle:['鄉鎮連結地圖','Township network'],reset:['全縣視野','Reset view'],mapCaption:['2021 年 6 月 · 鄉鎮代表點連結','June 2021 · Township representative points'],
    proposed:['假設新增連結','Proposed links'],mapHint:['點選鄉鎮查看連結 · 滾輪縮放 · 拖曳移動','Select a township · Scroll to zoom · Drag to pan'],offline:['離線地圖','OFFLINE MAP'],
    rankingEyebrow:['NETWORK POSITION','NETWORK POSITION'],ranking:['鄉鎮指標排名','Township rankings'],baseline:['無加權基準','Unweighted baseline'],selected:['鄉鎮觀察','TOWNSHIP FOCUS'],
    chooseTown:['選擇鄉鎮','Choose a township'],comparison:['同一鄉鎮，三種網絡','One township, three networks'],neighbors:['直接連結鄉鎮','Direct connections'],
    neighborNote:['數字為原始 Freq 路線權重；＋為假設補線。','Numbers show original Freq weights; + denotes a proposed link.'],
    methodTitle:['關於資料與原版指標定義','Data & original metric definitions'],sourcesTitle:['保留 2021 年的研究基準','Preserving the 2021 baseline'],
    sourcesText:['沿用原專案的 26 個節點、44 條無向連結、人口與代表點座標。Freq 由 68 筆人工整理的路線鄉鎮序列累計而來，代表路線連結次數，不是每日班次。人口資料年份為 2020 年。','The original 26 nodes, 44 undirected edges, population figures and representative coordinates are retained. Freq counts links across 68 manually curated route–township sequences; it is not daily departures. Population figures are from 2020.'],
    scenarioText:['「假設補線」沿用原報告另外加入的 10 條連結，共 54 條邊；只進行無加權分析，不代表當年實際存在的公車服務。','The proposed-link scenario adds the same 10 hypothetical edges as the original report, for 54 edges in total. It is unweighted and does not represent actual 2021 bus services.'],
    definitionTitle:['算法沿用，解讀清楚','Original algorithms, explicit interpretation'],
    definitionText:['中介中心性不做正規化；加權版本保留原作法，以 Freq 直接作為最短路徑成本。特徵向量中心性以最大值縮放為 1；Constraint 沿用 Burt 結構限制係數。所有數值由 R igraph 1.2.11 預先計算。','Betweenness is unnormalized; its weighted version uses Freq directly as shortest-path cost, following the original implementation. Eigenvector centrality is scaled to a maximum of 1. Constraint uses Burt’s measure. All values are precomputed with R igraph 1.2.11.'],
    warning:['注意：原版加權中介中心性會把較高的路線權重視為較高的成本。此次保留算法以重現歷史結果，不能解讀為班次或實際乘車可及性。','Note: the original weighted betweenness treats larger route weights as larger costs. This behavior is preserved for historical reproduction, not as a measure of departures or actual travel accessibility.'],
    mapMethodTitle:['地圖閱讀方式','Reading the map'],
    mapMethodText:['色彩由淺至深表示當前指標由低至高，每次切換會重新縮放色階。線段連接原始鄉鎮代表點，不是實際公車行車軌跡。加權模式以線寬呈現 Freq；橘色虛線代表假設補線。','Light-to-dark color shows low-to-high values of the current metric; the scale resets on each selection. Lines connect original township representative points, not actual bus paths. In weighted mode, line width shows Freq. Orange dashed lines are hypothetical.'],
    snapshotText:['站序資料來源：原專案保存之公共運輸整合資訊流通服務平台 JSON，更新日期 2021-06-20／21。重製未改動人工整理後的邊表。','Stop sequences originate from PTX JSON archived in the original project, updated June 20–21, 2021. The remake retains the manually curated edge table without alteration.'],
    credit:['原研究：劉恒 · 網絡分析期末專案','Original research: Liu Heng · Network Analysis course project'],
    shortOriginal:['無加權','Unweighted'],shortWeighted:['路線數加權','Route-weighted'],shortFull:['假設補線','Proposed links'],
    descBetweenness:['在鄉鎮間最短路徑上擔任橋梁的程度。','How often a township acts as a bridge on shortest paths.'],
    descWeighted:['沿用原版：Freq 作為路徑成本，並非班次或交通可及性。','Original definition: Freq is path cost, not departures or travel accessibility.'],
    descEigen:['與網絡中重要鄉鎮相連的程度。','Connection to other well-connected townships in the network.'],
    descConstraint:['關係集中與冗餘的程度；高值不代表服務較好。','Concentration and redundancy of ties; a higher value does not mean better service.'],
    orderNote:['依數值由高至低排列；不是服務品質評分。','Sorted by value, highest first; not a service-quality score.'],
    edgePlain:['鄉鎮間連結','Township connection'],edgeWeighted:['線寬 ∝ 路線權重','Width ∝ route weight'],
    population:['人口（2020）','Population (2020)'],degree:['直接連結','Direct links'],routes:['路線權重','Route weight'],scenario:['假設補線','Hypothetical link']
  };
  const t = key => translations[key]?.[state.lang === 'zh' ? 0 : 1] ?? key;
  const shortMode = mode => t({original:'shortOriginal',weighted:'shortWeighted',full:'shortFull'}[mode]);
  const name = i => state.lang === 'zh' ? D.nodes[i].nodename : D.nodes[i].en.replace(/ Township| City/g,'');
  const values = (mode = state.mode) => D.metrics[mode].map(row => row[state.metric]);
  const fmt = value => value.toLocaleString(state.lang === 'zh' ? 'zh-TW' : 'en-US',{minimumFractionDigits:state.metric === 'betweenness'?1:3,maximumFractionDigits:state.metric === 'betweenness'?1:3});
  const byName = new Map(D.nodes.map((n,i)=>[n.nodename,i]));
  const byEnglish = new Map(D.nodes.map((n,i)=>[n.en,i]));
  const edges = D.edges.map(e=>({...e,a:byName.get(e.O),b:byName.get(e.D),proposed:false}));
  const extra = D.extraEdges.map(e=>({...e,a:byName.get(e.O),b:byName.get(e.D),proposed:true}));
  const activeEdges = () => state.mode === 'full' ? edges.concat(extra) : edges;
  const map = L.map('map',{zoomControl:false,scrollWheelZoom:true,minZoom:9,maxZoom:15,zoomSnap:0.25,attributionControl:true});
  L.control.zoom({position:'topright'}).addTo(map);
  const boundaryLayer = L.geoJSON(D.boundaries,{style:{color:'#a4bdc0',weight:1,fillColor:'#eaf3ef',fillOpacity:.88}}).addTo(map);
  const edgeLayer = L.layerGroup().addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  const bounds = boundaryLayer.getBounds();
  map.setMaxBounds(bounds.pad(.65));
  const resetMap = () => map.fitBounds(bounds,{paddingTopLeft:[34,24],paddingBottomRight:[34,78],animate:false});
  resetMap();
  map.attributionControl.addAttribution('2021 project boundaries · TWD97');
  let layers = [];
  let markers = [];
  function color(value,min,max){const u=max===min?0:(value-min)/(max-min);const a=[217,237,232],b=[0,127,115];return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*u)).join(',')})`;}
  function connected(){return new Set(activeEdges().filter(e=>e.a===state.selected||e.b===state.selected).flatMap(e=>[e.a,e.b]));}
  function selectTown(i){state.selected=i;updateSelection();renderRanking();renderDetail();announce();}
  boundaryLayer.eachLayer(layer=>{
    const i=byEnglish.get(layer.feature.properties.TOWNENG);
    layer.on('click',()=>{if(i!==undefined)selectTown(i);});
    layers.push({layer,i});
  });
  function drawMap(){
    const v=values(), min=Math.min(...v),max=Math.max(...v);
    layers.forEach(({layer,i})=>{
      if(i===undefined)return;
      layer.setStyle({fillColor:color(v[i],min,max),fillOpacity:.72,color:'#9bbab8',weight:1});
      layer.unbindTooltip();layer.bindTooltip(`${name(i)} · ${t(state.metric)} ${fmt(v[i])}`,{className:'hover-info',sticky:true});
    });
    edgeLayer.clearLayers();markerLayer.clearLayers();markers=[];
    activeEdges().forEach(e=>{
      const a=D.nodes[e.a],b=D.nodes[e.b];
      const line=L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:e.proposed?'#c76a2a':'#244f5d',weight:e.proposed?2:state.mode==='weighted'?1+e.Freq*.38:1.8,opacity:.55,dashArray:e.proposed?'6 6':null}).addTo(edgeLayer);
      line.bindTooltip(`${name(e.a)} ↔ ${name(e.b)}<br>${e.proposed?t('scenario'):`${t('routes')} · ${e.Freq}`}`,{className:'hover-info',sticky:true});
      line.on('click',()=>selectTown(e.a===state.selected?e.b:e.a));
      line.edge=e;
    });
    D.nodes.forEach((n,i)=>{
      const marker=L.circleMarker([n.lat,n.lon],{radius:4.4,color:'#fff',weight:1.7,fillColor:'#183d49',fillOpacity:1}).addTo(markerLayer);
      marker.bindTooltip(name(i),{permanent:true,direction:'right',offset:[7,0],className:'town-label',opacity:1});
      marker.on('click',()=>selectTown(i));markers.push(marker);
    });
    $('legend-title').textContent=t(state.metric);$('legend-min').textContent=fmt(min);$('legend-max').textContent=fmt(max);
    $('edge-legend').textContent=t(state.mode==='weighted'?'edgeWeighted':'edgePlain');
    document.querySelector('.scenario-key').hidden=state.mode!=='full';
    updateSelection();
  }
  function updateSelection(){
    layers.forEach(({layer,i})=>{layer.setStyle({weight:i===state.selected?2.5:1,color:i===state.selected?'#153f4c':'#9bbab8'});});
    edgeLayer.eachLayer(line=>{const e=line.edge;const hit=e.a===state.selected||e.b===state.selected;line.setStyle({opacity:hit?.92:.27});if(hit)line.bringToFront();});
    markers.forEach((marker,i)=>{marker.setStyle({radius:i===state.selected?7:4.2,fillColor:i===state.selected?'#e59648':'#183d49',weight:i===state.selected?2.5:1.5});if(i===state.selected)marker.bringToFront();});
    updateLabels();
  }
  function updateLabels(){const near=connected();markers.forEach((marker,i)=>{const show=map.getZoom()>=11.1||near.has(i)||[24,25,19,23,20,21,22,18].includes(i);if(show)marker.openTooltip();else marker.closeTooltip();});}
  map.on('zoomend',updateLabels);
  function renderRanking(){
    const v=values(), base=values('original');const maximum=Math.max(...v,...base,1e-12);
    const order=D.nodes.map((_,i)=>i).sort((a,b)=>v[b]-v[a]||a-b);
    const container=$('ranking');const oldScroll=container.scrollTop;container.replaceChildren();
    order.forEach((i,rank)=>{
      const button=document.createElement('button');button.type='button';button.className=`rank-row${i===state.selected?' selected':''}`;button.setAttribute('aria-pressed',String(i===state.selected));
      button.setAttribute('aria-label',`${rank+1}. ${name(i)}, ${t(state.metric)} ${fmt(v[i])}`);
      button.innerHTML=`<span class="rank-number">${String(rank+1).padStart(2,'0')}</span><span><span class="rank-town"></span><span class="rank-track"><span class="bar-baseline" style="width:${base[i]/maximum*100}%;${state.mode==='original'?'display:none':''}"></span><span class="bar-current" style="width:${v[i]/maximum*100}%"></span></span></span><span class="rank-value">${fmt(v[i])}</span>`;
      button.querySelector('.rank-town').textContent=name(i);button.addEventListener('click',()=>{selectTown(i);$('town-select').focus({preventScroll:true});});container.append(button);
    });
    container.scrollTop=oldScroll;
    $('rank-mode').textContent=shortMode(state.mode);$('baseline-key').hidden=state.mode==='original';
    $('ranking-note').textContent=t('orderNote');
  }
  function renderDetail(){
    const i=state.selected,n=D.nodes[i];$('detail-name').textContent=name(i);$('detail-en').textContent=state.lang==='zh'?n.en:n.nodename;
    $('town-select').value=String(i);
    $('population').textContent=`${t('population')} ${n.census.toLocaleString()}`;
    const neighbors=activeEdges().filter(e=>e.a===i||e.b===i).sort((a,b)=>b.Freq-a.Freq);
    $('degree').textContent=`${t('degree')} ${neighbors.length}`;
    const all=['original','weighted','full'];const max=Math.max(...all.map(m=>D.metrics[m][i][state.metric]),1e-12);
    $('comparison-bars').replaceChildren();
    all.forEach(mode=>{
      const val=D.metrics[mode][i][state.metric];const row=document.createElement('div');row.className=`comparison-row${mode===state.mode?' is-active':''}`;
      row.innerHTML=`<span>${shortMode(mode)}</span><span class="comparison-track"><span class="comparison-fill" style="width:${val/max*100}%"></span></span><strong>${fmt(val)}</strong>`;$('comparison-bars').append(row);
    });
    $('neighbors').replaceChildren();neighbors.forEach(e=>{const other=e.a===i?e.b:e.a;const b=document.createElement('button');b.type='button';b.className=`neighbor${e.proposed?' proposed':''}`;const label=document.createElement('span');label.textContent=name(other);const weight=document.createElement('b');weight.textContent=e.proposed?'+':e.Freq;b.append(label,weight);b.addEventListener('click',()=>selectTown(other));$('neighbors').append(b);});
  }
  function announce(){$('announcement').textContent=`${t(state.metric)} · ${shortMode(state.mode)} · ${name(state.selected)} ${fmt(values()[state.selected])}`;}
  function render(){
    $('edge-count').textContent=state.mode==='full'?'54':'44';
    $('metric-description').textContent=t(state.metric==='betweenness'?(state.mode==='weighted'?'descWeighted':'descBetweenness'):state.metric==='eigen'?'descEigen':'descConstraint');
    document.querySelectorAll('[data-metric]').forEach(b=>{const active=b.dataset.metric===state.metric;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    drawMap();renderRanking();renderDetail();announce();
  }
  function localize(){
    document.documentElement.lang=state.lang==='zh'?'zh-Hant':'en';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    $('language').innerHTML=state.lang==='zh'?'EN <span aria-hidden="true">↗</span>':'中文 <span aria-hidden="true">↗</span>';
    $('language').setAttribute('aria-label',state.lang==='zh'?'Switch to English':'切換為繁體中文');
    document.title=state.lang==='zh'?'彰化公車網絡圖譜 · 2021':'Changhua Transit Atlas · 2021';
    $('town-select').replaceChildren();D.nodes.forEach((_,i)=>{const option=document.createElement('option');option.value=i;option.textContent=name(i);$('town-select').append(option);});
    render();
  }
  document.querySelectorAll('[data-metric]').forEach(button=>button.addEventListener('click',()=>{state.metric=button.dataset.metric;render();}));
  $('mode').addEventListener('change',()=>{state.mode=$('mode').value;render();});
  $('town-select').addEventListener('change',()=>selectTown(Number($('town-select').value)));
  $('language').addEventListener('click',()=>{state.lang=state.lang==='zh'?'en':'zh';localize();});
  $('reset-map').addEventListener('click',resetMap);
  new ResizeObserver(()=>{map.invalidateSize({pan:false});}).observe($('map'));
  localize();
})();
