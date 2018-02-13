;
(function (w) {

    w.app = {
        appServiceName: "/msg",
        appServiceBasePath: "/",
        appVersionName: "1.0.0",
        appIP:"wx.rybal.com"
    }

    w.app.wsUrl = "ws://"+ w.app.appIP+"/msg/websocket/message";
    w.app.appRealPath = w.app.appServiceName + w.app.appServiceBasePath;

    //
    var _filesUrls = [
        "adapter/media.js",

        "adapter/normalize.css",
        "adapter/Font-Awesome-3.2.1/css/font-awesome.min.css",
        "adapter/Framework7-1.6.0/dist/css/framework7.ios.min.css",
        "adapter/Framework7-1.6.0/dist/css/framework7.ios.colors.min.css",
        "adapter/scrolltopanimation/build/scrolltopanimation.min.css",
        "adapter/scrolltopanimation/build/scrolltopanimation-theme.min.css",

        //"adapter/sidesliding/build/sidesliding.min.css",
        "adapter/sidesliding/src/sidesliding.css",
        "adapter/sidesliding/themes/default/sidesliding.css",

        "adapter/button.min.css",
        "res/f7reset.css",
        "res/common.css",
        "res/expression.css",

        "adapter/jquery-2.0.3.min.js",
        "adapter/jquery.lazyload.min.js",
        "adapter/underscore-min.js",
        "adapter/Framework7-1.6.0/dist/js/framework7.min.js",
        "adapter/scrolltopanimation//build/scrolltopanimation.min.js",

        //"adapter/sidesliding/build/sidesliding.min.js",
        "adapter/sidesliding/src/sidesliding.js",

        "util/stringbuffer.js",
        "util/hashmap.js",
        "util/websocket.js",
        "util/preferences.js",
        "util/Tool.js",
        "util/httputil.js",
        "util/dateutil.js",
        "util/f7appglpobalExt.js",
        "util/ArrayExt.js",

        "core/user.js",
        "core/usermanager.js",
        "core/app.js"
    ];

    function required() {
        for (var i = 0; i < _filesUrls.length; i++) {
            var name = _filesUrls[i].replace(/^\s|\s$/g, "");
            var att = name.split('.');
            var isCSS = att[att.length - 1].toLowerCase() == "css";

            var link = w.app.appRealPath + name;
            if (isCSS) {
                JSLoader.loadStyleSheet(link);
            } else {
                JSLoader.loadJavaScript(link);
            }
        }
    }

    required();

    w.onload = function () {
        w.app.initial();
    }

})(window);