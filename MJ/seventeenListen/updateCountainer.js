const rongEl = document.getElementById('rong');
function updateCountainer(){
    for (let i=0;i<34;i++){
        if(cardCount[i]>=4){
            cardObj[i].childNodes[0].classList.add("locked");
        }else{
            cardObj[i].childNodes[0].classList.remove("locked");
        }
    }
    handcardList.sort(compareNumbers);
    handcardLen=0;
    for (let i=0;i<14;i++){
        if(handcardList[i]!=0){
            handcardLen++;
        }
    }

    for (let i=0;i<14-handcardLen;i++){
        for (let j=0;j<13;j++){
            let tmp=handcardList[j];
            handcardList[j]=handcardList[j+1];
            handcardList[j+1]=tmp;
        }
    }

    for (let i=0;i<14;i++){
        handcardObj[i].childNodes[0].src=imgList[handcardList[i]].src;
        handcardObj[i].childNodes[0].alt=imgList[handcardList[i]].name;
    }

    for (let j=0;j<16;j++){
        if(j<listencardList.length){
            listencardObj[j].childNodes[0].src=imgList[listencardList[j]].src;
            listencardObj[j].childNodes[0].alt=imgList[listencardList[j]].name;
        }else{
            listencardObj[j].childNodes[0].src=imgList[0].src;
            listencardObj[j].childNodes[0].alt=imgList[0].name;
        }
    }
}

function compareNumbers(a, b) {
    return a - b;
}

// Reset
const resetBtnEl = document.getElementById('resetBTN');
resetBtnEl.addEventListener('click',()=>{
    for(let i=0;i<14;i++){
        handcardList[i]=0;
    }
    for(let i=0;i<34;i++){
        cardCount[i]=0;
    }
    listencardList=[];
    updateCountainer();
    rongEl.innerText="這裡看狀態";
});