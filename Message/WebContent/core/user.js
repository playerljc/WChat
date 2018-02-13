/**
 * Created by Administrator on 2017/4/14.
 * 用户(一个对象)
 */
user = (function ($, $$, w) {

    var Class = function (user, uiDom) {
        // 上传的文件名管理
        this.fileNameManager = new HashMap();

        this._user = user;
        this._nickName = user.nickName;
        this._uiDom = uiDom;
        // 未读的消息数
        this._unreadCount = 0;
        /*[{
         date:xxxx-xx-xx,
         messages:[{
         type:"send | received",
         time:xx:xx:xx,
         text:""
         }]
         }]
         */
        this._messages = new HashMap();
    }

    Class.prototype = {
        /**
         * {
         *   type:[send | received]
         *   datetime:xxxx-xx-xx xx:xx:xx,
         *   text:""
         * }
         */
        addMessage: function (message) {
            var datetime = message.datetime;
            var date = datetime.split(" ")[0];
            var time = datetime.split(" ")[1];

            var messagegroup = this._messages.get(date);
            var addMessage = $.extend(
                message,
                {
                    date: date,
                    time: time
                }
            );
            if (messagegroup) {
                messagegroup.push(addMessage);
            } else {
                this._messages.put(date, [addMessage]);
            }
        },
        getMessage: function (id) {
            var dates = this.getMessageDates();
            var result;
            for (var i = 0; i < dates.length; i++) {
                var messages = this.getMessages(dates[i]);
                for (var j = 0; j < messages.length; j++) {
                    if (messages[j].id == id) {
                        return messages[j];
                    }
                }
            }
            return result;
        },
        getMessageDates: function () {
            var dates = this._messages.keySet();
            dates.sort(function (a, b) {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return dates;
        },
        getMessages: function (date) {
            var messages = this._messages.get(date);
            messages.sort(function (a, b) {
                if (a.time > b.time) {
                    return 1;
                } else if (a.time < b.time) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return messages;
        },
        showReadBadge: function () {
            var badge = this._uiDom.querySelector(".badge");
            badge.innerText = this._unreadCount + "";
            badge.style.display = "inline-block";

        },
        hideReadBadge: function () {
            var badge = this._uiDom.querySelector(".badge");
            badge.style.display = "none";
        },
        addFileName: function (fileName) {
            this.fileNameManager.put(fileName, 0);
        },
        getFileName: function (fileName) {
            if (this.fileNameManager.get(fileName) == undefined) {
                this.addFileName(fileName);
            } else {
                this.fileNameManager.put(fileName, this.fileNameManager.get(fileName) + 1);
            }

            var count = this.fileNameManager.get(fileName);
            var result;

            if(count == 0) {
                result = fileName;
            } else {
                var index = fileName.lastIndexOf(".");
                if(index == -1) {
                    result = fileName + "(" + count + ")";
                } else {
                    result = fileName.substring(0,index) + "(" + count + ")" + "." + fileName.substring(index + 1);
                }
            }

            return result;
        }
    };

    return Class;

})(jQuery, Dom7, window);