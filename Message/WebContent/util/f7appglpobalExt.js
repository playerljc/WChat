/**
 * 扩展app.f7.app
 */
f7appglpobalExt = (function(){

    return {
        /**
         * 显示没有数据的指示器
         * @param dom
         * @param title
         */
        showNoDataIndicator:function(dom,title){
            if(title) {
                dom.querySelector(".text").innerText = title;
            }
            dom.style.display = "flex";
        },
        /**
         * 隐藏没有数据的指示器
         * @param dom
         */
        hideNoDataIndicator:function(dom){
            dom.style.display = "none";
        },
        /**
         * 显示没有很多了
         * @param dom
         * @param title
         */
        showNoAppendDataIndicator:function(dom,title){
            if(title) {
                dom.innerText = title;
            }
            dom.style.display = "block";
        },
        /**
         * 隐藏没有更多了
         * @param dom
         */
        hideNoAppendDataIndicator:function(dom) {
            dom.style.display = "none";
        }
    }

})();