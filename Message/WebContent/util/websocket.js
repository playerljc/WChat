/**
 * Created by Administrator on 2017/4/13.
 * websocket操作
 */
websocket = (function () {

    function deepCopy(p, c) {
        var c = c || {};
        for (var i in p) {
            if (typeof p[i] === 'object') {
                c[i] = (p[i].constructor === Array) ? [] : {};
                deepCopy(p[i], c[i]);
            } else {
                c[i] = p[i];
            }
        }
        return c;
    }

    function guid(count) {
        var str = new Array(count);
        for (var i = 0; i < count; i++) {
            str.push("x");
        }

        return str.join("").replace(/x/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function initEvents() {
        this._ws.addEventListener("open", this);
        this._ws.addEventListener("error", this);
        this._ws.addEventListener("message", this);
        this._ws.addEventListener("close", this);
    }

    function handleEvent(e) {
        var type = e.type;
        switch (type) {
            case "open":
                onOpen.call(this, e);
                break;
            case "error":
                onError.call(this, e);
                break;
            case "message":
                onMessage.call(this, e);
                break;
            case "close":
                onClose.call(this, e);
                break;
            default:
                break;
        }
    }

    function onOpen(e) {
        if (this._events[Class.TYPES.open]) {
            this._events[Class.TYPES.open](e);
        }
    }

    function onError(e) {
        if (this._events[Class.TYPES.error]) {
            this._events[Class.TYPES.error](e);
        }
    }

    function onClose(e) {
        if (this._events[Class.TYPES.close]) {
            this._events[Class.TYPES.close](e);
        }
    }

    function onMessage(e) {
        /**
         * requestType:[pull | push]
         *
         * pull类型
         * token:请求的token,
         * state:响应码 [200:成功 | 300:失败]
         * message:描述消息
         * dataType: [text | json]
         * data:数据
         *
         * push类型
         * nickName:昵称
         * msg:消息
         * dataType:[text | json]
         * source:源
         * business:业务id
         */
        var msgStr = e.data;
        var msgObj = JSON.parse(msgStr);
        console.dirxml(msgObj);

        switch (msgObj.requestType) {
            // 拉模式
            case "pull":
            {
                console.dirxml(this._requestStack.entry);
                var req = this._requestStack.get(msgObj.token);

                if (msgObj.state == 200) {
                    if (req && req.success) {
                        req.success(msgObj.data);
                    }
                } else if (msgObj.state == 300) {
                    if (req && req.fail) {
                        req.fail(msgObj.message);
                    }
                }

                if (req && req.complete) {
                    req.complete(msgObj.state, msgObj.data, msgObj.message);
                }

                this._requestStack.remove(msgObj.token);
            }
                ;
                break;
            // 推模式
            case "push":
            {
                if (this._events[Class.TYPES.push]) {
                    this._events[Class.TYPES.push](msgObj);
                }
            }
                ;
                break;
        }
    }

    var Class = function (url) {
        this._url = url;
        this._events = {};
        this.handleEvent = handleEvent;
        this._requestStack = new HashMap();
    }

    Class.TYPES = {
        open: "open",
        error: "error",
        close: "close",
        push: "push"
    }

    Class.prototype = {
        on: function (type, handler) {
            this._events[type] = handler;
        },
        /**
         * 连接websocket
         * @param successCallback 连接成功
         * @param errorCallback 连接失败
         */
        connect: function (successCallback, errorCallback) {
            if ('WebSocket' in window || 'MozWebSocket' in window) {

                if ('WebSocket' in window) {
                    this._ws = new WebSocket(this._url);
                } else if ('MozWebSocket' in window) {
                    this._ws = new MozWebSocket(this._url);
                }

                initEvents.call(this);

                if (successCallback) {
                    successCallback();
                }
            } else {
                if (errorCallback) {
                    errorCallback();
                }
            }
        },
        close: function () {
            this._ws.close();
        },
        getState: function () {
            return this._ws.readyState;
        },
        getBufferedAmount: function () {
            return this._ws.bufferedAmount;
        },
        getProtocol: function () {
            return this._ws.protocol;
        },
        /**
         * url:
         * dataType:
         * data:
         * success:
         * fail:
         * complete:
         * @param config
         */
        send: function (config) {
            var dtd = $.Deferred();
            if (this.getState() != WebSocket.OPEN) {
                dtd.reject("链接尚未建立，不能进行通信");
            } else {
                var key = guid(10);
                var value = deepCopy(config, {
                    token: key,
                    dataType: "text"
                });

                if (value.data && value.dataType.toLocaleLowerCase() === "json") {
                    value.data = JSON.stringify(value.data);
                }

                console.log(value.token);
                this._requestStack.put(key, value);

                /**
                 * token:此次请求的标识码
                 * url:业务的标识码
                 * dataType:数据类型 [text | json]
                 * data:数据
                 */
                var msg = JSON.stringify({
                    token: value.token,
                    url: value.url,
                    dataType: value.dataType,
                    data: value.data
                });
                this._ws.send(msg);
                dtd.resolve();
            }

            return dtd.promise();
        },
        /**
         * 发送二进制数据
         * @param blob
         */
        sendBinary: function (blob) {
            var dtd = $.Deferred();
            if (this.getState() != WebSocket.OPEN) {
                dtd.reject("链接尚未建立，不能进行通信");
            } else {
                this._ws.send(blob);
                dtd.resolve();
            }
            return dtd.promise();
        }
    }

    return Class;

})();