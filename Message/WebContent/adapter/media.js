/**
 * Created by ctsjd on 2015/8/24.
 * 动态计算html的font-size大小
 * 假定clientWidth为320时，html的font-size:20px;
 */
(function () {

    function create(doc,win) {

        var docEl = doc.documentElement, resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize',
            recalc = function () {
                var clientHeight = docEl.clientHeight;
                if (!clientHeight) return;
                docEl.style.fontSize = 20 * (clientHeight / 480) + "px";
            };

        if (!doc.addEventListener) return;
        win.addEventListener(resizeEvt, recalc, false);
        doc.addEventListener('DOMContentLoaded', recalc, false);

        return {};

    }

    if(typeof define === 'function' && (define.amd || define.cmd)) {
        define("media",function(){
            return create(document,window);
        });
    } else {
        create(document,window);
    }

})();