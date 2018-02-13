/**
 * Created by ctsjd on 2016/2/17.
 * 以动画的方式让指定元素滚动到顶部
 */
(function(){

    /**
     * create
     * @param $
     * @param w
     */
    function create($,w) {
        /**
         * 滚动时间
         * @type {number}
         */
        var duration = 300,
            /**
             * 用于切换时的遮罩
             */
            $mask = null;

        /**
         * 创建
         */
        function create() {
            var _self = this;

            if(!w.document.body.querySelector(".ct-scrollTopAnimation-mask")) {
                $mask = $("<div class='ct-scrollTopAnimation-mask'></div>");
                w.document.body.appendChild($mask[0]);
            } else if(!$mask) {
                $mask = $(w.document.body).find(".ct-scrollTopAnimation-mask");
            }

            /**
             * 点击操作按钮
             */
            _self._$btnJO[0].addEventListener("click",function(){
                if(_self._key) return;

                _self._key = true;
                $mask[0].style.display = "block";

                var scrollVal,
                    srcTop = _self._$scrollJO[0].scrollTop,
                    scrollVal = srcTop,
                    targetTop = 0,
                    /**
                     * 一次滚动的步进
                     * @type {number}
                     */
                    setp = _self._$scrollJO[0].scrollHeight / ( duration/(screen.updateInterval || 16.7) + (duration % (screen.updateInterval || 16.7) !==0 ? 1 : 0) );

                /**
                 * 动画的滚动
                 */
                function scrollAnimation() {
                    if (srcTop < targetTop) {
                        if ((scrollVal + setp) > targetTop) {
                            scrollVal = targetTop;
                        } else {
                            scrollVal += setp;
                        }
                    }
                    else {
                        if ((scrollVal - setp) < targetTop) {
                            scrollVal = targetTop;
                        } else {
                            scrollVal -= setp;
                        }
                    }

                    _self._$scrollJO[0].scrollTop = scrollVal;

                    if (srcTop < targetTop) {
                        if (scrollVal >= targetTop) {
                            clear();
                        } else {
                            w.requestAnimationFrame(scrollAnimation);
                        }
                    } else {
                        if (scrollVal <= targetTop) {
                            clear();
                        } else {
                            w.requestAnimationFrame(scrollAnimation);
                        }
                    }

                    function clear() {
                        _self._key = false;
                        $mask[0].style.display = "none";
                    }
                }
                /**
                 * 滚动core
                 * @type {number}
                 */
                w.requestAnimationFrame(scrollAnimation);
            },false);

            /**
             * 滚动的event
             */
            _self._$scrollJO[0].addEventListener("scroll",function(){
                if(this.scrollTop !== 0) {
                    w.requestAnimationFrame(function () {
                        _self._$btnJO[0].style.display = "block";
                    });
                } else {
                    w.requestAnimationFrame(function () {
                        _self._$btnJO[0].style.display = "none";
                    });
                }
            },false);
        }

        /**
         * constructor
         * @param $scrollJO 滚动对象
         * @param $innerJO 滚动内部对象
         * @param $btnJO 操作的按钮
         * @private
         */
        function _$($scrollJO,$btnJO) {
            this._$scrollJO = $scrollJO;
            this._$btnJO = $btnJO;

            /**
             * 执行动画时的锁
             * @type {boolean}
             */
            this._key = false;

            /**
             * create
             */
            create.call(this);
        }

        /**
         * 以动画的方式让指定元素滚动到顶部
         * @param $scrollJO
         * @param $btnJO
         */
        return function($scrollJO,$btnJO) {
            return new _$($scrollJO,$btnJO);
        }
    }

    if(typeof define === 'function' && (define.amd || define.cmd)) {
        define("scrolltopanimation",["jquery"],function($){
            return create($,window);
        });
    } else {
        window.scrollTopAnimationFactory = create(jQuery,window);
    }

})();
