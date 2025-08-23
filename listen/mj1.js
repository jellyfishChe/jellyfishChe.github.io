// 七對
function seven(hc){
    if(hc[13]==0){
        return false;
    }
    for(let i=0;i<13;i++){
        if(i%2==1){
            if(hc[i]==hc[i+1]){
                return false;
            }
        }else{
            if(hc[i]!=hc[i+1]){
                return false;
            }
        }
    }
    return true;
}

// 國士無雙
function guoshi(hc){
    if(hc[13]==0){
        return false;
    }
    const gs=new Set([1,9,10,18,19,27,28,29,30,31,32,33,34]);
    let hcSet=new Set();
    for (let i=0;i<14;i++){
        if(gs.has(hc[i])){
            hcSet.add(hc[i]);
        }else{
            return false;
        }
    }
    if(hcSet.size==13){
        return true;
    }
    return false;
}

// 天下無雙
function tianxia(hc){
    if(hc[13]==0){
        return false;
    }
    const tx=[10,11,12,13,14,17,18,20,22,23,24,26,27,34];
    for(let i=0;i<14;i++){
        if(tx[i]!=hc[i]){
            return false;
        }
    }
    return true;
}

// 十三不靠 
function no13(hc){
    if(hc[13]==0){
        return false;
    }
    const w=[new Set([1,4,7]),new Set([2,5,8]),new Set([3,6,9])];
    const b=[new Set([10,13,16]),new Set([11,14,17]),new Set([12,15,18])];
    const s=[new Set([19,22,25]),new Set([20,23,26]),new Set([21,24,27])];
    const Z=new Set([28,29,30,31,32,33,34]);

    let hcS=[new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set()];
    for (let i=0;i<14;i++){
        for(let j=0;j<3;j++){
            if(w[j].has(hc[i])){
                hcS[j].add(hc[i]);
            }else if(b[j].has(hc[i])){
                hcS[3+j].add(hc[i]);
            }else if(s[j].has(hc[i])){
                hcS[6+j].add(hc[i]);
            }
        }
        if(Z.has(hc[i])){
            hcS[9].add(hc[i]);
        }
    }
    const zzz=[
        [[1],[2],[3],[5],[6],[7]],
        [[1],[2],[3],[4],[6],[8]],
        [[0],[2],[4],[5],[6],[7]],
        [[0],[2],[3],[4],[7],[8]],
        [[0],[1],[4],[5],[6],[8]],
        [[0],[1],[3],[5],[7],[8]]
    ];
    let q=-1;
    for(let j=0;j<6;j++){
        let p=0;
        for(let i=0;i<6;i++){
            if(hcS[zzz[j][i]].size==0){
                p++;
            }
        }
        if(p==6){
            q=j;
            break;
        }
    }
    if(q>-1){
        let hcC=0;
        for(let i=0;i<10;i++){
            hcC+=hcS[i].size;
        }
        return hcC==13;
    }
    return false;
}

// 十四不靠
function no14(hc){
    if(hc[13]==0){
        return false;
    }
    const w=[new Set([1,4,7]),new Set([2,5,8]),new Set([3,6,9])];
    const b=[new Set([10,13,16]),new Set([11,14,17]),new Set([12,15,18])];
    const s=[new Set([19,22,25]),new Set([20,23,26]),new Set([21,24,27])];
    const Z=new Set([28,29,30,31,32,33,34]);

    let hcS=[new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set()];
    for (let i=0;i<14;i++){
        for(let j=0;j<3;j++){
            if(w[j].has(hc[i])){
                hcS[j].add(hc[i]);
            }else if(b[j].has(hc[i])){
                hcS[3+j].add(hc[i]);
            }else if(s[j].has(hc[i])){
                hcS[6+j].add(hc[i]);
            }
        }
        if(Z.has(hc[i])){
            hcS[9].add(hc[i]);
        }
    }
    const zzz=[
        [[1],[2],[3],[5],[6],[7]],
        [[1],[2],[3],[4],[6],[8]],
        [[0],[2],[4],[5],[6],[7]],
        [[0],[2],[3],[4],[7],[8]],
        [[0],[1],[4],[5],[6],[8]],
        [[0],[1],[3],[5],[7],[8]]
    ];
    let q=-1;
    for(let j=0;j<6;j++){
        let p=0;
        for(let i=0;i<6;i++){
            if(hcS[zzz[j][i]].size==0){
                p++;
            }
        }
        if(p==6){
            q=j;
            break;
        }
    }
    if(q>-1){
        let hcC=0;
        for(let i=0;i<10;i++){
            hcC+=hcS[i].size;
        }
        return hcC==14;
    }
    return false;
}

