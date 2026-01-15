// UI：贏家/輸家/座位選擇與座位操作
(function(){
  const MJ = window.MJ;
  const dom = MJ.dom;

  function renderWinnerOptions(){
    const opts = MJ.POS_ORDER.map(pos => ({
      label: `${MJ.getDisplayNameFor(pos)}`,
      selected: MJ.selectedWinnerPos === pos,
      disabled: false,
      onClick: ()=>{
        MJ.selectedWinnerPos = pos;
        MJ.selectedLoserPos = '';
        renderAllSelectors();
      }
    }));
    MJ.renderOptionGroup(dom.winnerOptionsEl, opts);
  }

  function renderLoserOptions(){
    const shouldShow = !MJ.isZimoActive() && !!MJ.selectedWinnerPos;
    if(dom.loserBlockEl) dom.loserBlockEl.style.display = shouldShow ? '' : 'none';
    if(!shouldShow){
      if(dom.loserOptionsEl) dom.loserOptionsEl.innerHTML = '';
      return;
    }

    const opts = MJ.POS_ORDER.map(pos => ({
      label: `${MJ.getDisplayNameFor(pos)}`,
      selected: MJ.selectedLoserPos === pos,
      disabled: pos === MJ.selectedWinnerPos,
      onClick: ()=>{
        MJ.selectedLoserPos = pos;
        renderLoserOptions();
      }
    }));
    MJ.renderOptionGroup(dom.loserOptionsEl, opts);
  }

  function updateSelectedSeatUI(){
    dom.seatEls.forEach(s => {
      s.classList.toggle('selected-seat', s.dataset.pos === MJ.selectedSeatPos);
    });
    const hasSeat = !!MJ.selectedSeatPos;
    [dom.seatRenameBtn, dom.seatAddBtn, dom.seatSubBtn, dom.seatResetBtn, dom.seatDealerBtn].forEach(b => {
      if(!b) return;
      b.disabled = !hasSeat;
    });
  }

  function renderSeatPickOptions(){
    const opts = MJ.POS_ORDER.map(pos => ({
      label: MJ.getDisplayNameFor(pos),
      selected: MJ.selectedSeatPos === pos,
      disabled: false,
      onClick: ()=>{
        MJ.selectedSeatPos = pos;
        updateSelectedSeatUI();
        renderSeatPickOptions();
      }
    }));
    MJ.renderOptionGroup(dom.seatPickOptionsEl, opts);
  }

  function renderAllSelectors(){
    renderWinnerOptions();
    renderLoserOptions();
    renderSeatPickOptions();
    updateSelectedSeatUI();
  }

  MJ.renderAllSelectors = renderAllSelectors;
  MJ.renderLoserOptions = renderLoserOptions;

  // seat click selection
  dom.seatEls.forEach(s => {
    s.addEventListener('click', (e)=>{
      e.stopPropagation();
      MJ.selectedSeatPos = s.dataset.pos;
      updateSelectedSeatUI();
      renderSeatPickOptions();
    });
    s.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      MJ.selectedSeatPos = s.dataset.pos;
      updateSelectedSeatUI();
      renderSeatPickOptions();
    });
  });

  function requireSelectedSeat(){
    if(!MJ.selectedSeatPos){ alert('請先選擇座位'); return false; }
    return true;
  }

  // seat action buttons
  if(dom.seatRenameBtn){
    dom.seatRenameBtn.addEventListener('click', ()=>{
      if(!requireSelectedSeat()) return;
      const seat = MJ.getSeatByPos(MJ.selectedSeatPos);
      if(!seat) return;
      const nameEl = seat.querySelector('.display-name');
      const newName = prompt('輸入玩家名稱（留空取消）', nameEl ? nameEl.textContent : MJ.getDisplayNameFor(MJ.selectedSeatPos));
      if(newName === null) return;
      if(newName.trim().length && nameEl) nameEl.textContent = newName.trim();
      renderAllSelectors();
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  if(dom.seatAddBtn){
    dom.seatAddBtn.addEventListener('click', ()=>{
      if(!requireSelectedSeat()) return;
      MJ.pushDomUndoSnapshot();
      const pts = Math.max(1, parseInt(dom.pointsInput.value) || 1);
      MJ.scores[MJ.selectedSeatPos] = (MJ.scores[MJ.selectedSeatPos]||0) + pts;
      MJ.updateScoreDisplay(MJ.selectedSeatPos);
      MJ.incrementHandNo();
      const entry = {
        type: 'adjust',
        seatPos: MJ.selectedSeatPos,
        winnerPos: MJ.selectedSeatPos,
        winner: MJ.getDisplayNameFor(MJ.selectedSeatPos),
        loser: '手動加分',
        points: pts,
        delta: pts,
        dealer: (typeof MJ.getDealerLabel === 'function') ? MJ.getDealerLabel() : '',
        handNo: Number(MJ.domSettings.handNo || 0),
        time: Date.now(),
        text: `手動調整：${MJ.getDisplayNameFor(MJ.selectedSeatPos)} +${pts}`
      };
      MJ.addHistoryEntryDom(entry);
      try{ MJ.saveDomState(); }catch(e){}
      MJ.updateDomHistoryButtons();
      if(typeof MJ.showRoundDelta === 'function') MJ.showRoundDelta(MJ.selectedSeatPos, pts);
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  if(dom.seatSubBtn){
    dom.seatSubBtn.addEventListener('click', ()=>{
      if(!requireSelectedSeat()) return;
      MJ.pushDomUndoSnapshot();
      const pts = Math.max(1, parseInt(dom.pointsInput.value) || 1);
      MJ.scores[MJ.selectedSeatPos] = (MJ.scores[MJ.selectedSeatPos]||0) - pts;
      MJ.updateScoreDisplay(MJ.selectedSeatPos);
      MJ.incrementHandNo();
      const entry = {
        type: 'adjust',
        seatPos: MJ.selectedSeatPos,
        winnerPos: MJ.selectedSeatPos,
        winner: MJ.getDisplayNameFor(MJ.selectedSeatPos),
        loser: '手動扣分',
        points: -pts,
        delta: -pts,
        dealer: (typeof MJ.getDealerLabel === 'function') ? MJ.getDealerLabel() : '',
        handNo: Number(MJ.domSettings.handNo || 0),
        time: Date.now(),
        text: `手動調整：${MJ.getDisplayNameFor(MJ.selectedSeatPos)} -${pts}`
      };
      MJ.addHistoryEntryDom(entry);
      try{ MJ.saveDomState(); }catch(e){}
      MJ.updateDomHistoryButtons();
      if(typeof MJ.showRoundDelta === 'function') MJ.showRoundDelta(MJ.selectedSeatPos, -pts);
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  if(dom.seatResetBtn){
    dom.seatResetBtn.addEventListener('click', ()=>{
      if(!requireSelectedSeat()) return;
      MJ.pushDomUndoSnapshot();
      MJ.scores[MJ.selectedSeatPos] = 0;
      MJ.updateScoreDisplay(MJ.selectedSeatPos);
      MJ.incrementHandNo();
      const entry = {
        type: 'set',
        seatPos: MJ.selectedSeatPos,
        winnerPos: MJ.selectedSeatPos,
        winner: MJ.getDisplayNameFor(MJ.selectedSeatPos),
        loser: '重設分數',
        points: 0,
        delta: 0,
        dealer: (typeof MJ.getDealerLabel === 'function') ? MJ.getDealerLabel() : '',
        handNo: Number(MJ.domSettings.handNo || 0),
        time: Date.now(),
        text: `重設分數：${MJ.getDisplayNameFor(MJ.selectedSeatPos)}`
      };
      MJ.addHistoryEntryDom(entry);
      try{ MJ.saveDomState(); }catch(e){}
      MJ.updateDomHistoryButtons();
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  if(dom.seatDealerBtn){
    dom.seatDealerBtn.addEventListener('click', ()=>{
      if(!requireSelectedSeat()) return;
      if(typeof MJ.setDealerByPos === 'function') MJ.setDealerByPos(MJ.selectedSeatPos);
    });
  }
})();
