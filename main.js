const container = document.getElementById('container');
const touchedCountEl = document.getElementById('touchedCount');
const resetBtnEl = document.getElementById('resetBTN');

let touchedCount = 0;
let MJcount=[];
let obj=[];

Promise.all([
    d3.csv("MJ.csv")
]).then(function(data) {
    MJcount=data[0];
    plotRectangle();
});

function plotRectangle(){
    for (let i=1; i <= MJcount.length; i++) {
        const rect = document.createElement('div');
        rect.classList.add('rectangle');
        rect.textContent = MJcount[i-1].name;

        // Click event to toggle touch state
        rect.addEventListener('click', () => {
            if (rect.classList.contains('touched')) {
                rect.classList.remove('touched');
                touchedCount-=parseInt(MJcount[i-1].num);
            } else {
                rect.classList.add('touched');
                touchedCount+=parseInt(MJcount[i-1].num);
            }
            updateCounter();
        });
        obj.push(rect);
        container.appendChild(rect);
    }
}

resetBtnEl.addEventListener('click',()=>{
    touchedCount = 0;
    for(let i=0;i<MJcount.length;i++){
        if(obj[i].classList.contains('touched')){
            obj[i].classList.remove('touched');
        }
    }
    updateCounter();
})

function updateCounter() {
    touchedCountEl.textContent = touchedCount;
}