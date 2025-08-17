const container = document.getElementById('container');
const touchedCountEl = document.getElementById('touchedCount');
const resetBtnEl = document.getElementById('resetBTN');

let MJcount = [];
let obj = [];
let choose = new Set();
let lockin = new Set();
let counts = [];

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

    for (let i=0; i < MJcount.length; i++) {
        obj[i].classList.remove('touched');
        obj[i].classList.remove('locked');
        if(i==85 || i==86){
            obj[i].querySelector('.countDisplay').textContent = counts[i]; // 更新顯示數量
        }
        if(choose.has(i)){
            obj[i].classList.add('touched');
        }else if(lockin.has(i)){
            obj[i].classList.add('locked');
            counts[i]=0;
        }
    }

    let counter=0;
    for (let i=0; i < MJcount.length; i++){
        if (counts[i] > 0) {
            counter += counts[i] * (Number(MJcount[i].num) || 0);
        }
    }

    if(choose.has(87)){
        counter *= 2;
    }

    touchedCountEl.textContent = counter;
}

function plotRectangle(){
    for (let i=0; i < MJcount.length; i++) {
        counts[i] = 0;

        const rect = document.createElement('div');
        rect.classList.add('rectangle');

        const label = document.createElement('div');
        if(i == 87){
            label.innerHTML = MJcount[i].name + "<br>Double";
        }else if(i == 85 || i == 86){
            label.innerHTML = MJcount[i].name ;
        }else{
            label.innerHTML = MJcount[i].name + "<br>" + MJcount[i].num + "番";
        }
        rect.appendChild(label);
        
        if(i==85){
            const controls = document.createElement('div');
            controls.style.display = "flex";
            controls.style.justifyContent = "center";
            controls.style.gap = "5px";
            controls.style.marginTop = "4px";

            const minusBtn = document.createElement('button');
            minusBtn.textContent = "–";
            minusBtn.style.width = "22px";
            minusBtn.style.height = "22px";
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (counts[i] > 0) counts[i]--;
                if (counts[i] === 0) choose.delete(i);
                updateRect(i);
            });

            const countDisplay = document.createElement('span');
            countDisplay.textContent = counts[i];
            countDisplay.classList.add('countDisplay');

            const plusBtn = document.createElement('button');
            plusBtn.textContent = "+";
            plusBtn.style.width = "22px";
            plusBtn.style.height = "22px";
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (counts[i] > 7) counts[i]--;
                counts[i]++;
                choose.add(i);
                updateRect(i);
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

            const minusBtn = document.createElement('button');
            minusBtn.textContent = "–";
            minusBtn.style.width = "22px";
            minusBtn.style.height = "22px";
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

            const plusBtn = document.createElement('button');
            plusBtn.textContent = "+";
            plusBtn.style.width = "22px";
            plusBtn.style.height = "22px";
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
}

// Reset
resetBtnEl.addEventListener('click',()=>{
    choose.clear();
    lockin.clear();
    counts = counts.map(()=>0);
    updateRect();
});