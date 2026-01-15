// 核心：DOM 參照、共用狀態、storage、undo/redo、通用 UI helper
(function(){
  const MJ = window.MJ = window.MJ || {};

  // ===== DOM refs =====
  const dom = MJ.dom = {
    seatEls: Array.from(document.querySelectorAll('.seat')),
    winnerOptionsEl: document.getElementById('winnerOptions'),
    loserOptionsEl: document.getElementById('loserOptions'),
    loserBlockEl: document.getElementById('loserBlock'),
    seatPickOptionsEl: document.getElementById('seatPickOptions'),

    seatRenameBtn: document.getElementById('seatRenameBtn'),
    seatAddBtn: document.getElementById('seatAddBtn'),
    seatSubBtn: document.getElementById('seatSubBtn'),
    seatResetBtn: document.getElementById('seatResetBtn'),
    seatDealerBtn: document.getElementById('seatDealerBtn'),

    recordBtn: document.getElementById('recordBtn'),
    clearBtn: document.getElementById('clearBtn'),
    lianzhuangBtn: document.getElementById('lianzhuangBtn'),
    xiadzhuangBtn: document.getElementById('xiadzhuangBtn'),

    pointsInput: document.getElementById('pointsInput'),
    baseInput: document.getElementById('baseInput'),
    perTaiInput: document.getElementById('perTaiInput'),
    autoCalcBtn: document.getElementById('autoCalcBtn'),
    zimoBtn: document.getElementById('zimoBtn'),

    historyList: document.getElementById('historyList'),
    undoHistoryBtn: document.getElementById('undoHistoryBtn'),
    redoHistoryBtn: document.getElementById('redoHistoryBtn'),
    newSessionBtn: document.getElementById('newSessionBtn'),
    deleteAllHistoryBtn: document.getElementById('deleteAllHistoryBtn'),

    handIndicator: document.getElementById('handIndicator'),
    settlementSummaryEl: document.getElementById('settlementSummary'),
    settlementTransfersEl: document.getElementById('settlementTransfers'),

    fanOptionsEl: document.getElementById('fanOptions'),
    fanTotalEl: document.getElementById('fanTotal'),
    fanNameInput: document.getElementById('fanNameInput'),
    fanValueInput: document.getElementById('fanValueInput'),
    fanAddBtn: document.getElementById('fanAddBtn'),
    fanClearBtn: document.getElementById('fanClearBtn'),
    fanSelectedHint: document.getElementById('fanSelectedHint')
  };

  // ===== Shared state =====
  MJ.POS_ORDER = ['east','south','west','north'];

  MJ.scores = MJ.scores || {}; // key=pos

  MJ.domSettings = MJ.domSettings || {
    autoCalcFromFan: false,
    base: 1,
    perTai: 1,
    handNo: 0
  };

  MJ.state = MJ.state || {
    players: [
      {name:'東', points:0},
      {name:'南', points:0},
      {name:'西', points:0},
      {name:'北', points:0}
    ],
    history: [],
    dealer: 'east',
    dealerCount: 0
  };

  MJ.selectedWinnerPos = '';
  MJ.selectedLoserPos = '';
  MJ.selectedSeatPos = '';

  // ===== Undo/Redo (DOM snapshot based) =====
  MJ.domUndoStack = [];
  MJ.domRedoStack = [];
  MJ.DOM_UNDO_LIMIT = 30;
  MJ.DOM_REDO_LIMIT = 30;

  // ===== Helpers =====
  MJ.el = function(id){ return document.getElementById(id); };

  MJ.getSeatByPos = function(pos){
    return document.querySelector(`.seat[data-pos="${pos}"]`);
  };

  MJ.updateScoreDisplay = function(pos){
    const s = document.querySelector(`.seat[data-pos="${pos}"] .score`);
    if(!s) return;
    s.textContent = String(MJ.scores[pos] ?? 0);
  };

  MJ.getDisplayNameFor = function(pos){
    const el = document.querySelector(`.seat[data-pos="${pos}"] .display-name`);
    return el ? el.textContent.trim() : pos;
  };

  MJ.getRoleTextFor = function(pos){
    const s = MJ.getSeatByPos(pos);
    const r = s ? s.querySelector('.role') : null;
    return r ? r.textContent.trim() : pos;
  };

  MJ.isZimoActive = function(){
    return !!(dom.zimoBtn && dom.zimoBtn.classList && dom.zimoBtn.classList.contains('active'));
  };

  MJ.renderOptionGroup = function(container, opts){
    if(!container) return;
    container.innerHTML = '';
    opts.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt-btn' + (opt.selected ? ' selected' : '') + (opt.disabled ? ' disabled' : '');
      b.textContent = opt.label;
      if(opt.disabled){
        b.disabled = true;
      } else {
        b.addEventListener('click', opt.onClick);
      }
      container.appendChild(b);
    });
  };

  MJ.renderOptionGroupsWithTitles = function(container, groups){
    if(!container) return;
    container.innerHTML = '';
    groups.forEach(g => {
      if(!g || !Array.isArray(g.items) || g.items.length === 0) return;
      const wrap = document.createElement('div');
      wrap.className = 'fan-group';
      const title = document.createElement('div');
      title.className = 'fan-group-title';
      title.textContent = g.title || '';
      const groupEl = document.createElement('div');
      groupEl.className = 'option-group';
      wrap.appendChild(title);
      wrap.appendChild(groupEl);
      container.appendChild(wrap);
      MJ.renderOptionGroup(groupEl, g.items);
    });
  };

  // ===== Auto points =====
  MJ.updateHandIndicator = function(){
    if(!dom.handIndicator) return;
    const nextNo = Math.max(0, Number(MJ.domSettings.handNo || 0)) + 1;
    dom.handIndicator.textContent = `第 ${nextNo} 局`;
  };

  MJ.getAutoPoints = function(){
    const base = Math.max(1, Number(MJ.domSettings.base || 1));
    const perTai = Math.max(1, Number(MJ.domSettings.perTai || 1));
    const fanTotal = (typeof MJ.getFanTotal === 'function') ? Math.max(0, Number(MJ.getFanTotal() || 0)) : 0;
    const v = base * perTai * fanTotal;
    return Math.max(1, Math.floor(v));
  };

  MJ.applySettingsToUI = function(){
    if(dom.baseInput) dom.baseInput.value = String(Math.max(1, Number(MJ.domSettings.base || 1)));
    if(dom.perTaiInput) dom.perTaiInput.value = String(Math.max(1, Number(MJ.domSettings.perTai || 1)));

    const enabled = !!MJ.domSettings.autoCalcFromFan;
    if(dom.autoCalcBtn){
      dom.autoCalcBtn.classList.toggle('active', enabled);
      dom.autoCalcBtn.style.background = enabled ? '#ffeeba' : '#fff';
    }
    if(dom.pointsInput){
      dom.pointsInput.disabled = enabled;
    }

    MJ.updateHandIndicator();
    if(enabled && typeof MJ.updatePointsFromFan === 'function'){
      MJ.updatePointsFromFan();
    }
  };

  MJ.incrementHandNo = function(){
    MJ.domSettings.handNo = Math.max(0, Number(MJ.domSettings.handNo || 0)) + 1;
    MJ.updateHandIndicator();
  };

  // ===== Storage =====
  const STORAGE_KEY = 'mj_score_state_v1';
  const DOM_STORAGE_KEY = 'mj_score_dom_v1';

  function isStorageAvailable(storage){
    try{
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    }catch(e){
      return false;
    }
  }

  MJ.localStorageAvailable = (typeof localStorage !== 'undefined') && isStorageAvailable(localStorage);
  MJ.sessionStorageAvailable = (typeof sessionStorage !== 'undefined') && isStorageAvailable(sessionStorage || {});

  let _memoryFallback = null;
  let _memoryFallbackDom = null;

  MJ.saveState = function(){
    const payload = JSON.stringify(MJ.state);
    if(MJ.localStorageAvailable){
      try{ localStorage.setItem(STORAGE_KEY, payload); return; }catch(e){}
    }
    if(MJ.sessionStorageAvailable){
      try{ sessionStorage.setItem(STORAGE_KEY, payload); return; }catch(e){}
    }
    _memoryFallback = payload;
  };

  MJ.loadState = function(){
    try{
      if(MJ.localStorageAvailable){
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw){ MJ.state = JSON.parse(raw); return; }
      }
    }catch(e){}

    try{
      if(MJ.sessionStorageAvailable){
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if(raw){ MJ.state = JSON.parse(raw); return; }
      }
    }catch(e){}

    if(_memoryFallback){
      try{ MJ.state = JSON.parse(_memoryFallback); }catch(e){}
    }
  };

  MJ.getDomHistoryArray = function(){
    const arr = [];
    if(!dom.historyList) return arr;
    Array.from(dom.historyList.children).forEach(row => {
      const r = row;
      arr.push({
        type: r.dataset.type || '',
        winnerPos: r.dataset.winnerPos || '',
        loserPos: r.dataset.loserPos || '',
        seatPos: r.dataset.seatPos || '',
        delta: Number(r.dataset.delta || 0),
        zimoPer: Number(r.dataset.zimoPer || 0),
        handNo: Number(r.dataset.handNo || 0),
        winner: r.dataset.winner || '',
        loser: r.dataset.loser || '',
        points: Number(r.dataset.points || 0),
        fanTotal: Number(r.dataset.fanTotal || 0),
        fanDetail: r.dataset.fanDetail || '',
        dealer: r.dataset.dealer || '',
        time: Number(r.dataset.time || 0),
        text: r.dataset.text || (r.textContent || '')
      });
    });
    return arr;
  };

  MJ.getDomSnapshot = function(){
    const clonedScores = {};
    Object.keys(MJ.scores).forEach(k => { clonedScores[k] = Number(MJ.scores[k] ?? 0); });
    return {
      scores: clonedScores,
      history: MJ.getDomHistoryArray(),
      settings: JSON.parse(JSON.stringify(MJ.domSettings))
    };
  };

  MJ.updateDomHistoryButtons = function(){
    const canUndo = MJ.domUndoStack.length > 0;
    if(dom.undoHistoryBtn) dom.undoHistoryBtn.disabled = !canUndo;
    const canRedo = MJ.domRedoStack.length > 0;
    if(dom.redoHistoryBtn) dom.redoHistoryBtn.disabled = !canRedo;
  };

  MJ.pushDomUndoSnapshot = function(){
    MJ.domUndoStack.push(MJ.getDomSnapshot());
    if(MJ.domUndoStack.length > MJ.DOM_UNDO_LIMIT) MJ.domUndoStack.splice(0, MJ.domUndoStack.length - MJ.DOM_UNDO_LIMIT);
    MJ.domRedoStack.length = 0;
    MJ.updateDomHistoryButtons();
  };

  MJ.restoreDomSnapshot = function(snap){
    if(!snap) return;

    // restore scores
    Object.keys(MJ.scores).forEach(k => { delete MJ.scores[k]; });
    if(snap.scores){
      Object.keys(snap.scores).forEach(k => { MJ.scores[k] = Number(snap.scores[k] ?? 0); });
    }

    if(snap.settings){
      MJ.domSettings = {
        autoCalcFromFan: !!snap.settings.autoCalcFromFan,
        base: Math.max(1, Number(snap.settings.base || 1)),
        perTai: Math.max(1, Number(snap.settings.perTai || 1)),
        handNo: Math.max(0, Number(snap.settings.handNo || 0))
      };
    }
    MJ.applySettingsToUI();

    dom.seatEls.forEach(s => MJ.updateScoreDisplay(s.dataset.pos));

    if(dom.historyList){
      dom.historyList.innerHTML = '';
      (snap.history || []).forEach(it => {
        dom.historyList.appendChild(MJ.createHistoryRowDom(it));
      });
    }

    try{ MJ.saveDomState(); }catch(e){}
    MJ.updateDomHistoryButtons();
    if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
  };

  MJ.undoDomLast = function(){
    const snap = MJ.domUndoStack.pop();
    if(!snap){ alert('沒有可復原的操作'); return; }
    MJ.domRedoStack.push(MJ.getDomSnapshot());
    if(MJ.domRedoStack.length > MJ.DOM_REDO_LIMIT) MJ.domRedoStack.splice(0, MJ.domRedoStack.length - MJ.DOM_REDO_LIMIT);
    MJ.restoreDomSnapshot(snap);
  };

  MJ.redoDomLast = function(){
    const snap = MJ.domRedoStack.pop();
    if(!snap){ alert('沒有可重做的操作'); return; }
    MJ.domUndoStack.push(MJ.getDomSnapshot());
    if(MJ.domUndoStack.length > MJ.DOM_UNDO_LIMIT) MJ.domUndoStack.splice(0, MJ.domUndoStack.length - MJ.DOM_UNDO_LIMIT);
    MJ.restoreDomSnapshot(snap);
  };

  MJ.clearAllDomHistory = function(confirmText){
    if(confirmText){
      if(!confirm(confirmText)) return;
    }
    MJ.pushDomUndoSnapshot();
    if(dom.historyList) dom.historyList.innerHTML = '';
    MJ.domSettings.handNo = 0;
    MJ.applySettingsToUI();
    try{ MJ.saveDomState(); }catch(e){}
    MJ.updateDomHistoryButtons();
    if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
  };

  MJ.saveDomState = function(){
    if(!dom.historyList) return;
    const historyArr = Array.from(dom.historyList.children).map(row => ({
      type: row.dataset.type || '',
      winnerPos: row.dataset.winnerPos || '',
      loserPos: row.dataset.loserPos || '',
      seatPos: row.dataset.seatPos || '',
      delta: Number(row.dataset.delta || 0),
      zimoPer: Number(row.dataset.zimoPer || 0),
      handNo: Number(row.dataset.handNo || 0),
      winner: row.dataset.winner || '',
      loser: row.dataset.loser || '',
      points: Number(row.dataset.points || 0),
      fanTotal: Number(row.dataset.fanTotal || 0),
      fanDetail: row.dataset.fanDetail || '',
      dealer: row.dataset.dealer || '',
      time: Number(row.dataset.time || 0),
      text: row.dataset.text || (row.textContent || '')
    }));

    const payload = JSON.stringify({ scores: MJ.scores, history: historyArr, settings: MJ.domSettings });

    if(MJ.localStorageAvailable){
      try{ localStorage.setItem(DOM_STORAGE_KEY, payload); return; }catch(e){}
    }
    if(MJ.sessionStorageAvailable){
      try{ sessionStorage.setItem(DOM_STORAGE_KEY, payload); return; }catch(e){}
    }
    _memoryFallbackDom = payload;
  };

  MJ.loadDomState = function(){
    let raw = null;
    try{
      if(MJ.localStorageAvailable){
        raw = localStorage.getItem(DOM_STORAGE_KEY);
      }
    }catch(e){ raw = null; }

    try{
      if(!raw && MJ.sessionStorageAvailable){
        raw = sessionStorage.getItem(DOM_STORAGE_KEY);
      }
    }catch(e){ raw = null; }

    if(!raw && _memoryFallbackDom) raw = _memoryFallbackDom;
    if(!raw) return;

    const obj = JSON.parse(raw);

    if(obj && obj.settings){
      MJ.domSettings = {
        autoCalcFromFan: !!obj.settings.autoCalcFromFan,
        base: Math.max(1, Number(obj.settings.base || 1)),
        perTai: Math.max(1, Number(obj.settings.perTai || 1)),
        handNo: Math.max(0, Number(obj.settings.handNo || 0))
      };
    }

    if(obj && obj.scores){
      Object.keys(obj.scores).forEach(k => { MJ.scores[k] = obj.scores[k]; });
    }

    if(obj && Array.isArray(obj.history) && dom.historyList){
      dom.historyList.innerHTML = '';
      obj.history.forEach(h => {
        dom.historyList.appendChild(MJ.createHistoryRowDom(h));
      });
    }
  };

  // ===== History row factory (used across modules) =====
  MJ.createHistoryRowDom = function(entry){
    const tr = document.createElement('tr');

    tr.dataset.type = entry.type || '';
    tr.dataset.winnerPos = entry.winnerPos || '';
    tr.dataset.loserPos = entry.loserPos || '';
    tr.dataset.seatPos = entry.seatPos || '';
    tr.dataset.delta = String(Number(entry.delta || 0));
    tr.dataset.zimoPer = String(Number(entry.zimoPer || 0));
    tr.dataset.handNo = String(Number(entry.handNo || 0));

    tr.dataset.winner = entry.winner || '';
    tr.dataset.loser = entry.loser || '';
    tr.dataset.points = String(entry.points || 0);
    tr.dataset.fanTotal = String(entry.fanTotal || 0);
    tr.dataset.fanDetail = entry.fanDetail || '';
    tr.dataset.dealer = entry.dealer || '';
    tr.dataset.time = String(entry.time || Date.now());
    tr.dataset.text = entry.text || '';

    const tdW = document.createElement('td'); tdW.textContent = entry.winner || '';
    const tdL = document.createElement('td'); tdL.textContent = entry.loser || '';
    const tdP = document.createElement('td'); tdP.textContent = String(entry.points || 0);
    if((entry.type === 'zimo' || entry.loser === '自摸') && Number(entry.zimoPer || 0) > 0){
      tdP.title = `每家 ${entry.zimoPer}`;
    }

    const tdF = document.createElement('td');
    tdF.textContent = (entry.fanTotal && Number(entry.fanTotal) > 0) ? `${entry.fanTotal}台` : '';
    if(entry.fanDetail) tdF.title = entry.fanDetail;

    const tdD = document.createElement('td'); tdD.textContent = entry.dealer || '';

    const tdH = document.createElement('td');
    tdH.dataset.col = 'handNo';
    tdH.textContent = entry.handNo ? String(entry.handNo) : '';

    const tdT = document.createElement('td'); tdT.textContent = entry.time ? new Date(Number(entry.time)).toLocaleString() : '';

    const tdA = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = '編輯';
    editBtn.className = 'row-action';
    editBtn.dataset.action = 'edit';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '刪除';
    delBtn.className = 'row-action';
    delBtn.dataset.action = 'delete';

    tdA.appendChild(editBtn);
    tdA.appendChild(delBtn);

    tr.appendChild(tdW);
    tr.appendChild(tdL);
    tr.appendChild(tdP);
    tr.appendChild(tdF);
    tr.appendChild(tdD);
    tr.appendChild(tdH);
    tr.appendChild(tdT);
    tr.appendChild(tdA);

    return tr;
  };

  MJ.addHistoryEntryDom = function(entry){
    if(!dom.historyList) return;
    dom.historyList.insertBefore(MJ.createHistoryRowDom(entry), dom.historyList.firstChild);
  };
})();
