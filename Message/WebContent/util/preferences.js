(function () {

    function create(w) {
        /**
         * 首选项
         */
        var preferences = {};

        /**
         * 本地持久化一对键值(值为String)
         */
        preferences.putStringByLocal = function (key, value) {
            putString(key, value, w.localStorage);
        };

        /**
         * 本地取出值(值为String)
         */
        preferences.getStringByLocal = function (key) {
            return getString(key, w.localStorage);
        };

        /**
         * 本地持久化一对键值(值为对象)
         */
        preferences.putObjectByLocal = function (key, object) {
            putObject(key, object, w.localStorage);
        };

        /**
         * 本地取出值(值为对象)
         */
        preferences.getObjectByLocal = function (key) {
            return getObject(key, w.localStorage);
        };

        /**
         * 本地删除一个键值
         */
        preferences.removeByLocal = function (key) {
            remove(key, w.localStorage);
        };


        /**
         * 会话持久化一对键值(值为String)
         */
        preferences.putStringBySession = function (key, value) {
            putString(key, value, w.sessionStorage);
        };

        /**
         * 会话取出值(值为String)
         */
        preferences.getStringBySession = function (key) {
            return getString(key, w.sessionStorage);
        };

        /**
         * 会话持久化一对键值(值为对象)
         */
        preferences.putObjectBySession = function (key, object) {
            putObject(key, object, w.sessionStorage);
        };

        /**
         * 会话取出值(值为对象)
         */
        preferences.getObjectBySession = function (key) {
            return getObject(key, w.sessionStorage);
        };

        /**
         * 会话删除一个键值
         */
        preferences.removeBySession = function (key) {
            remove(key, w.sessionStorage);
        };

        /**
         * 在session中查找是否有指定key的值
         * @param key
         */
        preferences.isSBySession = function(key) {
            var result = false;
            if (w.sessionStorage.getItem(key)) {
                result = true;
            }
            return result;
        };

        /**
         * 在local中查找是否有指定的key值
         * @param key
         */
        preferences.isValueByLocal = function(key) {
            var result = false;
            if (w.localStorage.getItem(key)) {
                result = true;
            }
            return result;
        };

        /**
         * 本地持久化一对键值
         */
        function putString(key, value, storage) {
            storage.setItem(key, value);
        };

        /**
         * 本地取出值
         */
        function getString(key, storage) {
            return storage.getItem(key);
        };

        /**
         * 本地持久化一对键值
         */
        function putObject(key, object, storage) {
            var val = JSON.stringify(object);
            putString(key, val, storage);
        };

        /**
         * 本地取出值
         */
        function getObject(key, storage) {
            var val = storage.getItem(key);
            if (val == null) return null;

            return JSON.parse(val);
        };

        /**
         * 删除键值
         */
        function remove(key, storage) {
            storage.removeItem(key);
        };

        return preferences;
    }

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define("Preferences", function () {
            return create(window);
        });
    } else {
        window.Preferences = create(window);
    }

})();