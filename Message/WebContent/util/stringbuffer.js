/**
 * 动态字符串
 */
(function () {

    /**
     * create
     * @returns {classProto}
     */
    function create() {

        var classProto = function (str) {
            this.arr = [];
            if (str != null) {
                this.arr.push(str);
            }
        };

        classProto.prototype = {
            /**
             * 追加
             * @param str
             * @returns {StringBuffer}
             */
            append: function (str) {
                this.arr.push(str);
                return this;
            },
            /**
             * 输出动态字符串
             * @returns {string}
             */
            toString: function () {
                return this.arr.join("");
            },
            /**
             * 清理
             */
            clear: function () {
                this.arr = [];
            }
        }

        return classProto;
    }

    if(typeof define === 'function' && (define.amd || define.cmd)) {
        define("StringBuffer",function(){
            return create();
        });
    } else {
        window.StringBuffer = create();
    }

})();