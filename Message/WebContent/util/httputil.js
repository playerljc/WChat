;(function () {

    function create($, w) {
        return {
            /**
             * Ajax
             * */
            Ajax: function (config) {
                // 如果网络没开启则
                //if (!navigator.onLine) {
                //    app.f7.app.alert('当前网络未开启,请检查您的网络或稍后再试');
                //    if(config.errorCallback){
                //        config.errorCallback("当前网络未开启,请检查您的网络或稍后再试");
                //    }
                //    return;
                //}

                var defaultConfig = {
                    type:"POST",
                    dataType:"json",
                    error: function (error, status, thrown) {
                        if (error.statusText == "timeout") {
                            app.f7.app.alert(app.f7.app.messages.timeoutText);
                        } else {
                            app.f7.app.alert(app.messages.errorText);
                        }
                        if(config.errorCallback){
                            config.errorCallback(app.messages.errorText);
                        }
                    },
                    timeout: 1000 * 30
                };

                if (config.AjaxDomain) {
                    defaultConfig.type = "GET";
                    defaultConfig.dataType = "jsonp";
                    defaultConfig.jsonp = "jsoncallback";
                }

                var ajaxConfig = $.extend(defaultConfig, config);
                ajaxConfig.success = function (data, textStatus, jqXHR) {
                    config.success(data, textStatus, jqXHR);
                };

                if (ajaxConfig.data) {
                    for (var p in ajaxConfig.data) {
                        if (typeof ajaxConfig.data[p] === "string") {
                            ajaxConfig.data[p] = ajaxConfig.data[p];//Tool.encodeXmlEntry();
                        }
                    }
                }

                $.ajax(ajaxConfig);
            },
            /**
             * 异步的执行一组Ajax
             * 此方法可以控制执行一组Ajax,并且可以达到join的效果，可以等待所有调用完成
             * @param options
             * {
             *     hideload:是否取消遮罩 默认值true
             *     AjaxDomain:是否跨域 默认值false
             *     successCallback:成功的回调函数
             *     errorCallback:失败的回调函数
             * }
             * @param taskoptions Array 所有带执行的Ajax的配置
             * @constructor
             */
            AjaxCallQuery: function (options, taskoptions) {
                var defaultOptions = {
                    hideload: true,
                    AjaxDomain: false,
                    successCallback: function () {
                    },
                    errorCallback: function () {
                    }
                };

                $.extend(defaultOptions, options);

                // 如果网络没开启则
                //if (!navigator.onLine) {
                //    app.f7.app.alert('当前网络未开启,请检查您的网络或稍后再试');
                //    if(defaultOptions.errorCallback){
                //        defaultOptions.errorCallback("当前网络未开启,请检查您的网络或稍后再试");
                //    }
                //    return;
                //}

                var ajaxTask = [];
                for (var i = 0, len = taskoptions.length; i < len; i++) {
                    if (defaultOptions.AjaxDomain) {
                        taskoptions[i].type = "GET";
                        taskoptions[i].dataType = "jsonp";
                        taskoptions[i].jsonp = "jsoncallback";
                    } else {
                        taskoptions[i].type = "POST";
                        taskoptions[i].dataType = "json";
                    }

                    for (var p in taskoptions[i].data) {
                        if (typeof taskoptions[i].data[p] === "string") {
                            taskoptions[i].data[p] = decodeURIComponent(taskoptions[i].data[p]/*Tool.encodeXmlEntry()*/);
                        }
                    }
                    ajaxTask.push($.ajax(taskoptions[i]));
                }

                $.when.apply(this, ajaxTask)
                    .done(function () {
                        if (defaultOptions.successCallback) {
                            defaultOptions.successCallback(arguments);
                        }
                    }).fail(function (error, status, thrown) {
                        if (error.statusText == "timeout") {
                            app.f7.app.alert(app.f7.app.timeoutText);
                        } else {
                            app.f7.app.alert(app.messages.errorText);
                        }
                        if(defaultOptions.errorCallback){
                            defaultOptions.errorCallback(app.messages.errorText);
                        }
                    });
            }
        }
    }

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define("HttpUtil", ["jquery"], function ($) {
            return create($, window);
        });
    } else {
        window.HttpUtil = create(jQuery, window);
    }

})();