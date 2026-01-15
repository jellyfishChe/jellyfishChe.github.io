// 紀錄：單筆編輯/刪除、局數重編、結算/對帳
(function(){
  const MJ = window.MJ;
  const dom = MJ.dom;

  function getPosByDisplayName(name){
    const n = (name || '').trim();
    if(!n) return '';
    for(const pos of MJ.POS_ORDER){
      if(MJ.getDisplayNameFor(pos) === n) return pos;
    }
    return '';
  }

  MJ.normalizeHandNoFromHistory = function(){
    if(!dom.historyList) return;
    const rows = Array.from(dom.historyList.children);
    const chronological = rows.slice().reverse();
    chronological.forEach((row, idx) => {
      const no = idx + 1;
      row.dataset.handNo = String(no);
      const td = row.querySelector('td[data-col="handNo"]');
      if(td) td.textContent = String(no);
    });
    MJ.domSettings.handNo = chronological.length;
    MJ.updateHandIndicator();
  };

  MJ.recalculateScoresFromHistory = function(){
    dom.seatEls.forEach(s => { MJ.scores[s.dataset.pos] = 0; });

    const items = MJ.getDomHistoryArray();
    const chronological = items.slice().reverse();

    chronological.forEach(it => {
      const type = it.type || '';
      if(type === 'ron'){
        const w = it.winnerPos || getPosByDisplayName(it.winner);
        const l = it.loserPos || getPosByDisplayName(it.loser);
        if(!w || !l) return;
        const pts = Number(it.points || 0);
        MJ.scores[w] = (MJ.scores[w]||0) + pts;
        MJ.scores[l] = (MJ.scores[l]||0) - pts;
        return;
      }
      if(type === 'zimo' || it.loser === '自摸'){
        const w = it.winnerPos || getPosByDisplayName(it.winner);
        if(!w) return;
        const per = Number(it.zimoPer || 0) || Math.floor(Number(it.points || 0) / 3) || 0;
        if(per <= 0) return;
        let totalGain = 0;
        MJ.POS_ORDER.forEach(pos => {
          if(pos === w) return;
          MJ.scores[pos] = (MJ.scores[pos]||0) - per;
          totalGain += per;
        });
        MJ.scores[w] = (MJ.scores[w]||0) + totalGain;
        return;
      }
      if(type === 'adjust'){
        const pos = it.seatPos || it.winnerPos || getPosByDisplayName(it.winner);
        if(!pos) return;
        const delta = Number(it.delta || it.points || 0);
        MJ.scores[pos] = (MJ.scores[pos]||0) + delta;
        return;
      }
      if(type === 'set'){
        const pos = it.seatPos || it.winnerPos || getPosByDisplayName(it.winner);
        if(!pos) return;
        const v = Number(it.delta || 0);
        MJ.scores[pos] = v;
        return;
      }

      // legacy best-effort
      const w = it.winnerPos || getPosByDisplayName(it.winner);
      const l = it.loserPos || getPosByDisplayName(it.loser);
      const legacyLoser = (it.loser || '').trim();
      if(w && (legacyLoser.includes('手動加分') || legacyLoser.includes('手動扣分') || legacyLoser.includes('重設分數'))){
        if(legacyLoser.includes('重設分數')){
          MJ.scores[w] = 0;
        } else {
          const delta = Number(it.points || 0);
          MJ.scores[w] = (MJ.scores[w]||0) + delta;
        }
        return;
      }
      if(w && l && Number(it.points || 0) > 0){
        MJ.scores[w] = (MJ.scores[w]||0) + Number(it.points || 0);
        MJ.scores[l] = (MJ.scores[l]||0) - Number(it.points || 0);
      }
    });

    dom.seatEls.forEach(s => MJ.updateScoreDisplay(s.dataset.pos));
    MJ.normalizeHandNoFromHistory();
    MJ.updateSettlementUI();
  };

  MJ.updateSettlementUI = function(){
    if(!dom.settlementSummaryEl || !dom.settlementTransfersEl) return;

    const arr = MJ.POS_ORDER.map(pos => ({
      pos,
      name: MJ.getDisplayNameFor(pos),
      score: Number(MJ.scores[pos] || 0)
    }));

    const sorted = arr.slice().sort((a,b)=> b.score - a.score);
    dom.settlementSummaryEl.textContent = sorted.map(it => `${it.name}：${it.score}`).join('  /  ');

    const creditors = arr.filter(x => x.score > 0).map(x => ({...x, amount: x.score})).sort((a,b)=> b.amount - a.amount);
    const debtors = arr.filter(x => x.score < 0).map(x => ({...x, amount: -x.score})).sort((a,b)=> b.amount - a.amount);

    const transfers = [];
    let i = 0, j = 0;
    while(i < debtors.length && j < creditors.length){
      const d = debtors[i];
      const c = creditors[j];
      const amt = Math.min(d.amount, c.amount);
      if(amt > 0){
        transfers.push({from: d.name, to: c.name, amount: amt});
        d.amount -= amt;
        c.amount -= amt;
      }
      if(d.amount <= 0) i++;
      if(c.amount <= 0) j++;
    }

    if(transfers.length === 0){
      dom.settlementTransfersEl.textContent = '目前不需要對帳（總和為 0）。';
      return;
    }

    dom.settlementTransfersEl.innerHTML = '';
    const ul = document.createElement('ul');
    ul.style.margin = '6px 0 0 16px';
    ul.style.padding = '0';
    transfers.forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.from} → ${t.to}：${t.amount}`;
      ul.appendChild(li);
    });
    dom.settlementTransfersEl.appendChild(ul);
  };

  // per-row actions
  if(dom.historyList){
    dom.historyList.addEventListener('click', (e)=>{
      const btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
      if(!btn) return;
      const tr = btn.closest('tr');
      if(!tr) return;
      const action = btn.dataset.action;

      if(action === 'delete'){
        if(!confirm('刪除這筆紀錄？')) return;
        MJ.pushDomUndoSnapshot();
        tr.remove();
        MJ.recalculateScoresFromHistory();
        try{ MJ.saveDomState(); }catch(e){}
        MJ.updateDomHistoryButtons();
        return;
      }

      if(action === 'edit'){
        const type = tr.dataset.type || '';
        let next = null;

        if(type === 'zimo' || tr.dataset.loser === '自摸'){
          const curPer = Number(tr.dataset.zimoPer || 0) || Math.floor(Number(tr.dataset.points || 0) / 3) || 1;
          const raw = prompt('編輯自摸：每家付多少點？', String(curPer));
          if(raw === null) return;
          const per = Math.max(1, parseInt(raw, 10) || 1);
          next = { zimoPer: per, points: per * 3 };
        } else if(type === 'adjust'){
          const cur = Number(tr.dataset.delta || tr.dataset.points || 0);
          const raw = prompt('編輯手動調整：新的加減分（可負數）？', String(cur));
          if(raw === null) return;
          const delta = parseInt(raw, 10);
          if(isNaN(delta)){ alert('請輸入整數'); return; }
          next = { delta, points: delta };
        } else {
          const cur = Number(tr.dataset.points || 0) || 1;
          const raw = prompt('編輯點數：新的點數？', String(cur));
          if(raw === null) return;
          const pts = Math.max(1, parseInt(raw, 10) || 1);
          next = { points: pts };
        }

        if(!next) return;
        MJ.pushDomUndoSnapshot();
        if(typeof next.zimoPer !== 'undefined') tr.dataset.zimoPer = String(next.zimoPer);
        if(typeof next.delta !== 'undefined') tr.dataset.delta = String(next.delta);
        if(typeof next.points !== 'undefined') tr.dataset.points = String(next.points);

        const tds = tr.querySelectorAll('td');
        if(tds && tds.length >= 3){
          const ptsCell = tds[2];
          if(ptsCell) ptsCell.textContent = tr.dataset.points || '0';
          if((type === 'zimo' || tr.dataset.loser === '自摸') && ptsCell){
            const perNow = Number(tr.dataset.zimoPer || 0);
            ptsCell.title = perNow > 0 ? `每家 ${perNow}` : '';
          }
        }

        MJ.recalculateScoresFromHistory();
        try{ MJ.saveDomState(); }catch(e){}
        MJ.updateDomHistoryButtons();
      }
    });
  }
})();
