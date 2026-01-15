const container = document.getElementById('container');
const touchedCountEl = document.getElementById('touchedCount');
const resetBtnEl = document.getElementById('resetBTN');
// const DiEl = document.getElementById('Di');
// const TaiEl = document.getElementById('Tai');
// const PayEl = document.getElementById('Pay');
const bonusEl = document.getElementById('bonus');

let MJcount = [];
let obj = [];
let choose = new Set();
let lockin = new Set();
let counts = [];
let di=3;
let tai=1;
let bonus=0;

// lockMap.js 載入的物件
lockMap.has = function(key) {
    return Object.prototype.hasOwnProperty.call(this, key);
};

Promise.all([
    d3.csv("MJ.csv")
]).then(function(data) {
    MJcount = data[0];
    plotRectangle();
    updateRect();
});

function updateRect(it){
    // DiEl.childNodes[1].childNodes[1].textContent=di;
    // TaiEl.childNodes[1].childNodes[1].textContent=tai;
    bonusEl.childNodes[1].childNodes[1].textContent=bonus;
    if(choose.has(it)){
        if(lockMap.has(it)){
            for(let lock of lockMap[it]){
                choose.delete(lock);
            }
        }
    }
    lockin.clear();
    for(let ch of choose){
        if(lockMap.has(ch)){
            for(let lock of lockMap[ch]){
                lockin.add(lock);
            }
        }
    }
    obj[85].childNodes[1].childNodes[0].classList.remove('touched');
    obj[85].childNodes[1].childNodes[2].classList.remove('touched');
    obj[85].childNodes[1].childNodes[0].classList.remove('locked');
    obj[85].childNodes[1].childNodes[2].classList.remove('locked');
    obj[86].childNodes[1].childNodes[0].classList.remove('touched');
    obj[86].childNodes[1].childNodes[2].classList.remove('touched');
    obj[86].childNodes[1].childNodes[0].classList.remove('locked');
    obj[86].childNodes[1].childNodes[2].classList.remove('locked');
    for (let i=0; i < MJcount.length; i++) {
        obj[i].classList.remove('touched');
        obj[i].classList.remove('locked');
        if(choose.has(i)){
            obj[i].classList.add('touched');
            if(i==85 || i==86){
                obj[i].childNodes[1].childNodes[0].classList.add('touched');
                obj[i].childNodes[1].childNodes[2].classList.add('touched');
            }
        }else if(lockin.has(i)){
            if(i==85 || i==86){
                obj[i].childNodes[1].childNodes[0].classList.add('locked');
                obj[i].childNodes[1].childNodes[2].classList.add('locked');
            }
            obj[i].classList.add('locked');
            counts[i]=0;
        }
        if(i==85 || i==86){
            obj[i].querySelector('.countDisplay').textContent = counts[i];
        }
    }

    let counter=0;
    let bb=-1;
    for (let i=0; i < MJcount.length; i++){
        if (counts[i] > 0) {
            bb++;
            counter += counts[i] * (Number(MJcount[i].num) || 0);
        }
    }
    if(bb>0){
        counter += bonus * bb;
    }
    touchedCountEl.textContent = counter;
    // let pay=di+counter*tai;
    // PayEl.textContent = pay;
}

