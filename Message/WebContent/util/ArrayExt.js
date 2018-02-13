;
(function () {

    /**
     * 扩展indexOf
     * @param searchObj 查找对象
     * @param searchP 查找属性
     * @param indexStart 从什么位置查找
     */
    Array.prototype.indexOfEx = function (searchObj, p, indexStart) {
        var index = -1;
        var i = indexStart ? indexStart : 0;
        var tval = searchObj[p];
        for (; i < this.length; i++) {
            var item = this[i];
            if (item[p] === tval) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * 扩展lastIndexOfEx
     * @param searchObj
     * @param p
     * @param indexStart
     */
    Array.prototype.lastIndexOfEx = function (searchObj, p, indexStart) {
        var index = -1;
        var i = indexStart ? indexStart : this.length - 1;
        var tval = searchObj[p];
        for (; i >= 0; i--) {
            var item = this[i];
            if (item[p] === tval) {
                index = i;
                break;
            }
        }
        return index;
    }

})();