// default
function mjDefault(hc){
    const w=new Set([1,2,3,4,5,6,7,8,9]);
    const b=new Set([10,11,12,13,14,15,16,17,18]);
    const s=new Set([19,20,21,22,23,24,25,26,27]);
    const Z=new Set([28,29,30,31,32,33,34]);
    
    let hcW={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    let hcB={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    let hcS={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    let hcZ={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    function getCard(MP){
        let count=0;
        for (let i=1;i<=9;i++){
            count+=MP[i];
        }
        return count;
    }
    function threeCheck(hcWBS){
        let hcTmp=hcWBS;
        let Bool=false;
        if(getCard(hcTmp)==0){
            return true;
        }
        for (let i=1;i<=9;i++){
            if(hcTmp[i]>=3){
                hcTmp[i]-=3;
                if(threeCheck(hcTmp)){
                    Bool=true;
                    break;
                }
                hcTmp[i]+=3;
            }
            if(i<=7){
                if(hcTmp[i]>=1 && hcTmp[i+1]>=1 && hcTmp[i+2]>=1){
                    hcTmp[i]--;
                    hcTmp[i+1]--;
                    hcTmp[i+2]--;
                    if(threeCheck(hcTmp)){
                        Bool=true;
                    }
                    hcTmp[i]++;
                    hcTmp[i+1]++;
                    hcTmp[i+2]++;
                }
            }
        }
        if(Bool){
            return true;
        }
        return false;
    }
    function twoCheck(hcWBS){
        if(getCard[hcWBS]==0){
            return true;
        }
        let hcTmp=hcWBS;
        let Bool=false;
        for(let i=1;i<=9;i++){
            if(hcTmp[i]>=2){
                hcTmp[i]-=2;
                if(threeCheck(hcTmp)){
                    Bool=true;
                    break;
                }
                hcTmp[i]+=2;
            }
        }
        if(Bool){
            return true;
        }
        return false;
    }

    for (let i=0;i<14;i++){
        if(w.has(hc[i])){
            hcW[hc[i]]++;
        }else if(b.has(hc[i])){
            hcB[hc[i]-9]++;
        }else if(s.has(hc[i])){
            hcS[hc[i]-18]++;
        }else if(Z.has(hc[i])){
            hcZ[hc[i]-27]++;
        }
    }
    let hcCount=[getCard(hcW),getCard(hcB),getCard(hcS),getCard(hcZ)];
    if( !((hcCount[0]%3==2 && hcCount[1]%3==0 && hcCount[2]%3==0 && hcCount[3]%3==0)||
        (hcCount[0]%3==0 && hcCount[1]%3==2 && hcCount[2]%3==0 && hcCount[3]%3==0)||
        (hcCount[0]%3==0 && hcCount[1]%3==0 && hcCount[2]%3==2 && hcCount[3]%3==0)||
        (hcCount[0]%3==0 && hcCount[1]%3==0 && hcCount[2]%3==0 && hcCount[3]%3==2))){
        return false;
    }
    if(hcCount[3]%3==0){
        for(let i=1;i<=7;i++){
            if(hcZ[i]%3){
                return false;
            }
        }
    }else{
        let Zc=0;
        for(let i=1;i<=7;i++){
            if(hcZ[i]%3){
                if(hcZ[i]==2){
                    if(Zc==1){
                        return false;
                    }
                    Zc=1;
                }else{
                    return false;
                }
            }
        }
    }
    if(hcCount[2]%3==0){
        if(!threeCheck(hcS)){
            return false;
        }
    }else{
        if(!twoCheck(hcS)){
            return false;
        }
    }
    if(hcCount[1]%3==0){
        if(!threeCheck(hcB)){
            return false;
        }
    }else{
        if(!twoCheck(hcB)){
            return false;
        }
    }
    if(hcCount[0]%3==0){
        if(!threeCheck(hcW)){
            return false;
        }
    }else{
        if(!twoCheck(hcW)){
            return false;
        }
    }
    return true;
}

function mj1(hc){
    if(seven(hc)){
        return true;
    }
    if(guoshi(hc)){
        return true;
    }
    if(tianxia(hc)){
        return true;
    }
    if(no13(hc)){
        return true;
    }
    if(no14(hc)){
        return true;
    }
    if(mjDefault(hc)){
        return true;
    }
    return false;
}

function mj2(hc){
    let listening=[];
    for(let i=1;i<=34;i++){
        let hcTmp=hc;
        hcTmp.push(i);
        for (let j=0;j<14 && hcTmp.length>14;j++){
            if(hcTmp[j]==0){
                hcTmp[j]=hcTmp[14];
                hcTmp.pop();
            }
        }

        hcTmp.sort(compareNumbers);

        tmpLen=0;
        for (let q=0;q<14;q++){
            if(hcTmp[q]!=0){
                tmpLen++;
            }
        }
        for (let q=0;q<14-tmpLen;q++){
            for (let j=0;j<13;j++){
                let tmp=hcTmp[j];
                hcTmp[j]=hcTmp[j+1];
                hcTmp[j+1]=tmp;
            }
        }
        if(mj1(hcTmp)){
            listening.push(i);
        }

        for (let j=0;j<13;j++){
            if(hcTmp[j]>=i){
                hcTmp[j]=hcTmp[j+1];
            }
        }
        hcTmp[13]=0;
    }
    return listening;
}