function plotRectangle(){
    for (let i=0; i < MJcount.length; i++) {
        counts[i] = 0;
        const rect = document.createElement('div');
        rect.classList.add('rectangle');

        const notShow = new Set([1, 2, 3, 8, 21, 47, 48, 50, 51, 56, 57, 58, 61, 62, 65, 70, 78, 84, 85, 86, 87, 88, 89]);
        if (notShow.has(i)) {
            rect.style.display = 'none';
        }
        const label = document.createElement('div');
        if(i == 87){
            label.innerHTML = MJcount[i].name + "<br>Double";
        }else if(i == 85 || i == 86){
            label.innerHTML = MJcount[i].name ;
        }else{
            label.innerHTML = MJcount[i].name + "<br>" + MJcount[i].num + "番.."+i;
        }
        rect.appendChild(label);
        
        if(i==85){
            const controls = document.createElement('div');
            controls.style.display = "flex";
            controls.style.justifyContent = "center";
            controls.style.gap = "5px";
            controls.style.marginTop = "4px";

            const minusBtn = document.createElement('div');
            minusBtn.classList.add("but");
            minusBtn.textContent = "–";
            minusBtn.addEventListener('click', (e) => {
                if (!rect.classList.contains('locked')) {
                    e.stopPropagation();
                    if (counts[i] > 0) counts[i]--;
                    if (counts[i] === 0) choose.delete(i);
                    updateRect(i);
                }
            });

            const countDisplay = document.createElement('span');
            countDisplay.textContent = counts[i];
            countDisplay.classList.add('countDisplay');

            const plusBtn = document.createElement('div');
            plusBtn.classList.add("but");
            plusBtn.textContent = "+";
            plusBtn.addEventListener('click', (e) => {
                if (!rect.classList.contains('locked')) {
                    e.stopPropagation();
                    if (counts[i] > 7) counts[i]--;
                    counts[i]++;
                    choose.add(i);
                    updateRect(i);
                }
            });
            controls.appendChild(minusBtn);
            controls.appendChild(countDisplay);
            controls.appendChild(plusBtn);
            
            rect.appendChild(controls);
        }else if(i==86){
            const controls = document.createElement('div');
            controls.style.display = "flex";
            controls.style.justifyContent = "center";
            controls.style.gap = "5px";
            controls.style.marginTop = "4px";

            const minusBtn = document.createElement('div');
            minusBtn.classList.add("but");
            minusBtn.textContent = "–";
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (counts[i] > 0) counts[i]-=2;
                if (counts[i] < 0) counts[i]=0;
                if (counts[i] === 0) choose.delete(i);
                updateRect(i);
            });
            
            const countDisplay = document.createElement('span');
            countDisplay.textContent = counts[i];
            countDisplay.classList.add('countDisplay');

            const plusBtn = document.createElement('div');
            plusBtn.classList.add("but");
            plusBtn.textContent = "+";
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (counts[i] > 0) counts[i]++;
                counts[i]++;
                choose.add(i);
                updateRect(i);
            });
            controls.appendChild(minusBtn);
            controls.appendChild(countDisplay);
            controls.appendChild(plusBtn);
            
            rect.appendChild(controls);
        }
        // 點擊整個矩形 → toggle 0 ↔ 1
        rect.addEventListener('click', () => {
            if (!rect.classList.contains('locked')) {
                if (counts[i] > 0) {
                    counts[i] = 0;
                    choose.delete(i);
                } else {
                    counts[i] = 1;
                    choose.add(i);
                }
                updateRect(i);
            }
        });

        obj.push(rect);
        container.appendChild(rect);
    }
    
    // const labelD = document.createElement('div');
    // labelD.innerHTML="底";
    // DiEl.appendChild(labelD);

    // const controlsD = document.createElement('div');
    // controlsD.style.display = "flex";
    // controlsD.style.justifyContent = "center";
    // controlsD.style.gap = "5px";
    // controlsD.style.marginTop = "4px";

    // const minusBtnD = document.createElement('div');
    // minusBtnD.classList.add("but");
    // minusBtnD.textContent = "–";
    // minusBtnD.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     if (di > 0) di--;
    //     if (di < 0) di=0;
    //     updateRect();
    // });

    // const countDisplayD = document.createElement('span');
    // countDisplayD.textContent = di;
    // countDisplayD.classList.add('countDisplay');

    // const plusBtnD = document.createElement('div');
    // plusBtnD.classList.add("but");
    // plusBtnD.textContent = "+";
    // plusBtnD.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     di++;
    //     updateRect();
    // });
    // controlsD.appendChild(minusBtnD);
    // controlsD.appendChild(countDisplayD);
    // controlsD.appendChild(plusBtnD);
    // DiEl.appendChild(controlsD);
    
    // const labelT = document.createElement('div');
    // labelT.innerHTML="台";
    // TaiEl.appendChild(labelT);

    // const controlsT = document.createElement('div');
    // controlsT.style.display = "flex";
    // controlsT.style.justifyContent = "center";
    // controlsT.style.gap = "5px";
    // controlsT.style.marginTop = "4px";

    // const minusBtnT = document.createElement('div');
    // minusBtnT.classList.add("but");
    // minusBtnT.textContent = "–";
    // minusBtnT.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     if (tai > 1) tai--;
    //     if (tai < 1) tai=1;
    //     updateRect();
    // });

    // const countDisplayT = document.createElement('span');
    // countDisplayT.textContent = tai;
    // countDisplayT.classList.add('countDisplay');

    // const plusBtnT = document.createElement('div');
    // plusBtnT.classList.add("but");
    // plusBtnT.textContent = "+";
    // plusBtnT.addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     tai++;
    //     updateRect();
    // });
    // controlsT.appendChild(minusBtnT);
    // controlsT.appendChild(countDisplayT);
    // controlsT.appendChild(plusBtnT);
    // TaiEl.appendChild(controlsT);
    
    const labelB = document.createElement('div');
    labelB.innerHTML="Bonus";
    bonusEl.appendChild(labelB);

    const controlsB = document.createElement('div');
    controlsB.style.display = "flex";
    controlsB.style.justifyContent = "center";
    controlsB.style.gap = "5px";
    controlsB.style.marginTop = "4px";
    const minusBtnB = document.createElement('div');
    minusBtnB.classList.add("but");
    minusBtnB.textContent = "–";
    minusBtnB.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bonus > 0) bonus--;
        if (bonus < 0) bonus=0;
        updateRect();
    });
    const countDisplayB = document.createElement('span');
    countDisplayB.textContent = bonus;
    countDisplayB.classList.add('countDisplay');
    const plusBtnB = document.createElement('div');
    plusBtnB.classList.add("but");
    plusBtnB.textContent = "+";
    plusBtnB.addEventListener('click', (e) => {
        e.stopPropagation();
        bonus++;
        updateRect();
    });
    controlsB.appendChild(minusBtnB);
    controlsB.appendChild(countDisplayB);
    controlsB.appendChild(plusBtnB);
    bonusEl.appendChild(controlsB);
}

// Reset
resetBtnEl.addEventListener('click',()=>{
    choose.clear();
    lockin.clear();
    counts = counts.map(()=>0);
    updateRect();
});