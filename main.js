const container = document.getElementById('container');
const touchedCountEl = document.getElementById('touchedCount');
const resetBtnEl = document.getElementById('resetBTN');

let MJcount=[];
let obj=[];
let choose=new Set();
let lockin=new Set();

lockMap.has = function(key) {
    // Check if the key exists directly in the object's own properties
    return Object.prototype.hasOwnProperty.call(this, key);
};

Promise.all([
    d3.csv("MJ.csv")
]).then(function(data) {
    MJcount=data[0];
    plotRectangle();
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

        if(choose.has(i)){
            obj[i].classList.add('touched');
        }else if(lockin.has(i)){
            obj[i].classList.add('locked');
        }
    }

    let counter=0;
    for (let ch of choose){
        counter+=parseInt(MJcount[ch].num);
    }
    if(choose.has(87)){
        counter*=2;
    }
    touchedCountEl.textContent = counter;
}

function plotRectangle(){
    for (let i=0; i < MJcount.length; i++) {
        const rect = document.createElement('div');
        rect.classList.add('rectangle');
        if(i==87){
            rect.innerHTML = MJcount[i].name+"<br>"+"Double";
        }else{
            rect.innerHTML = MJcount[i].name+"<br>"+MJcount[i].num+"番...."+i;
        }
        // Click event to toggle touch state
        rect.addEventListener('click', () => {
            if (!rect.classList.contains('locked')) {
                if (rect.classList.contains('touched')) {
                    choose.delete(i);
                } else {
                    choose.add(i);
                }
                updateRect(i);
            }
        });
        obj.push(rect);
        container.appendChild(obj[i]);
    }
}

resetBtnEl.addEventListener('click',()=>{
    choose.clear();
    lockin.clear();
    updateRect();
})
