/**
 * Created by ctsjd on 2015/10/28.
 * config {
 *   parent:jqueryObject
 *   width:
 *   height:
 *   type:[overlay(覆盖) | reveal(揭示) | push(推动)],
 *   direction:[left | right | top(预留) | bottom(预留)],
 *   // 事件的注册
 *   listeners:{
 *      key:function(){}
 *   }
 * }
 */
(function () {

    function createFactory($, w) {

        var _time = ".3s";

        /**
         * 创建
         */
        function create() {
            // 对象的初始化
            this._c = this._config;
            this.parentDom = this._c.parent;
            this.$rMaster = this.parentDom.parent().find(".ct-sidesliding-reveal-master");
            this.$pMaster = this.parentDom.parent();
            this.$pSlave = this.$pMaster.find(".ct-sidesliding-push-slave");
            this._collapse = false;

            this.parentDom.addClass(this._c.direction);

            // 事件的处理
            if (this._c.listeners) {
                for (var p in this._c.listeners) {
                    this.events.put(p, this._c.listeners[p]);
                }
            }

            // 创建遮罩插入到panel之后
            this._$m = createMaskJO.call(this);
            this._$m.insertAfter(this.parentDom);

            if (this._c.direction === "left" || this._c.direction === "right") {
                // 赋值宽度
                this.parentDom.css("height", "100%");
                this._$m.css("height", "100%");
                this._c.width ? (this.parentDom.outerWidth(this._c.width)) : (this.parentDom.outerWidth($(document.body).outerWidth() * 0.9 + "px"));
            } else {
                // 赋值高度
                this.parentDom.css("width", "100%");
                this._$m.css("width", "100%");
                this._c.height ? (this.parentDom.outerHeight(this._c.height)) : (this.parentDom.outerHeight($(document.body).outerHeight() * 0.3 + "px"));
            }

            // 赋值默认位置
            if (this._c.type === "overlay") {
                if (this._c.direction === "left") {
                    silder.call(this, this.parentDom, "-" + this.parentDom.outerWidth() + "px", 0, 0, 0);
                } else if (this._c.direction === "right") {
                    silder.call(this, this.parentDom, $(document.body).outerWidth() + "px", 0, 0, 0);
                } else if (this._c.direction === "top") {
                    silder.call(this, this.parentDom, 0, "-" + $(document.body).outerHeight() + "px", 0, 0);
                } else if (this._c.direction === "bottom") {
                    silder.call(this, this.parentDom, 0, $(document.body).outerHeight() + "px", 0, 0);
                }
            } else if (this._c.type === "reveal") {
                if (this._c.direction === "left") {
                    this.parentDom.css("left", "0");
                } else if (this._c.direction === "right") {
                    this.parentDom.css("right", "0");
                }
            } else if (this._c.type === "push") {
                if (this._c.direction === "left") {
                    this.parentDom.css("left", "0");
                    this.$pSlave.css("left", this.parentDom.outerWidth() + "px");
                    silder.call(this, this.$pMaster, "-" + this.parentDom.outerWidth() + "px", 0, 0, 0);
                } else if (this._c.direction === "right") {
                    this.parentDom.css("right", "0");
                    this.$pSlave.css("right", this.parentDom.outerWidth() + "px");
                    silder.call(this, this.$pMaster, this.parentDom.outerWidth() + "px", 0, 0, 0);
                }
            }

            /**
             * 组件创建事件的触发
             */
            fireEvent.call(this, "create");

        }

        /**
         * 创建遮罩层
         */
        function createMaskJO() {
            var _self = this;
            return $("<div class='ct-sidesliding-mask'></div>").on("click", function () {
                _self.close();
            });
        }

        /**
         * 平移
         * @param $jo
         * @param x
         * @param y
         * @param z
         * @param time
         */
        function silder($jo, x, y, z, time, callback) {
            if (!time) {
                time = 0;
            }

            if (callback) {
                callback.call(this, $jo);
            }

            $jo.css({
                "transform": "translate3d(" + x + "," + y + "," + z + ")",
                "-webkit-transform": "translate3d(" + x + "," + y + "," + z + ")",
                "transition": "all " + time + " ease",
                "-webkit-transition": "all " + time + " ease"
            });
        }

        /**
         * 触发事件的调用
         * @param type
         */
        function fireEvent(type) {
            var handler = this.events.get(type);
            if (handler) {
                handler(this.parentDom, this);
            }
        }

        /**
         * 显示之后的事件触发
         * @param $jo
         */
        function afterShowCallback($jo) {
            var _self = this;
            $jo.off("transitionend").off("webkitTransitionEnd");
            $jo.one("transitionend", function (e) {
                e.stopPropagation();
                fireEvent.call(_self, "afterShow");
            }).one("webkitTransitionEnd", function (e) {
                e.stopPropagation();
                fireEvent.call(_self, "afterShow");
            });
        }

        /**
         * 关闭之后的事件触发
         * @param $jo
         */
        function afterCloseCallback($jo) {
            var _self = this;
            $jo.off("transitionend").off("webkitTransitionEnd");
            $jo.one("transitionend", function (e) {
                e.stopPropagation();
                fireEvent.call(_self, "afterClose");
            }).one("webkitTransitionEnd", function (e) {
                e.stopPropagation();
                fireEvent.call(_self, "afterClose");
            });
        }

        /**
         * core
         * @private
         */
        function _$(config) {
            this._config = config;
            /**
             * 用来存放用户注册的事件
             * @type [{
             *    eventType:string
             *    handler:Function
             * }]
             */
            this.events = new HashMap();
            create.call(this);
        }

        /**
         * public method
         * @type {{on: Function, show: Function, close: Function, isCollapse: Function}}
         */
        _$.prototype = {
            /**
             * 事件的注册
             * @param eventType 事件类型
             * [create | beforeShow | afterShow | beforeClose | afterClose]
             * @param handler 事件句柄
             */
            on: function (eventType, handler) {
                this.events.put(eventType, handler);
                return this;
            },
            /**
             * 显示
             */
            show: function () {
                /**
                 * 显示之前的事件触发
                 */
                fireEvent.call(this, "beforeShow");

                /**
                 *
                 */
                if (this._c.type === "overlay") {
                    if (this._c.direction === "left") {
                        silder.call(this, this.parentDom, 0, 0, 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "left": this.parentDom.outerWidth() + "px",
                            "right": "0"
                        });
                    } else if (this._c.direction === "right") {
                        silder.call(this, this.parentDom, ($(document.body).outerWidth() - this.parentDom.outerWidth()) + "px", 0, 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "left": "0",
                            "right": this.parentDom.outerWidth() + "px"
                        });
                    } else if (this._c.direction === "top") {
                        silder.call(this, this.parentDom, 0, 0, 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "top": this.parentDom.outerHeight() + "px",
                            "bottom": "0"
                        });
                    } else if (this._c.direction === "bottom") {
                        silder.call(this, this.parentDom, 0, ($(document.body).outerHeight() - this.parentDom.outerHeight()) + "px", 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "top": "0",
                            "bottom": this.parentDom.outerHeight() + "px"
                        });
                    }
                }
                /**
                 *
                 */
                else if (this._c.type === "reveal") {
                    if (this._c.direction === "left") {
                        silder.call(this, this.$rMaster, this.parentDom.outerWidth() + "px", 0, 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "left": this.parentDom.outerWidth() + "px",
                            "right": "0"
                        });
                    } else if (this._c.direction === "right") {
                        silder.call(this, this.$rMaster, -this.parentDom.outerWidth() + "px", 0, 0, _time, afterShowCallback);
                        this._$m.show().css({
                            "left": "0",
                            "right": this.parentDom.outerWidth() + "px"
                        });
                    }
                }
                /**
                 *
                 */
                else if (this._c.type === "push") {
                    silder.call(this, this.$pMaster, 0, 0, 0, _time, afterShowCallback);
                    if (this._c.direction === "left") {
                        this._$m.show().css({
                            "left": this.parentDom.outerWidth() + "px",
                            "right": "0"
                        });
                    } else if (this._c.direction === "right") {
                        this._$m.show().css({
                            "left": "0",
                            "right": this.parentDom.outerWidth() + "px"
                        });
                    }
                }

                this._collapse = true;

                return this;
            },
            /**
             * 关闭
             */
            close: function () {
                /**
                 * 关闭之前的事件触发
                 */
                fireEvent.call(this, "beforeClose");

                if (this._c.type === "overlay") {
                    if (this._c.direction === "left") {
                        silder.call(this, this.parentDom, "-" + this.parentDom.outerWidth() + "px", 0, 0, _time, afterCloseCallback);
                        this._$m.hide().css("left", 0);
                    } else if (this._c.direction === "right") {
                        silder.call(this, this.parentDom, $(document.body).outerWidth() + "px", 0, 0, _time, afterCloseCallback);
                        this._$m.hide().css("left", 0);
                    } else if (this._c.direction === "top") {
                        silder.call(this, this.parentDom, 0, "-" + $(document.body).outerHeight() + "px", 0, _time, afterCloseCallback);
                        this._$m.hide().css("top", 0);
                    } else if (this._c.direction === "bottom") {
                        silder.call(this, this.parentDom, 0, $(document.body).outerHeight() + "px", 0, _time, afterCloseCallback);
                        this._$m.hide().css("bottom", 0);
                    }
                } else if (this._c.type === "reveal") {
                    silder.call(this, this.$rMaster, 0, 0, 0, _time, afterCloseCallback);
                    this._$m.hide();
                } else if (this._c.type === "push") {
                    if (this._c.direction === "left") {
                        silder.call(this, this.$pMaster, -this.parentDom.outerWidth() + "px", 0, 0, _time, afterCloseCallback);
                    } else if (this._c.direction === "right") {
                        silder.call(this, this.$pMaster, this.parentDom.outerWidth() + "px", 0, 0, _time, afterCloseCallback);
                    }
                    this._$m.hide();
                }
                this._collapse = false;

                return this;
            },
            /**
             * 判断是否展开
             * @returns {boolean}
             */
            isCollapse: function () {
                return this._collapse;
            }
        };

        return function (config) {
            return new _$(config);
        }
    }

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define("sidesliding", ["jquery"], function ($) {
            return createFactory($, window);
        });
    } else {
        window.sideslidingFactory = createFactory(jQuery, window);
    }

})();