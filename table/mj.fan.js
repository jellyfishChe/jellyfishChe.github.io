// 台數（番型）：預設清單 + 自訂 + 總台
(function(){
  const MJ = window.MJ;
  const dom = MJ.dom;

  const FALLBACK_TAI_PRESETS = [
    { key: 'menqing', label: '門清', tai: 1 },
    { key: 'zimo', label: '自摸', tai: 1 },
    { key: 'pinghu', label: '平胡', tai: 2 },
    { key: 'pengpenghu', label: '碰碰胡', tai: 4 },
    { key: 'hunyise', label: '混一色', tai: 4 },
    { key: 'qingyise', label: '清一色', tai: 8 },
  ];

  let fanCustomItems = []; // { key, label, tai }
  let fanSelectedKeys = new Set();

  function getTaiValue(it){
    if(it && it.type === 'dealer'){
      const n = Number(MJ.state && MJ.state.dealerCount) || 0;
      return (2 * n) + 1;
    }
    const v = (typeof it.tai !== 'undefined') ? it.tai : it.fan;
    return Number(v) || 0;
  }

  function getPresetTaiList(){
    const list = (typeof window !== 'undefined' && Array.isArray(window.mjList)) ? window.mjList : null;
    return Array.isArray(list) && list.length > 0 ? list : FALLBACK_TAI_PRESETS;
  }

  function getTaiCategory(it){
    const key = (it && it.key) ? String(it.key) : '';
    if(it && it.type === 'dealer') return '其他';

    if(key === 'changfeng' || key === 'benfeng' || key === 'jianpai_bai' || key === 'jianpai_fa' || key === 'jianpai_zhong') return '風 / 箭';
    if(key === 'zhenghua_1' || key === 'zhenghua_2' || key === 'huagang') return '花牌';
    if(key === 'hunyise' || key === 'qingyise' || key === 'ziyise') return '一色';
    if(key === 'baxianguohai' || key === 'qiqiangyi') return '八仙 / 七搶一';
    if(key === 'sanan' || key === 'sian' || key === 'wuan') return '暗刻類';
    if(key === 'xiaosanyuan' || key === 'dasanyuan' || key === 'xiaosixi' || key === 'dasixi') return '三元 / 四喜';

    if(getTaiValue(it) === 1) return '一台';
    return '其他';
  }

  function getAllFanItems(){
    return [...getPresetTaiList(), ...fanCustomItems];
  }

  function getSelectedFanItems(){
    const all = getAllFanItems();
    return all.filter(it => fanSelectedKeys.has(it.key));
  }

  function getFanTotal(){
    return getSelectedFanItems().reduce((sum, it) => sum + getTaiValue(it), 0);
  }

  function getFanDetailText(){
    const items = getSelectedFanItems();
    if(items.length === 0) return '';
    return items.map(it => `${it.label}(${getTaiValue(it)})`).join('、');
  }

  function updateFanUI(){
    if(dom.fanTotalEl) dom.fanTotalEl.textContent = String(getFanTotal());
    if(dom.fanSelectedHint){
      const t = getFanDetailText();
      dom.fanSelectedHint.textContent = t ? `已選：${t}` : '';
    }
    if(typeof MJ.updatePointsFromFan === 'function') MJ.updatePointsFromFan();
  }

  function renderFanOptions(){
    if(!dom.fanOptionsEl) return;

    const buckets = {
      '風 / 箭': [],
      '花牌': [],
      '一台': [],
      '暗刻類': [],
      '三元 / 四喜': [],
      '一色': [],
      '八仙 / 七搶一': [],
      '其他': []
    };

    getAllFanItems().forEach(it => {
      const cat = getTaiCategory(it);
      (buckets[cat] || buckets['其他']).push(it);
    });

    const toOpt = (it) => ({
      label: `${it.label} ${getTaiValue(it)}台`,
      selected: fanSelectedKeys.has(it.key),
      disabled: false,
      onClick: ()=>{
        if(fanSelectedKeys.has(it.key)) fanSelectedKeys.delete(it.key);
        else fanSelectedKeys.add(it.key);
        renderFanOptions();
        updateFanUI();
      }
    });

    const groups = [
      { title: '場風 / 門風 / 三元牌', items: buckets['風 / 箭'].map(toOpt) },
      { title: '花牌', items: buckets['花牌'].map(toOpt) },
      { title: '一台', items: buckets['一台'].map(toOpt) },
      { title: '暗刻類', items: buckets['暗刻類'].map(toOpt) },
      { title: '三元 / 四喜', items: buckets['三元 / 四喜'].map(toOpt) },
      { title: '一色', items: buckets['一色'].map(toOpt) },
      { title: '八仙過海 / 七搶一', items: buckets['八仙 / 七搶一'].map(toOpt) },
      { title: '其他', items: buckets['其他'].map(toOpt) },
    ];

    MJ.renderOptionGroupsWithTitles(dom.fanOptionsEl, groups);
  }

  function clearFanSelection(){
    fanSelectedKeys = new Set();
    renderFanOptions();
    updateFanUI();
  }

  // expose to MJ
  MJ.getFanTotal = getFanTotal;
  MJ.getFanDetailText = getFanDetailText;
  MJ.renderFanOptions = renderFanOptions;
  MJ.updateFanUI = updateFanUI;
  MJ.clearFanSelection = clearFanSelection;

  MJ.updatePointsFromFan = function(){
    if(!dom.pointsInput) return;
    if(!MJ.domSettings.autoCalcFromFan) return;
    dom.pointsInput.value = String(MJ.getAutoPoints());
  };

  // events
  if(dom.fanAddBtn){
    dom.fanAddBtn.addEventListener('click', ()=>{
      const name = (dom.fanNameInput ? dom.fanNameInput.value : '').trim();
      const fanVal = Math.max(1, parseInt(dom.fanValueInput ? dom.fanValueInput.value : '1', 10) || 1);
      if(!name){ alert('請輸入自訂台型名稱'); return; }
      const key = `custom_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      fanCustomItems.push({ key, label: name, tai: fanVal });
      fanSelectedKeys.add(key);
      if(dom.fanNameInput) dom.fanNameInput.value = '';
      if(dom.fanValueInput) dom.fanValueInput.value = '1';
      renderFanOptions();
      updateFanUI();
    });
  }

  if(dom.fanClearBtn){
    dom.fanClearBtn.addEventListener('click', ()=>{
      clearFanSelection();
    });
  }
})();
