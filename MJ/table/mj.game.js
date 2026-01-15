// 遊戲流程：記錄、自摸、清桌、新的一場、設定、浮標/高亮
(function(){
  const MJ = window.MJ;
  const dom = MJ.dom;

  MJ.highlight = function(pos, cls, duration=1800){
    const el = document.querySelector(`.seat[data-pos="${pos}"]`);
    if(!el) return;
    el.classList.add(cls);
    setTimeout(()=> el.classList.remove(cls), duration);
  };

  MJ.showRoundDelta = function(pos, delta){
    const seat = document.querySelector(`.seat[data-pos="${pos}"]`);
    if(!seat) return;
    const span = document.createElement('div');
    span.className = 'round-delta ' + (delta >= 0 ? 'plus' : 'minus');
    span.textContent = (delta >= 0 ? '+' : '') + String(delta);
    seat.appendChild(span);
    requestAnimationFrame(()=>{ span.style.opacity = '1'; });
    setTimeout(()=>{ span.style.opacity = '0'; }, 900);
    setTimeout(()=> span.remove(), 1300);
  };

  // 自摸按鈕切換
  if(dom.zimoBtn){
    dom.zimoBtn.addEventListener('click', ()=>{
      dom.zimoBtn.classList.toggle('active');
      const isZ = dom.zimoBtn.classList.contains('active');
      dom.zimoBtn.style.background = isZ ? '#ffeeba' : '#fff';
      if(isZ){
        MJ.selectedLoserPos = '';
      }
      if(typeof MJ.renderLoserOptions === 'function') MJ.renderLoserOptions();
    });
  }

  // 設定：底/每台/台→點
  if(dom.baseInput){
    dom.baseInput.addEventListener('change', ()=>{
      MJ.domSettings.base = Math.max(1, parseInt(dom.baseInput.value, 10) || 1);
      MJ.applySettingsToUI();
      try{ MJ.saveDomState(); }catch(e){}
    });
  }
  if(dom.perTaiInput){
    dom.perTaiInput.addEventListener('change', ()=>{
      MJ.domSettings.perTai = Math.max(1, parseInt(dom.perTaiInput.value, 10) || 1);
      MJ.applySettingsToUI();
      try{ MJ.saveDomState(); }catch(e){}
    });
  }
  if(dom.autoCalcBtn){
    dom.autoCalcBtn.addEventListener('click', ()=>{
      MJ.domSettings.autoCalcFromFan = !MJ.domSettings.autoCalcFromFan;
      MJ.applySettingsToUI();
      try{ MJ.saveDomState(); }catch(e){}
    });
  }

  // 記錄
  if(dom.recordBtn){
    dom.recordBtn.addEventListener('click', ()=>{
      const w = MJ.selectedWinnerPos;
      const l = MJ.selectedLoserPos;
      const isZimo = MJ.isZimoActive();
      const pts = Math.max(1, parseInt(dom.pointsInput.value) || 1);
      const fanTotal = (typeof MJ.getFanTotal === 'function') ? MJ.getFanTotal() : 0;
      const fanDetail = (typeof MJ.getFanDetailText === 'function') ? MJ.getFanDetailText() : '';

      if(!w){ alert('請先選擇贏家'); return; }
      if(!isZimo){
        if(!l){ alert('請選擇贏家與輸家'); return; }
        if(w === l){ alert('贏家與輸家不能為同一人'); return; }
      }

      MJ.pushDomUndoSnapshot();
      MJ.incrementHandNo();
      const handNo = Number(MJ.domSettings.handNo || 0);

      if(isZimo){
        let totalGain = 0;
        dom.seatEls.forEach(s => {
          const pos = s.dataset.pos;
          if(pos === w) return;
          MJ.scores[pos] = (MJ.scores[pos]||0) - pts;
          MJ.updateScoreDisplay(pos);
          MJ.showRoundDelta(pos, -pts);
          totalGain += pts;
        });

        MJ.scores[w] = (MJ.scores[w]||0) + totalGain;
        MJ.updateScoreDisplay(w);
        MJ.showRoundDelta(w, totalGain);

        const entry = {
          type: 'zimo',
          winnerPos: w,
          loserPos: '',
          winner: MJ.getDisplayNameFor(w),
          loser: '自摸',
          points: totalGain,
          zimoPer: pts,
          fanTotal,
          fanDetail,
          dealer: (typeof MJ.getDealerLabel === 'function') ? MJ.getDealerLabel() : '',
          handNo,
          time: Date.now(),
          text: `${MJ.getDisplayNameFor(w)} 自摸 +${totalGain}`
        };
        MJ.addHistoryEntryDom(entry);
        try{ MJ.saveDomState(); }catch(e){}
        MJ.updateDomHistoryButtons();
        MJ.highlight(w, 'winner', 2200);
      } else {
        MJ.scores[w] = (MJ.scores[w]||0) + pts;
        MJ.scores[l] = (MJ.scores[l]||0) - pts;
        MJ.updateScoreDisplay(w);
        MJ.updateScoreDisplay(l);
        MJ.showRoundDelta(w, pts);
        MJ.showRoundDelta(l, -pts);

        const entry = {
          type: 'ron',
          winnerPos: w,
          loserPos: l,
          winner: MJ.getDisplayNameFor(w),
          loser: MJ.getDisplayNameFor(l),
          points: pts,
          fanTotal,
          fanDetail,
          dealer: (typeof MJ.getDealerLabel === 'function') ? MJ.getDealerLabel() : '',
          handNo,
          time: Date.now(),
          text: `${MJ.getDisplayNameFor(w)} +${pts} ／ ${MJ.getDisplayNameFor(l)} -${pts}`
        };
        MJ.addHistoryEntryDom(entry);
        try{ MJ.saveDomState(); }catch(e){}
        MJ.updateDomHistoryButtons();
        MJ.highlight(w, 'winner', 2200);
        MJ.highlight(l, 'loser', 2200);
      }

      MJ.selectedLoserPos = '';
      MJ.selectedWinnerPos = '';
      if(typeof MJ.clearFanSelection === 'function') MJ.clearFanSelection();
      if(typeof MJ.renderAllSelectors === 'function') MJ.renderAllSelectors();
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  // 重設桌面
  if(dom.clearBtn){
    dom.clearBtn.addEventListener('click', ()=>{
      if(!confirm('確定要重設桌面？這會將四家分數歸零並刪除紀錄。')) return;
      MJ.pushDomUndoSnapshot();
      dom.seatEls.forEach(s => {
        const pos = s.dataset.pos;
        MJ.scores[pos] = 0;
        MJ.updateScoreDisplay(pos);
      });
      if(dom.historyList) dom.historyList.innerHTML = '';
      if(typeof MJ.clearFanSelection === 'function') MJ.clearFanSelection();
      MJ.domSettings.handNo = 0;
      MJ.applySettingsToUI();
      try{ MJ.saveDomState(); }catch(e){}
      MJ.updateDomHistoryButtons();
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  // Undo/Redo
  if(dom.undoHistoryBtn){
    dom.undoHistoryBtn.addEventListener('click', ()=> MJ.undoDomLast());
  }
  if(dom.redoHistoryBtn){
    dom.redoHistoryBtn.addEventListener('click', ()=> MJ.redoDomLast());
  }

  // 新的一場
  if(dom.newSessionBtn){
    dom.newSessionBtn.addEventListener('click', ()=>{
      if(!confirm('開始新的一場？這會將四家分數歸零並清除紀錄（玩家名稱保留）。')) return;
      MJ.pushDomUndoSnapshot();
      dom.seatEls.forEach(s => {
        const pos = s.dataset.pos;
        MJ.scores[pos] = 0;
        MJ.updateScoreDisplay(pos);
      });
      if(dom.historyList) dom.historyList.innerHTML = '';
      if(typeof MJ.clearFanSelection === 'function') MJ.clearFanSelection();
      MJ.domSettings.handNo = 0;
      try{ MJ.state.dealer = 'east'; MJ.state.dealerCount = 0; if(typeof MJ.updateDealerUI === 'function') MJ.updateDealerUI(); MJ.saveState(); }catch(e){}
      MJ.applySettingsToUI();
      try{ MJ.saveDomState(); }catch(e){}
      MJ.updateDomHistoryButtons();
      if(typeof MJ.updateSettlementUI === 'function') MJ.updateSettlementUI();
    });
  }

  if(dom.deleteAllHistoryBtn){
    dom.deleteAllHistoryBtn.addEventListener('click', ()=> MJ.clearAllDomHistory('確定要刪除全部紀錄？'));
  }
})();
