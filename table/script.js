// Entry point (split modules)
// 主要邏輯已拆分到 mj.*.js，這裡只負責初始化與載入既有狀態。
(function(){
  const MJ = window.MJ;
  if(!MJ || !MJ.dom){
    console.error('MJ modules not loaded');
    return;
  }

  // 初始化分數（若未載入過狀態）
  MJ.dom.seatEls.forEach(s => {
    const pos = s.dataset.pos;
    if(typeof MJ.scores[pos] !== 'number') MJ.scores[pos] = 0;
  });

  // 先載入 state 與 DOM state
  try{ MJ.loadState(); }catch(e){}
  try{ MJ.loadDomState(); }catch(e){}

  // UI 初始化
  try{ MJ.applySettingsToUI(); }catch(e){}
  try{ if(typeof MJ.updateDealerUI === 'function') MJ.updateDealerUI(); }catch(e){}
  try{ if(typeof MJ.renderFanOptions === 'function') MJ.renderFanOptions(); }catch(e){}
  try{ if(typeof MJ.updateFanUI === 'function') MJ.updateFanUI(); }catch(e){}
  try{ if(typeof MJ.renderAllSelectors === 'function') MJ.renderAllSelectors(); }catch(e){}

  // 依歷史重算局數/結算
  try{ if(typeof MJ.normalizeHandNoFromHistory === 'function') MJ.normalizeHandNoFromHistory(); }catch(e){}
  try{ if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI(); }catch(e){}

  // 將顯示同步一次
  MJ.dom.seatEls.forEach(s => MJ.updateScoreDisplay(s.dataset.pos));
  MJ.updateDomHistoryButtons();
})();
