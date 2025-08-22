const cardContainerEl = document.getElementById('cardContainer');
const handcardContainerEl = document.getElementById('handcardContainer');

let handcardList=[];
let handcardObj=[];
let handcardLen=0;
let cardCount=[];
let cardObj=[];
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
                    if(handcardList[j]===0){
                        handcardList[j]=handcardList[14];
                        handcardList.pop();
                    }
                }
            }
            updateCountainer();            
            if(mj1(handcardList)){
                rongEl.innerText="合法胡牌";
            }else{
                rongEl.innerText="不要亂搞";
            }
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
            updateCountainer();
            if(mj1(handcardList)){
                rongEl.innerText="合法胡牌";
            }else{
                rongEl.innerText="不要亂搞";
            }
        });
        
        handcardObj.push(handcard);
        handcardContainerEl.appendChild(handcard);
    }
}

