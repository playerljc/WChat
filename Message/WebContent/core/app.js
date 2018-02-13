/**
 * app
 */
app = (function ($, w) {

    /**
     * paths
     * @private
     */
    var _paths = {
        index: [
            "moudle/masspopup/masspopup.js",
            "moudle/index/index.css",
            "moudle/index/index.js"
        ],
        messages: [
            "moudle/messages/messages.css",
            "moudle/messages/messages.js"
        ]
    };

    /**
     * 初始化f7
     */
    function initf7() {
        app.f7 = {};
        app.f7.app = new Framework7({
            init: false,
            animateNavBackIcon: true,
            precompileTemplates: true,
            swipeBackPage: false,
            swipePanelOnlyClose: true,
            pushState: true,
            upscroller: {text: '回到顶部'},
            //template7Pages: true,
            modalTitle: "提示",
            modalButtonOk: "确定",
            modalButtonCancel: "取消",
            fastClicks: false,
            activeState: false
        });
        w.$$ = Dom7;
        app.f7.mainView = app.f7.app.addView('.view-main', {
            dynamicNavbar: true,
            domCache: true
        });

        app.f7.app = $.extend(app.f7.app, f7appglpobalExt);
    }

    /**
     * 初始化f7事件
     */
    function initF7Events() {
        var o_array_js = {};

        /**
         * pageInit
         */
        $$(document).on('pageInit', function (e) {
            var page = e.detail.page;
            if (!page.name) return;

            app.f7.app.closeModal();

            if (o_array_js[page.name]) {
                if (w["init_" + page.name]) {
                    w["init_" + page.name](page);
                }
            } else {
                var paths = _paths[page.name];
                var group = [];
                for (var i = 0, len = paths.length; i < len; i++) {
                    group.push(app.appRealPath + paths[i]);
                }

                Tool.loadAsyncScriptAndCss(group).done(function () {
                    o_array_js[page.name] = {};
                    if (w["init_" + page.name]) {
                        w["init_" + page.name](page);
                        // 如果是iOS的全屏模式
                        if (w.app.device.statusbar && w.app.device.statusbar == "overlay") {
                            // 所有page向下移动20px;
                            w[page.name].getPageJO().addClass("page-with-statusbar-overlay");
                        }
                    }
                });
            }
        });

        /**
         * pageBeforeAnimation
         */
        $$(document).on("pageBeforeAnimation", function (e) {
            var page = e.detail.page;
            if (!page.name) return;
            if (w["pagebeforeshow_" + page.name]) {
                w["pagebeforeshow_" + page.name](page);
            }
        });

        /**
         * pageAfterAnimation
         */
        $$(document).on("pageAfterAnimation", function (e) {
            var page = e.detail.page;
            if (!page.name) return;
            if (w["pageaftershow_" + page.name]) {
                w["pageaftershow_" + page.name](page);
            }
        });

        /**
         * pageAfterBack
         */
        $$(document).on('pageBack', function (e) {
            var page = e.detail.page;
            if (w["init_" + page.name + "_afterback"]) {
                w["init_" + page.name + "_afterback"](page);
            }
        });

        /**
         * pageBack
         */
        $$(document).on('pageBack', function (e) {
            var page = e.detail.page;
            if (w["init_" + page.name + "_back"]) {
                w["init_" + page.name + "_back"](page);
            }
        });

        /**
         * pageBeforeRemove
         */
        $$(document).on('pageBeforeRemove', function (e) {
            var page = e.detail.page;
            if (w["init_" + page.name + "_beforeremove"]) {
                w["init_" + page.name + "_beforeremove"](page);
            }
        });
    }

    /**
     * 初始化一些公共的事件
     */
    function initCommonEvents() {
        /**
         * Ajax启用缓存(不加时间)
         */
        $.ajaxSetup({
            cache: true
        });

        /**
         * 点击浏览器前进或后退按钮的事件
         */
        w.addEventListener("popstate", function (e) {
            app.f7.app.closeModal();
        });

        /**
         * 窗体改变尺寸的时候
         */
        w.addEventListener("resize", function (e) {
            $(document).trigger(app.events.window.resize);
        });
    }

    /**
     * 初始化和客户端进行通信的对象
     */
    function initClientCommunicationObj() {
        w.app.clientObj = {}
    }

    /**
     * 设置WebViewJavascriptBridge对象
     */
    function setupWebViewJavascriptBridge() {

        var _params = Tool.getUrlParam(window.location.href);

        w.app.device.platform = "platform" in _params ? _params.platform : "wechat";

        if (w.app.device.platform === "iOS") {
            setupiOSWebViewJavascriptBridge(function (bridge) {
                w.app.bridge = bridge;

                // 如果是全屏模式
                w.app.bridge.callHandler("getStatusBarMode", {}, function (responseData) {
                    if (responseData.statusbar === "overlay") {
                        // 状态栏设置为全屏模式
                        w.app.device.statusbar = "overlay";
                        // statysbarOverlay显示
                        $(document.documentElement).addClass("with-statusbar-overlay");
                        // 所有Popup向下移动20px;
                        $(".popup").addClass("page-with-statusbar-overlay");
                    }
                });

                w.app.initCore();
            });
        } else if (w.app.device.platform === "Android") {
            setupAndroidWebViewJavascriptBridge(function (bridge) {
                w.app.bridge = bridge;
                w.app.bridge.init(function (message, responseCallback) {

                });
                w.app.initCore();
            });
        } else if (w.app.device.platform === "wechat") {
            w.app.initCore();
        }

    }

    /**
     * 设置iOS的WebViewJavascriptBridge
     * @returns {Number}
     */
    function setupiOSWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(WebViewJavascriptBridge);
        }
        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe)
        }, 0);
    }

    /**
     * 设置Android的WebViewJavascriptBridge
     */
    function setupAndroidWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function () {
                callback(window.WebViewJavascriptBridge);
            }, false);
        }
    }


    /**
     * app-obj
     */
    var obj = {
        appVersionName: "V1.1.1",
        /**
         * 表情符的字典
         */
        //expressionCodes:[
        //    {
        //        "symbol": "/::)",
        //        "name": "微笑"
        //    },
        //    {
        //        "symbol": "/::~",
        //        "name": "伤心"
        //    },
        //    {
        //        "symbol": "/::B",
        //        "name": "美女"
        //    },
        //    {
        //        "symbol": "/::|",
        //        "name": "发呆"
        //    },
        //    {
        //        "symbol": "/:8-)",
        //        "name": "墨镜"
        //    },
        //    {
        //        "symbol": "/::<",
        //        "name": "哭"
        //    },
        //    {
        //        "symbol": "/::$",
        //        "name": "羞"
        //    },
        //    {
        //        "symbol": "/::X",
        //        "name": "哑"
        //    },
        //    {
        //        "symbol": "/::Z",
        //        "name": "睡"
        //    },
        //    {
        //        "symbol": "/::’(",
        //        "name": "哭"
        //    },
        //    {
        //        "symbol": "/::-|",
        //        "name": "囧"
        //    },
        //    {
        //        "symbol": "/::@",
        //        "name": "怒"
        //    },
        //    {
        //        "symbol": "/::P",
        //        "name": "调皮"
        //    },
        //    {
        //        "symbol": "/::D",
        //        "name": "笑"
        //    },
        //    {
        //        "symbol": "/::O",
        //        "name": "惊讶"
        //    },
        //    {
        //        "symbol": "/::(",
        //        "name": "难过"
        //    },
        //    {
        //        "symbol": "/::+",
        //        "name": "酷"
        //    },
        //    {
        //        "symbol": "/:–b",
        //        "name": "汗"
        //    },
        //    {
        //        "symbol": "/::Q",
        //        "name": "抓狂"
        //    },
        //    {
        //        "symbol": "/::T",
        //        "name": "吐"
        //    },
        //    {
        //        "symbol": "/:,@P",
        //        "name": "笑"
        //    },
        //    {
        //        "symbol": "/:,@-D",
        //        "name": "快乐"
        //    },
        //    {
        //        "symbol": "/::d",
        //        "name": "奇"
        //    },
        //    {
        //        "symbol": "/:,@o",
        //        "name": "傲"
        //    },
        //    {
        //        "symbol": "/::g",
        //        "name": "饿"
        //    },
        //    {
        //        "symbol": "/:|-)",
        //        "name": "累"
        //    },
        //    {
        //        "symbol": "/::!",
        //        "name": "吓"
        //    },
        //    {
        //        "symbol": "/::L",
        //        "name": "汗"
        //    },
        //    {
        //        "symbol": "/::>",
        //        "name": "高兴"
        //    },
        //    {
        //        "symbol": "/::,@",
        //        "name": "闲"
        //    },
        //    {
        //        "symbol": "/:,@f",
        //        "name": "努力"
        //    },
        //    {
        //        "symbol": "/::-S",
        //        "name": "骂"
        //    },
        //    {
        //        "symbol": "/:?",
        //        "name": "疑问"
        //    },
        //    {
        //        "symbol": "/:,@x",
        //        "name": "秘密"
        //    },
        //    {
        //        "symbol": "/:,@@",
        //        "name": "乱"
        //    },
        //    {
        //        "symbol": "/::8",
        //        "name": "疯"
        //    },
        //    {
        //        "symbol": "/:,@!",
        //        "name": "哀"
        //    },
        //    {
        //        "symbol": "/:!!!",
        //        "name": "鬼"
        //    },
        //    {
        //        "symbol": "/:xx",
        //        "name": "打击"
        //    },
        //    {
        //        "symbol": "/:bye",
        //        "name": "bye"
        //    },
        //    {
        //        "symbol": "/:wipe",
        //        "name": "汗"
        //    },
        //    {
        //        "symbol": "/:dig",
        //        "name": "抠"
        //    },
        //    {
        //        "symbol": "/:handclap",
        //        "name": "鼓掌"
        //    },
        //    {
        //        "symbol": "/:&-(",
        //        "name": "糟糕"
        //    },
        //    {
        //        "symbol": "/:B-)",
        //        "name": "恶搞"
        //    },
        //    {
        //        "symbol": "/:<@",
        //        "name": "什么"
        //    },
        //    {
        //        "symbol": "/:@>",
        //        "name": "什么"
        //    },
        //    {
        //        "symbol": "/::-O",
        //        "name": "累"
        //    },
        //    {
        //        "symbol": "/:>-|",
        //        "name": "看"
        //    },
        //    {
        //        "symbol": "/:P-(",
        //        "name": "难过"
        //    },
        //    {
        //        "symbol": "/::’|",
        //        "name": "难过"
        //    },
        //    {
        //        "symbol": "/:X-)",
        //        "name": "坏"
        //    },
        //    {
        //        "symbol": "/::*",
        //        "name": "亲"
        //    },
        //    {
        //        "symbol": "/:@x",
        //        "name": "吓"
        //    },
        //    {
        //        "symbol": "/:8*",
        //        "name": "可怜"
        //    },
        //    {
        //        "symbol": "/:pd",
        //        "name": "刀"
        //    },
        //    {
        //        "symbol": "/<W>:",
        //        "name": "水果"
        //    },
        //    {
        //        "symbol": "/:beer",
        //        "name": "酒"
        //    },
        //    {
        //        "symbol": "/:basketb",
        //        "name": "篮球"
        //    },
        //    {
        //        "symbol": "/:oo",
        //        "name": "乒乓"
        //    },
        //    {
        //        "symbol": "/:coffee",
        //        "name": "咖啡"
        //    },
        //    {
        //        "symbol": "/:eat",
        //        "name": "美食"
        //    },
        //    {
        //        "symbol": "/:pig",
        //        "name": "动物"
        //    },
        //    {
        //        "symbol": "/:rose",
        //        "name": "鲜花"
        //    },
        //    {
        //        "symbol": "/:fade",
        //        "name": "枯"
        //    },
        //    {
        //        "symbol": "/:showlove",
        //        "name": "唇"
        //    },
        //    {
        //        "symbol": "/:heart",
        //        "name": "爱"
        //    },
        //    {
        //        "symbol": "/:break",
        //        "name": "分手"
        //    },
        //    {
        //        "symbol": "/:cake",
        //        "name": "生日"
        //    },
        //    {
        //        "symbol": "/:li",
        //        "name": "电"
        //    }
        //],
        expressionCodes: [
            {
                "symbol": "0xa0",
                "name": "微笑"
            },
            {
                "symbol": "0xa1",
                "name": "伤心"
            },
            {
                "symbol": "0xa2",
                "name": "美女"
            },
            {
                "symbol": "0xa3",
                "name": "发呆"
            },
            {
                "symbol": "0xa4",
                "name": "墨镜"
            },
            {
                "symbol": "0xa5",
                "name": "哭"
            },
            {
                "symbol": "0xa6",
                "name": "羞"
            },
            {
                "symbol": "0xa7",
                "name": "哑"
            },
            {
                "symbol": "0xa8",
                "name": "睡"
            },
            {
                "symbol": "0xa9",
                "name": "哭"
            },
            {
                "symbol": "0xb0",
                "name": "囧"
            },
            {
                "symbol": "0xb1",
                "name": "怒"
            },
            {
                "symbol": "0xb2",
                "name": "调皮"
            },
            {
                "symbol": "0xb3",
                "name": "笑"
            },
            {
                "symbol": "0xb4",
                "name": "惊讶"
            },
            {
                "symbol": "0xb5",
                "name": "难过"
            },
            {
                "symbol": "0xb6",
                "name": "酷"
            },
            {
                "symbol": "0xb7",
                "name": "汗"
            },
            {
                "symbol": "0xb8",
                "name": "抓狂"
            },
            {
                "symbol": "0xb9",
                "name": "吐"
            },
            {
                "symbol": "0xc0",
                "name": "笑"
            },
            {
                "symbol": "0xc1",
                "name": "快乐"
            },
            {
                "symbol": "0xc2",
                "name": "奇"
            },
            {
                "symbol": "0xc3",
                "name": "傲"
            },
            {
                "symbol": "0xc4",
                "name": "饿"
            },
            {
                "symbol": "0xc5",
                "name": "累"
            },
            {
                "symbol": "0xc6",
                "name": "吓"
            },
            {
                "symbol": "0xc7",
                "name": "汗"
            },
            {
                "symbol": "0xc8",
                "name": "高兴"
            },
            {
                "symbol": "0xc9",
                "name": "闲"
            },
            {
                "symbol": "0xd0",
                "name": "努力"
            },
            {
                "symbol": "0xd1",
                "name": "骂"
            },
            {
                "symbol": "0xd2",
                "name": "疑问"
            },
            {
                "symbol": "0xd3",
                "name": "秘密"
            },
            {
                "symbol": "0xd4",
                "name": "乱"
            },
            {
                "symbol": "0xd5",
                "name": "疯"
            },
            {
                "symbol": "0xd6",
                "name": "哀"
            },
            {
                "symbol": "0xd7",
                "name": "鬼"
            },
            {
                "symbol": "0xd8",
                "name": "打击"
            },
            {
                "symbol": "0xd9",
                "name": "bye"
            },
            {
                "symbol": "0xe0",
                "name": "汗"
            },
            {
                "symbol": "0xe1",
                "name": "抠"
            },
            {
                "symbol": "0xe2",
                "name": "鼓掌"
            },
            {
                "symbol": "0xe3",
                "name": "糟糕"
            },
            {
                "symbol": "0xe4",
                "name": "恶搞"
            },
            {
                "symbol": "0xe5",
                "name": "什么"
            },
            {
                "symbol": "0xe6",
                "name": "什么"
            },
            {
                "symbol": "0xe7",
                "name": "累"
            },
            {
                "symbol": "0xe8",
                "name": "看"
            },
            {
                "symbol": "0xe9",
                "name": "难过"
            },
            {
                "symbol": "0xf0",
                "name": "难过"
            },
            {
                "symbol": "0xf1",
                "name": "坏"
            },
            {
                "symbol": "0xf2",
                "name": "亲"
            },
            {
                "symbol": "0xf3",
                "name": "吓"
            },
            {
                "symbol": "0xf4",
                "name": "可怜"
            },
            {
                "symbol": "0xf5",
                "name": "刀"
            },
            {
                "symbol": "0xf6",
                "name": "水果"
            },
            {
                "symbol": "0xf7",
                "name": "酒"
            },
            {
                "symbol": "0xf8",
                "name": "篮球"
            },
            {
                "symbol": "0xf9",
                "name": "乒乓"
            },
            {
                "symbol": "0xg0",
                "name": "咖啡"
            },
            {
                "symbol": "0xg1",
                "name": "美食"
            },
            {
                "symbol": "0xg2",
                "name": "动物"
            },
            {
                "symbol": "0xg3",
                "name": "鲜花"
            },
            {
                "symbol": "0xg4",
                "name": "枯"
            },
            {
                "symbol": "0xg5",
                "name": "唇"
            },
            {
                "symbol": "0xg6",
                "name": "爱"
            },
            {
                "symbol": "0xg7",
                "name": "分手"
            },
            {
                "symbol": "0xg8",
                "name": "生日"
            },
            {
                "symbol": "0xg9",
                "name": "电"
            }
        ],
        expressionPrefix: [
            "a", "b", "c", "d", "e", "f", "g"
        ],
        /**
         * message
         */
        messages: {
            errorText: "服务器繁忙",
            timeoutText: "当前网络未开启,请检查您的网络或稍后再试"
        },
        /**
         * events
         */
        events: {
            // 窗体
            window: {
                resize: "events-window-resize"
            },
            page: {
                beforeremove: "events-page-beforeremove"
            },
            // 用户
            user: {
                adduser: "events-user-adduser",
                addmessage: "events-user-addmessage",
                //addimagemessage: "events-user-addimagemessage",
                removeuser: "events-user-removeuser",
                usergoingaway: "events-user-usergoingaway",
                uploadfileprogresschange:"events-user-uploadfileprogresschange",
                groupsend:"events-user-groupsend"
            }
        },
        business: {
            newUserOnLine: "newUserOnLine",
            cTocSendMessage: "cTocSendMessage",
            userGoingAway: "userGoingAway"
        },
        /**
         * keys
         */
        keys: {
            user:"keys-user"
        },
        /**
         * 设备对象
         */
        device: {},
        /**
         * 分页数
         */
        pageSize: 10,
        /**
         * 一次传输的最大字节数
         */
        textBufferSize:1500000,
        /**
         * 通知的停留时间
         */
        notificationStayTime: 1000 * 10,
        /**
         * 本地通知对象
         */
        NotificationHandler: {
            isNotificationSupported: 'Notification' in window,
            isPermissionGranted: function () {
                return Notification.permission === 'granted';
            },
            requestPermission: function () {
                if (!this.isNotificationSupported) {
                    console.log('当前浏览器不支持NitificationAPI');
                    return;
                }

                Notification.requestPermission(function (status) {
                    //status是授权状态，如果用户允许显示桌面通知，则status为'granted'
                    console.log('status: ' + status);

                    //permission只读属性
                    var permission = Notification.permission;
                    //default 用户没有接收或拒绝授权 不能显示通知
                    //granted 用户接受授权 允许显示通知
                    //denied  用户拒绝授权 不允许显示通知
                    console.log('permission: ' + permission);
                });
            },
            showNotification: function (title, message) {
                if (!this.isNotificationSupported) {
                    console.log('t当前浏览器不支持NitificationAPI');
                    return;
                }
                if (!this.isPermissionGranted()) {
                    console.log('当前页面尚未被授予通知');
                    return;
                }


                var n = new Notification(title, {
                    icon: "http://" + app.appIP + app.appRealPath + "res/images/tips.png",
                    body: message
                });

                //onshow函数在消息框显示时会被调用
                //可以做一些数据记录及定时操作等
                n.onshow = function () {
                    console.log('notification shows up');
                    setTimeout(function () {
                        n.close();
                    }, app.notificationStayTime);
                };

                //消息框被点击时被调用
                //可以打开相关的视图，同时关闭该消息框等操作
                n.onclick = function () {
                    alert('open the associated view');
                    //opening the view...
                    n.close();
                };

                //当有错误发生时会onerror函数会被调用
                //如果没有granted授权，创建Notification对象实例时，也会执行onerror函数
                n.onerror = function () {
                    console.log('notification encounters an error');
                    //do something useful
                };

                //一个消息框关闭时onclose函数会被调用
                n.onclose = function () {
                    console.log('notification is closed');
                    //do something useful
                };
            }
        },
        initial: function () {
            // 设置Client的WebViewJavascriptBridge
            setupWebViewJavascriptBridge();
        },
        /**
         * 初始化
         */
        initCore: function () {
            app.NotificationHandler.requestPermission();
            // 初始化和终端设备进行通信的对象
            initClientCommunicationObj();
            // 初始化F7
            initf7();
            // 初始化公共的事件
            initF7Events();
            // 初始化公共的事件
            initCommonEvents();
            app.f7.app.init();
        },
        /**
         * 路径添加一组
         * @param key
         * @param array
         */
        addPathItem: function (key, array) {
            _paths[key] = array;
        },
        /**
         * 解密表情符
         * @param str
         */
        decodeExpression: function (str) {
            var expressionRegexp = app.expressionCodes/*.map(function(item){
             return item.symbol.replace(/(\/)|(\))|(\()/g, function (text) {
             return "\\" + text;
             })
             })*/.map(function (item) {
                    return "(" + item.symbol + ")"
                }).join("|");

            var symbols = app.expressionCodes.map(function (item) {
                return item.symbol;
            });

            var regexp = new RegExp(expressionRegexp, "g");
            str = str.replace(regexp, function (symbol) {
                var index = symbols.indexOf(symbol);
                return "<div class='expression" + app.expressionPrefix[parseInt(index / 10)] + (index % 10) + " expression'></div>";
            });
            return str;
        },
        /**
         * 创建一个通知
         * @param title
         * @param message
         */
        makeNotification: function (title, message) {
            if (app.NotificationHandler.isNotificationSupported && app.NotificationHandler.isPermissionGranted()) {
                app.NotificationHandler.showNotification(title, message);
            } else {
                var notification = app.f7.app.addNotification({
                    title: title,
                    message: message
                });
                setTimeout(function () {
                    app.f7.app.closeNotification(notification);
                }, app.notificationStayTime);
            }
        }
    }

    if (w.app) {
        obj = $.extend(true, obj, w.app);
    }

    return obj;

})
(jQuery, window);