Tool = {};

/**
 * Tool
 */
Tool = _.extend(Tool, {
    /**
     * 根据productId获取产品模板包的文件
     * @param productId
     * @returns {*}
     */
    getProductFile: function (productId) {
        var dtd = $.Deferred();

        HttpUtil.Ajax({
            url: app.appRealPath + "commonManageAction_commonRun.action",
            data: {
                processID: "wsecommerce.wsmodelservice.getmodelfilelistbyproductid",
                content: JSON.stringify({productId: productId})
            },
            success: function (data) {
                if (data.successFlag != "1") {
                    dtd.reject(app.messages.errorText);
                } else {
                    dtd.resolve(data);
                }
            },
            errorCallback: function (errorText) {
                dtd.reject(errorText || app.messages.errorText);
            }
        });

        return dtd.promise();
    },
    /**
     * 根据productId进入指定的产品模板页面
     * @param productId
     * @param orderId
     */
    goToProductTemplate: function (productId, orderId) {
        /**
         * 根据productId获取
         * List<ModelFileEntity>
         *
         *     ModelFileEntity {
         *
                     fileId(页Id)
                     private String id;

                     modelId(模板Id)
                     private String modelId;

                     filePath(页路径)
                     private String filePath;

                     sortNumber(页的排序号)
                     private int sortNumber;

         *     }
         */
        app.f7.app.showIndicator();
        Tool.getProductFile(productId).done(function (data) {
            app.f7.app.hideIndicator();

            var files = data.content.data;
            var firstFilePath =
                app.appServiceName + files[0].filePath +
                "?productId=" + productId +
                "&0x1Type=app&platform=wechat" +
                (orderId ? "&orderId=" + orderId : "");

            app.f7.app.showPreloader("加载中...");
            $(document).trigger(app.events.iframe.href, {
                href: firstFilePath
            });

            app.f7.mainView.router.load({
                url: app.appRealPath + "core/webviewfullpage/webviewFullPage.html?href=" + window.encodeURIComponent(firstFilePath) + "&timestamp=" + (new Date().getTime())
            });
        }).fail(function (errorText) {
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
        });
    },
    /**
     * 根据证件类型获取证件名称
     * @param type
     * @returns {*}
     */
    getMemberIdenTypeNameByType: function (type) {
        switch (type) {
            case "11":
            {
                return "身份证";
            }
                ;
                break;
            case "12":
            {
                return "护照";
            }
                ;
                break;
            case "13":
            {
                return "军官证";
            }
                ;
                break;
            case "14":
            {
                return "港澳台同胞证";
            }
                ;
                break;
            default :
                break;
        }
    },
    /**
     * 格式化手机号
     * @param mobile
     * @returns {*|string|XML|void}
     */
    getEncryptMobile: function (mobile) {
        var reg = /^(\d{3})\d{5}(\d{3})$/;
        mobile = mobile.replace(reg, "$1*****$2");
        return mobile;
    },
    /**
     * 编码unicode
     * @param {} str 待转换的字符串
     * @return {} 转换后的字符串
     */
    decToHex: function (str) {
        if (str == null || str == "") return "";
        str = (str == null ? "" : str);
        var tmp;
        var sb = new StringBuffer();
        var c;
        var i, j;
        for (i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            sb.append("\\u");
            j = (c >>> 8); // 取出高8位
            tmp = j.toString(16);

            if (tmp.length == 1) {
                sb.append("0");
            }

            sb.append(tmp);
            j = (c & 0xFF); // 取出低8位
            tmp = j.toString(16);
            if (tmp.length == 1) {
                sb.append("0");
            }
            sb.append(tmp);
        }
        return sb.toString();
    },
    /**
     * 解码unicode
     * @param {} str 待解码的字符串
     * @return {} 解码后的字符串
     */
    hexToDec: function (theString) {
        if (theString == null || theString == "") {
            return "";
        }

        return unescape(theString.replace(/\\u/g, '%u'));
    },
    /**
     * search转换成obj
     * @param href
     * @returns {{}}
     */
    getUrlParam: function (href) {
        if (!href) {
            href = window.location.hash;
        }
        var index = href.indexOf("?");
        if (index == -1) return {};

        var obj = {};
        href = href.substring(index + 1);
        var strs = href.split("&");
        var t = null;
        for (var i = 0, len = strs.length; i < len; i++) {
            t = strs[i].split("=");
            obj[t[0]] = Tool.hexToDec(decodeURIComponent(t[1] ? (t[1] === "undefined") ? "" : t[1] : ""));
        }
        return obj;
    },
    /**
     * 加密XML实体字符
     * @param str
     * @returns {*}
     */
    encodeXmlEntry: function (str) {
        return str.replace("\"", "&quot").replace("'", "&apos").replace("&", "&amp").replace("<", "&lt").replace(">", "&gt");
    },


    /**
     * 异步的加载Page所需的js和css
     * @param _paths
     */
    loadAsyncScriptAndCss: function (_paths) {
        var dtd = $.Deferred();
        var scriptPaths = [];
        var cssPaths = [];
        for (var i = 0, len = _paths.length; i < len; i++) {
            var path = _paths[i].replace(/^\s|\s$/g, "");
            var att = path.split('.');
            var isCSS = att[att.length - 1].toLowerCase() == "css";
            var isScript = att[att.length - 1].toLowerCase() == "js";
            if (isCSS) {
                cssPaths.push({
                    url: path
                });
            } else if (isScript) {
                scriptPaths.push({
                    url: path
                });
            }
        }

        $.when.apply(this, [
            Tool.syncLoadScript(scriptPaths),
            Tool.syncLoadCss(cssPaths)
        ]).done(function () {
            dtd.resolve();
        }).fail(function () {
            dtd.reject();
        });

        return dtd.promise();
    },
    /**
     * 同步加载一组js
     *
     * 存放各个文件的加载路径，及其加载完后的回调函数
     * @param group
     * {
     *    url:string
     *    callback:function(){}
     * }
     * 文件都加载完后的回调函数
     * @param complete function(){}
     */
    syncLoadScript: function (group) {
        var dtd = $.Deferred();

        $.ajaxSetup({
            cache: true
        });

        // 待加载的文件数
        var length = group.length;

        // 当前加载的索引
        var index = 0;

        syncLoad();

        /**
         * 同步加载一个js文件
         */
        function syncLoad() {
            /**
             * 全部加载完成
             */
            if (index >= length) {
                $.ajaxSetup({
                    cache: false
                });
                dtd.resolve();
            }
            /**
             * 同步加载指定文件
             */
            else {
                $.getScript(group[index].url, function () {
                    if (group[index].callback) {
                        group[index].callback();
                    }

                    index++;
                    syncLoad();
                });
            }
        }

        return dtd.promise();
    },
    /**
     * 同步加载一组css
     *
     * 存放各个文件的加载路径，及其加载完后的回调函数
     * @param group
     * {
     *    url:string
     *    callback:function(){}
     * }
     * 文件都加载完后的回调函数
     * @param complete function(){}
     */
    syncLoadCss: function (group) {

        var dtd = $.Deferred();

        // 待加载的文件数
        var length = group.length;

        // 当前加载的索引
        var index = 0;

        syncLoad();

        /**
         * 同步加载一个css文件
         */
        function syncLoad() {
            /**
             * 全部加载完成
             */
            if (index >= length) {
                dtd.resolve();
            }
            /**
             * 同步加载指定文件
             */
            else {
                var headDom = document.getElementsByTagName("head")[0];
                var linkDom = document.createElement("link");
                linkDom.onload = function () {
                    if (group[index].callback) {
                        group[index].callback();
                    }

                    index++;
                    syncLoad();
                }
                linkDom.setAttribute("rel", "stylesheet");
                linkDom.setAttribute("type", "text/css");
                linkDom.setAttribute("href", group[index].url);
                headDom.appendChild(linkDom);
            }
        }

        return dtd.promise();
    },

    /**
     * setTimeout
     * @param run
     * @param timeout
     */
    setTimeout: function (run, timeout) {
        var handler = window.setTimeout(function () {
            window.clearTimeout(handler);
            if (run) {
                run();
            }
        }, timeout);
    },
    /**
     * objToDataset
     * @param obj
     * @param dom
     */
    objectToDataSet: function (obj, dom) {
        for (var p in obj) {
            dom.dataset[p] = obj[p];
        }
    },
    /**
     * dataSetToObj
     * @param dom
     * @returns {{}}
     */
    dataSetToObject: function (dom) {
        var obj = {};
        for (var p in dom.dataset) {
            obj[p] = dom.dataset[p];
        }
        return obj;
    },
    /**
     * 表单验证
     * @param dom
     * @returns {boolean}
     * {
     *      required:required,
     *      requiredmessage:requiredmessage,
     *      minlength:minlength,
     *      maxlength:maxlength,
     *      lengthmessage:lengthmessage,
     *      pattern:validmessage
     * }
     */
    submitValidate: function (dom) {

        var _pattern = {
            // 数字
            "digit": /^[-]?\d+$/,
            // email
            "email": /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
            // phone
            "phone": /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
            // tel
            "tel": /^\d+(-\d+)*$/,
            // 身份证
            "idcard": /^[1-9]\d{5}(19\d{2}|[2-9]\d{3})((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{4}|\d{3}X)$/,
            // 中文
            "chinese": /^[\u4E00-\u9FA5]+$/
        }

        var toastMessage;

        var items = dom.querySelectorAll("input,textarea,select");

        //1.required
        var flag = true;
        var target;
        for (var i = 0; i < items.length; i++) {
            var ele = items[i];
            var required = ele.getAttribute("required");
            var value = ele.value;
            if (ele.outerHTML.indexOf("input") !== -1) {
                value = ele.value;
            } else if (ele.outerHTML.indexOf("select") !== -1) {
                if (ele.querySelector("option[value='-1']") && ele.selectedIndex !== 0) {
                    value = "value";
                } else {
                    value = null;
                }
            }
            var requiredmessage = ele.getAttribute("requiredmessage");
            if (required && !value) {
                target = ele;
                flag = false;
                toastMessage = requiredmessage;
                break;
            }
        }

        // 长度
        if (flag) {
            for (var i = 0; i < items.length; i++) {
                var ele = items[i];
                var minlength = ele.getAttribute("minlength");
                var maxlength = ele.getAttribute("maxlength");
                var value = ele.value;
                var lengthmessage = ele.getAttribute("lengthmessage");

                // 如果value没有值则不验证
                if (!value) continue;

                if (minlength && maxlength) {
                    minlength = parseInt(minlength);
                    maxlength = parseInt(maxlength);
                    if (value.length < minlength || value.length > maxlength) {
                        target = ele;
                        flag = false;
                        toastMessage = lengthmessage;
                        break;
                    }
                } else if (minlength) {
                    minlength = parseInt(minlength);
                    if (value.length < minlength) {
                        target = ele;
                        flag = false;
                        toastMessage = lengthmessage;
                        break;
                    }
                } else if (maxlength) {
                    maxlength = parseInt(maxlength);
                    if (value.length > maxlength) {
                        target = ele;
                        flag = false;
                        toastMessage = lengthmessage;
                        break;
                    }
                }
            }
        }

        // 有效性
        if (flag) {
            for (var i = 0; i < items.length; i++) {
                var ele = items[i];
                var value = ele.value;
                var pattern = ele.getAttribute("pattern");
                var validmessage = ele.getAttribute("validmessage");

                if (!value) continue;
                if (!pattern) continue;

                // 默认的类型
                if (_pattern[pattern]) {
                    if (!_pattern[pattern].test(value)) {
                        target = ele;
                        flag = false;
                        toastMessage = validmessage;
                        break;
                    }
                }
                // 自定义的正则
                else {
                    if (!eval(pattern).test(value)) {
                        target = ele;
                        flag = false;
                        toastMessage = validmessage;
                        break;
                    }
                }
            }
        }

        if (target) {
            target.focus();
            app.f7.app.alert(toastMessage);
        }

        return flag;
    },
    scrollHeight: function (dom) {
        if (dom && dom.scrollHeight) {
            dom.style.height = dom.scrollHeight + "px";
        }
    },
    /**
     * 事件的桥接
     * @param context 调用上下文
     * @param callFn 调用函数
     * @param params Array 参数
     * @returns {Function}
     */
    eventBridge: function (context, callFn , params) {
        return function () {
            var tp = Array.prototype.slice.call(arguments);
            callFn.apply(context || this, params ? tp.concat(params) : tp);
        }
    },
    /**
     * 继承
     * @param Child 子类的Prototype
     * @param Parent 父类的Prototype
     */
    extend: (function () {
        // proxy used to establish prototype chain
        var F = function () {
        };
        // extend Child from Parent
        return function (Child, Parent) {
            if (!Child || !Parent) return;
            F.prototype = Parent.prototype;
            var f = new F();
            $.extend(f, Child.prototype);
            Child.prototype = f;
            Child.__super__ = Parent.prototype;
            Child.prototype.constructor = Child;
            Parent.prototype.constructor = Parent;
        };
    }()),
    /**
     * 获取UUID
     * @param count 位数
     * @returns {string}
     */
    guid: function (count) {
        if(!count) {
            count = 8;
        }
        var str = new Array(count);
        for (var i = 0; i < count; i++) {
            str.push("x");
        }

        return str.join("").replace(/x/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
});