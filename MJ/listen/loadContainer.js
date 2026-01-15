const cardContainerEl = document.getElementById('cardContainer');
const handcardContainerEl = document.getElementById('handcardContainer');
const listenContainerEl = document.getElementById('listenContainer');

let handcardList=[];
let handcardObj=[];
let handcardLen=0;
let cardCount=[];
let cardObj=[];
let listencardList=[];
let listencardObj=[];
function plotContainer(){
    for (let i=0;i<34;i++){
        const card = document.createElement('div');
        card.classList.add('card');    
        const cardimg = document.createElement('img');
        cardimg.src = imgList[i+1].src;
        cardimg.alt = imgList[i+1].name;
        card.appendChild(cardimg);
        cardCount.push(0);
        card.addEventListener('click', () => {
            if (cardCount[i]<4 && handcardLen<14) {
                cardCount[i]++;
                handcardList.push(i+1);
                for (let j=0;j<14 && handcardList.length>14;j++){
                    if(handcardList[j]==0){
                        handcardList[j]=handcardList[14];
                        handcardList.pop();
                    }
                }
            }
            listencardList=[];
            handcardLen=0;
            for (let i=0;i<14;i++){
                if(handcardList[i]!=0){
                    handcardLen++;
                }
            }
            if(handcardLen%3==2){
                if(mj1(handcardList)){
                    rongEl.innerText="合法胡牌";
                }else{
                    rongEl.innerText="詐胡XD";
                }
            }else if(handcardLen%3==1){
                if(mj2(handcardList).length>0){
                    listencardList=mj2(handcardList);
                    rongEl.innerText="聽牌中";
                }else{
                    rongEl.innerText="沒有聽";
                }
            }else{
                rongEl.innerText="?_?";
            }
            updateCountainer();
        });
        cardObj.push(card);
        cardContainerEl.appendChild(card);
    }

    for (let i=0;i<14;i++){
        const handcard = document.createElement('div');
        handcard.classList.add('handcard');
        const handcardimg = document.createElement('img');
        handcardList.push(0);
        handcardimg.src = imgList[handcardList[i]].src;
        handcardimg.alt = imgList[handcardList[i]].name;
        handcard.appendChild(handcardimg);
        handcard.addEventListener('click', () => {
            if (handcardList[i]!=0) {
                cardCount[handcardList[i]-1]--;
                for (let j=i;j<13;j++){
                    handcardList[j]=handcardList[j+1];
                }
                handcardList[13]=0;
            }
            listencardList=[];
            handcardLen=0;
            for (let i=0;i<14;i++){
                if(handcardList[i]!=0){
                    handcardLen++;
                }
            }
            if(handcardLen%3==2){
                if(mj1(handcardList)){
                    rongEl.innerText="合法胡牌";
                }else{
                    rongEl.innerText="詐胡XD";
                }
            }else if(handcardLen%3==1){
                if(mj2(handcardList).length>0){
                    listencardList=mj2(handcardList);
                    rongEl.innerText="聽牌中";
                }else{
                    rongEl.innerText="沒有聽";
                }
            }else{
                rongEl.innerText="?_?";
            }
            updateCountainer();
        });
        
        handcardObj.push(handcard);
        handcardContainerEl.appendChild(handcard);
    }

    for (let i=0;i<16;i++){
        const listencard = document.createElement('div');
        listencard.classList.add('listencard');
        const listencardimg = document.createElement('img');
        listencardList.push(0);
        listencardimg.src = imgList[listencardList[i]].src;
        listencardimg.alt = imgList[listencardList[i]].name;
        listencard.appendChild(listencardimg);
        listencardObj.push(listencard);
        listenContainerEl.appendChild(listencard);
    }
}