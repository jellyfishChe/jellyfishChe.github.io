// 莊家：UI + 連莊/下莊
(function(){
  const MJ = window.MJ;
  const dom = MJ.dom;

  MJ.updateDealerUI = function(){
    try{
      dom.seatEls.forEach(s=>{
        s.classList.remove('dealer');
        const bd = s.querySelector('.badge');
        if(bd) bd.remove();
      });
      if(!MJ.state.dealer) return;
      const seat = MJ.getSeatByPos(MJ.state.dealer);
      if(!seat) return;
      seat.classList.add('dealer');
      const b = document.createElement('span');
      b.className = 'badge';
      const cnt = Number(MJ.state.dealerCount) || 0;
      b.textContent = cnt > 0 ? `莊${cnt}` : '莊';
      const roleEl = seat.querySelector('.role');
      if(roleEl) roleEl.after(b);
    }catch(e){
      console.warn('updateDealerUI error', e);
    }
  };

  MJ.getDealerLabel = function(){
    const dealerName = MJ.state.dealer ? MJ.getDisplayNameFor(MJ.state.dealer) : '';
    const cnt = Number(MJ.state.dealerCount) || 0;
    if(!dealerName) return '';
    return cnt > 0 ? `${dealerName} (莊${cnt})` : dealerName;
  };

  MJ.setDealerByPos = function(pos){
    if(!pos) return;
    MJ.state.dealer = pos;
    MJ.state.dealerCount = 0;
    MJ.updateDealerUI();
    try{ if(typeof MJ.renderFanOptions === 'function') MJ.renderFanOptions(); if(typeof MJ.updateFanUI === 'function') MJ.updateFanUI(); }catch(e){}
    try{ MJ.saveState(); }catch(e){}
  };

  MJ.doLianZhuang = function(){
    if(!MJ.state.dealer) MJ.state.dealer = 'east';
    MJ.state.dealerCount = (Number(MJ.state.dealerCount) || 0) + 1;
    MJ.updateDealerUI();
    try{ if(typeof MJ.renderFanOptions === 'function') MJ.renderFanOptions(); if(typeof MJ.updateFanUI === 'function') MJ.updateFanUI(); }catch(e){}
    try{ MJ.saveState(); }catch(e){}
  };

  MJ.doXiaZhuang = function(){
    const order = MJ.POS_ORDER;
    const cur = MJ.state.dealer || 'east';
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];
    MJ.state.dealer = next;
    MJ.state.dealerCount = 0;
    MJ.updateDealerUI();
    try{ if(typeof MJ.renderFanOptions === 'function') MJ.renderFanOptions(); if(typeof MJ.updateFanUI === 'function') MJ.updateFanUI(); }catch(e){}
    try{ MJ.saveState(); }catch(e){}
  };

  if(dom.lianzhuangBtn){
    dom.lianzhuangBtn.addEventListener('click', ()=> MJ.doLianZhuang());
  }
  if(dom.xiadzhuangBtn){
    dom.xiadzhuangBtn.addEventListener('click', ()=> MJ.doXiaZhuang());
  }
})();
