/**
 * 时间工具类
 */
(function () {

    function create($) {

        // 对Date的扩展，将 Date 转化为指定格式的String
        // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
        // 例子：
        // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
        // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
        Date.prototype.Format = function (fmt) {
            //author: meizz
            var o = {
                "M+": this.getMonth() + 1,               //月份
                "d+": this.getDate(),                    //日
                "h+": this.getHours(),                   //小时
                "m+": this.getMinutes(),                 //分
                "s+": this.getSeconds(),                 //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        return {
            /**
             * 将yyyy-MM-dd HH:mm:ss 转换成yyyyMMddHHmmss
             * @param dateString14
             */
            string14ToLongStr: function (dateString14) {
                return dateString14.replace(" ", "").replace(/\-/g, "").replace(/\:/g, "");
            },
            /**
             * 将yyyy-MM-dd HH:mm 转换成yyyyMMddHHmm00
             * @param dateString12
             */
            string12ToLongStr: function (dateString12) {
                return dateString12.replace(" ", "").replace(/\-/g, "").replace(/\:/g, "") + "00";
            },
            /**
             * 将指定毫秒转换成博客时间
             * @param millisecond
             *
             * //  <=1天 (分，小时)
             * //  >1天 <1周 (天)
             * //  >=1周 yyyy-MM-dd HH:mm:ss
             */
            translateBlogTime: function (millisecond) {
                var curMillisecond = new Date().getTime();
                var incremental = curMillisecond - millisecond;
                if (incremental <= 24 * 60 * 60 * 1000) {
                    if ((incremental / 1000 / 60) >= 60) {
                        return parseInt(incremental / 1000 / 60 / 60) + "小时前";
                    } else if (incremental > 0 && incremental < 60) {
                        return parseInt(incremental / 1000 / 60) + "分前";
                    } else {
                        return "刚刚";
                    }
                } else if (
                    (incremental > 24 * 60 * 60 * 1000) &&
                    ((incremental < 24 * 7 * 60 * 60 * 1000))
                ) {
                    return parseInt(incremental / 1000 / 60 / 60 / 24) + "天前";
                } else {
                    return new Date(millisecond).Format("yyyy-MM-dd hh:mm:ss");
                }
            },
            /**
             * 用yyyy-MM-dd HH:mm:ss时间字符串构造Date对向
             * @param str
             * @returns {Date}
             */
            createDateByStr: function (str) {
                return new Date(str.replace(/-/g, "/"));
            },
            /**
             * 将制定JQuery对象渲染成时间控件
             * @param parentJO
             * @param config 配置对象
             * config {
             * preset: 类型[datetime|date|yyyy-MM|yyyy]
             * theme:主题
             * format:格式化信息,
             * selectCallback:选择的回调函数
             * }
             */
            renderDateControl: function (parentJO, config) {
                if (!parentJO) return;

                var preset = config.preset;

                var optDefault = {
                    preset: "datetime",
                    //theme: 'android-ics light', //皮肤样式
                    display: 'modal', //显示方式
                    mode: 'scroller', //日期选择模式
                    lang: 'zh', // 语言
                    dateFormat: "yy-mm-dd", // 格式化
                    onShow: function () {
                        if (preset === "yyyy-MM") {
                            $(".dwwl2").hide();
                        } else if (preset === "yyyy") {
                            $(".dwwl2").hide();
                            $(".dwwl1").hide();
                        }
                    },
                    onSelect: function (text) {
                        if (preset === "yyyy-MM") {
                            text = text.substring(0, text.lastIndexOf("-"));
                            if (parentJO[0].nodeName === "INPUT") {
                                parentJO.val(text);
                            }
                        } else if (preset === "yyyy") {
                            text = text.substring(0, text.indexOf("-"));
                            if (parentJO[0].nodeName === "INPUT") {
                                parentJO.val(text);
                            }
                        }

                        if (config.selectCallback) {
                            config.selectCallback(text);
                        }
                    }
                };

                if (preset === "yyyy-MM" || preset === "yyyy") {
                    config.preset = "date";
                }

                parentJO.mobiscroll($.extend(optDefault, {}, config));

            },
            /**
             *
             * @param interval 类型[y|d]
             * @param number 增量
             * @param date 基数
             * @returns {*}
             */
            dateAdd: function (interval, number, date) {
                switch (interval) {
                    case   "y"   :
                    {
                        date.setFullYear(date.getFullYear() + number);
                        date.setDate(date.getDate() - 1);
                        return date;
                        break;
                    }
                    case   "d"   :
                    {
                        date.setDate(date.getDate() + number);
                        return date;
                        break;
                    }
                    default   :
                    {
                        return date;
                        break;
                    }
                }
            }
        }
    }

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define("DateUtil", ["jquery"], function ($) {
            return create($);
        });
    } else {
        window.DateUtil = create(jQuery);
    }

})();