let imgList=[];
Promise.all([
    d3.csv("imgData.csv")
]).then(function(data) {
    imgList = data[0];
    plotContainer();
});
