/**
 * Created by Administrator on 2017/4/14.
 */
messages = (function ($, $$, w) {

    /**
     * 注册事件
     */
    function initEvents() {
        var _self = this;

        /**
         * 上传更新进度
         */
        _self.onUploadProgressChangeBridge = onUploadProgressChange.bind(_self);
        $(document).on(app.events.user.uploadfileprogresschange, _self.onUploadProgressChangeBridge);

        /**
         * 添加一个文本消息
         */
        _self.onAddMessageBridge = onAddMessage.bind(_self);
        $(document).on(app.events.user.addmessage, _self.onAddMessageBridge);

        /**
         * messages页面销毁事件
         */
        _self.onPageBeforeRemoveBridge = onPageBeforeRemove.bind(_self);
        $(document).on(app.events.page.beforeremove, _self.onPageBeforeRemoveBridge);

        /**
         * 用户下线的通知
         */
        _self.onUserGoingAwayBridge = onUserGoingAway.bind(_self);
        $(document).on(app.events.user.usergoingaway, _self.onUserGoingAwayBridge);

        /**
         * 键盘按下
         */
        _self.onKeyDownBridge = onKeyDown.bind(_self);
        $(document).on("keydown", _self.onKeyDownBridge);

        /**
         * 选择完群发对象的事件
         */
        _self.onSelectGroupSendNicknamesBridge = onSelectGroupSendNicknames.bind(_self);
        $(document).on(app.events.user.groupsend, _self.onSelectGroupSendNicknamesBridge);

        /**
         * textarea的input事件
         */
        this._$$textareaJO.on("input", onMessageBarTextareaInput.bind(this));

        /**
         * 点击表情
         */
        this._$expressionBtnJO.on("click", onExpressionBtnClick.bind(this));

        /**
         * 点击加号
         */
        this._$addBtnJO.on("click", onAddBtnClick.bind(this));

        /**
         * 表情面板actived
         */
        $$('#expression-container').on('show', onExpressionContainerShow.bind(this));

        /**
         * 工具面板actived
         */
        $$('#tool-container').on('show', onToolContainerShow.bind(this));

        /**
         * 点击了消息面板
         */
        this._$$messagesContentJO.on("click", onMessageContentClick.bind(this));

        /**
         * 选择表情
         */
        this._$expressionContainerWrapJO.on("click", ".expressionItemWrap", Tool.eventBridge(null, onChangeExpression, [_self]));

        /**
         * 点击发送图片
         */
        this._$imageBtnJO.on("click", onUploadImageBtnClick.bind(this));
        /**
         * 点击上传文件
         */
        this._$fileBtnJO.on("click", onUploadFileBtnClick.bind(this));

        /**
         * 选择图片
         */
        this._$inputImageFileJO.on("change", Tool.eventBridge(null, onSelectImagesFinish, [_self]));

        /**
         * 选择文件
         */
        this._$inputFileJO.on("change", Tool.eventBridge(null, onSelectFilesFinish, [_self]));

        /**
         * 点击了群发按钮
         */
        this._$groupSendBtnJO.on("click", onClickGroupSendBtn.bind(this));

        /**
         * 点击发送事件
         */
        this._$$messagebarF7JO.find(" .link").on('click', onSend.bind(this));

        /**
         * 拖放
         */
        this._$messagesContentJO.on({
            "drop": Tool.eventBridge(null, onDragDrop, [_self]),
            "dragleave": onDragUnite,
            "dragenter": onDragUnite,
            "dragover": onDragUnite
        });

        /**
         * 点击了图片
         */
        this._$messagesF7JO.on("click", "img", onImageClick);

        /**
         * 点击了下载
         */
        this._$messagesF7JO.on("click", ".download", onDownloadClick);

        /**
         * 点击了头像
         */
        this._$centerJO.on("click", onTitleClick.bind(this));

        /**
         * 点击了群发的删除按钮
         */
        this._$groupUserListJO.on("click", ".delete", onClickGroupUserListDelete);

    }

    /**
     * 添加本地文本消息
     * @param e
     * @param message
     */
    function onAddMessage(e, message) {


        var _self = this;
        if (!(message.source == _self._nickName || message.source == _self._source)) return;

        _self._user.addMessage(message);

        var date = message.datetime.split(" ")[0];
        var time = message.datetime.split(" ")[1];
        var text = Class.decodeMessageText(message.text);

        var user = message.type == "sent" ? usermanager.getUser(message.source) : usermanager.getUser(_self._nickName);
        var avatar = user._user.logo;//app.appRealPath + "res/images/" + (user._user.sex == "男" ? "boy.png" : "girl.png");
        _self._messages.appendMessage({
            id: message.id,
            avatar: avatar,
            type: message.type,
            name: message.source,
            day: date,
            time: time,
            text: text
        }, true);

        if (message.type === "sent") {
            appendMessageHook.call(_self);
        }
        _self._messages.scrollMessages(400, _self._$$messagesF7JO[0].scrollHeight + 88 - _self._$$messagesContentJO[0].offsetHeight);
    }

    /**
     * 页面销毁之前消息
     * @param e
     * @param pageName
     */
    function onPageBeforeRemove(e, pageName) {
        if (pageName == "messages") {
            $(document).off(app.events.user.addmessage, this.onAddMessageBridge);
            $(document).off(app.events.page.beforeremove, this.onPageBeforeRemoveBridge);
            $(document).off(app.events.user.usergoingaway, this.onUserGoingAwayBridge);
            $(document).on(app.events.user.uploadfileprogresschange, this.onUploadProgressChangeBridge);
            $(document).on(app.events.user.groupsend, this.onSelectGroupSendNicknamesBridge);
            $(document).off("keydown", this.onKeyDownBridge);
        }
    }

    /**
     * 用户退出消息
     * @param e
     * @param source
     */
    function onUserGoingAway(e, source) {
        var _self = this;
        if (source == _self._nickName) {
            _self._goingaway = true;
        }
    }

    /**
     * 键盘消息
     * @param e
     */
    function onKeyDown(e) {
        var _self = this;
        if (e.keyCode == 13 && e.shiftKey == 1) {
            onSend.call(_self);
        }
    }

    /**
     * 消息栏textarea的change消息
     * @param e
     */
    function onMessageBarTextareaInput(e) {
        console.log("textareainput");
        var _self = this;
        _self._$pageBodyJO.css("padding-bottom", _self._$toolbarJO.height() + "px");
        _self._$scrollTopAnimationJO.css("bottom", _self._$toolbarJO.height() + 20 + "px");
    }

    /**
     * 点击表情按钮消息
     */
    function onExpressionBtnClick() {
        var _self = this;
        // 打开
        if (_self._$tooltabsJO.hasClass("close")) {
            _self._$tooltabsJO.removeClass("close").addClass("open");
            setTimeout(function () {
                app.f7.app.showTab("#expression-container");
            }, 200);
        }
        // 关闭
        else {
            app.f7.app.showTab("#expression-container");
        }
    }

    /**
     * 点击加号按钮
     */
    function onAddBtnClick() {
        var _self = this;
        // 打开
        if (_self._$tooltabsJO.hasClass("close")) {
            _self._$tooltabsJO.removeClass("close").addClass("open");
            setTimeout(function () {
                app.f7.app.showTab("#tool-container");
            }, 200);
        }
        // 关闭
        else {
            app.f7.app.showTab("#tool-container");
        }
    }

    /**
     * 表情面板显示事件
     */
    function onExpressionContainerShow() {
        var _self = this;
        if (!_self._expressionSwipe) {
            _self._expressionSwipe = app.f7.app.swiper(_self._$expressionContainerJO, {
                pagination: _self._$expressionSwiperPaginationJO
            });
        }

        _self._$pageBodyJO.css("padding-bottom", _self._$toolbarJO.height() + "px");
        _self._expressionSwipe.slideTo(0);
        _self._$scrollTopAnimationJO.css("bottom", _self._$toolbarJO.height() + 20 + "px");
    }

    /**
     * 工具面板显示事件
     */
    function onToolContainerShow() {
        var _self = this;
        _self._$pageBodyJO.css("padding-bottom", _self._$toolbarJO.height() + "px");
        _self._$scrollTopAnimationJO.css("bottom", _self._$toolbarJO.height() + 20 + "px");
    }

    /**
     * 点击了消息面板
     */
    function onMessageContentClick() {
        var _self = this;
        if (_self._$tooltabsJO.hasClass("open")) {
            _self._$tooltabsJO.removeClass("open").addClass("close");
            _self._$pageBodyJO.css("padding-bottom", _self._$toolbarJO.height() + "px");
            _self._$scrollTopAnimationJO.css("bottom", _self._$toolbarJO.height() + 20 + "px");
        }
    }

    /**
     * 选择了一个表情消息
     * @param e
     * @param _self
     */
    function onChangeExpression(e, _self) {
        var expression = app.expressionCodes[parseInt(this.dataset.index)];
        Class.fieldInsertTextByCursor(_self._$$textareaJO[0], expression.symbol);
    }

    /**
     * 点击了上传图片按钮消息
     * @param e
     */
    function onUploadImageBtnClick(e) {
        this._$inputImageFileJO.click();
    }

    /**
     * 点击了上传文件按钮消息
     * @param e
     */
    function onUploadFileBtnClick(e) {
        this._$inputFileJO.click();
    }

    /**
     * 选择完图片消息
     * @param e
     * @param _self
     */
    function onSelectImagesFinish(e, _self) {
        var files = Array.prototype.filter.call(this.files, function (file) {
            var result = true;

            if (!/^image/g.test(file.type)) {
                app.f7.app.alert("请选择图片格式的文件！");
                result = !result;
            } else if (file.size === 0) {
                result = !result;
            }

            return result;
        }).map(function (file) {
            return {
                type: "img",
                file: file
            }
        });
        selectFileFinish.call(_self, files);
    }

    /**
     * 选择完文件消息
     * @param e
     */
    function onSelectFilesFinish(e, _self) {
        var files = Array.prototype.filter.call(this.files, function (file) {
            return file.size <= 0 ? false : true;
        }).map(function (file) {
            return {
                type: "file",
                file: file
            }
        });
        selectFileFinish.call(_self, files);
    }

    /**
     * 选择完群发对象
     * @param e
     * @param nickNames
     */
    function onSelectGroupSendNicknames(e, data) {

        var _self = this;
        var nickNames = data.data;
        nickNames = nickNames.filter(function (item) {
            return item == _self._nickName ? false : true;
        });
        console.log(nickNames);
        // 删除自己
        this._$groupUserListJO.find("li:not([data-nick-name='" + this._nickName + "'])").remove();
        // 添加别人
        var df = document.createDocumentFragment();
        for (var i = 0, len = nickNames.length; i < len; i++) {
            df.appendChild(groupUserListAppend.call(this, nickNames[i], true)[0]);
        }
        this._$groupUserListJO[0].appendChild(df);
    }

    /**
     * 点击了群发按钮
     */
    function onClickGroupSendBtn() {
        app.f7.app.popup(masspopup.getPageJO()[0]);
    }

    /**
     * 拖拽成功消息
     * @param e
     * @param _self
     */
    function onDragDrop(e, _self) {
        e.preventDefault();
        var files = Array.prototype.filter.call(e.originalEvent.dataTransfer.files, function (file) {
            return file.size <= 0 ? false : true;
        }).map(function (file) {
            return {
                type: "file",
                file: file
            }
        });

        selectFileFinish.call(_self, files);
    }

    /**
     * 其他拖拽的消息
     * @param e
     */
    function onDragUnite(e) {
        e.preventDefault();
    }

    /**
     * 点击图片消息
     * @param e
     */
    function onImageClick(e) {
        var pb = app.f7.app.photoBrowser({
            photos: [e.target.src],
            zoom: 400,
            theme: "dark",
            backLinkText: "关闭",
            ofText: "~"
        });
        pb.open(0);
    }

    /**
     * 点击了下载
     */
    function onDownloadClick() {
        var url = this.dataset.url;
        var name = this.dataset.name;

        var query = "?filename=" + encodeURI(encodeURI(name)) + "&path=" + encodeURI(encodeURI(url));
        window.location.href = app.appRealPath + "servlet/DownloadServlet" + query;
    }

    /**
     * 用户UI更新
     */
    function onUploadProgressChange(e, obj) {

        var nickname = obj.nickname;
        var msgId = obj.msgId;

        var user = usermanager.getUser(nickname);

        var message = user.getMessage(msgId);

        // 当前进度条
        var $progressJO = $("#" + msgId).find(".fileProgress");
        // 当前进度文本
        var $progressTextJO = $("#" + msgId).find(".fileProgressText");

        var progress = parseInt(message.loaded / message.size * 100) + "%";
        setTimeout(function () {
            $progressJO.css("width", progress);
            $progressTextJO.text(progress);
        }, 10);
    }

    /**
     * 点击了头像
     */
    function onTitleClick() {
        // 打开
        if (this._$centerJO.hasClass("close")) {
            this._$centerJO.removeClass("close");
            this._userGroupPanel.show();
        }
        // 关闭
        else {
            this._$centerJO.addClass("close");
            this._userGroupPanel.close();
        }
    }

    /**
     * 点击了群发用户的删除按钮
     */
    function onClickGroupUserListDelete() {
        var _self = this;
        app.f7.app.confirm("真的要删除此人吗？", "提示", function () {
            $(_self).parents("li").remove();
        });
    }

    /**
     * 添加本地消息后的钩子
     */
    function appendMessageHook() {
        var _self = this;

        _self._$$textareaJO[0].style.height = "28px";
        _self._$$textareaJO.val("").blur();
        _self._$$messagebarF7JO[0].style.height = "auto";
        _self._$pageBodyJO.css("padding-bottom", _self._$toolbarJO.height() + "px");
        _self._$scrollTopAnimationJO.css("bottom", _self._$toolbarJO.height() + 20 + "px");
    }

    /**
     * 选中文件后
     * @param files
     */
    function selectFileFinish(files) {
        var _self = this;

        if (_self._goingaway) {
            app.f7.app.alert("当前用户已经离开!");
            return;
        }

        if (files.length > 5) {
            app.f7.app.alert("最多只能同时处理5个文件");
            return;
        }

        var tasks = [];

        for (var i = 0; i < files.length; i++) {
            if (files[i].type == "file") {
                tasks.push({
                    file: files[i].file,
                    dealFun: sendFile
                });
            } else if (files[i].type == "img") {
                tasks.push({
                    file: files[i].file,
                    dealFun: sendImage
                });
            }
        }

        selectFilesDeal.call(_self, tasks);
    }

    /**
     * 处理所有的文件(包括图片和文件)
     * @param files
     */
    function selectFilesDeal(tasks) {
        var dtd = $.Deferred();
        var _self = this;

        // 下面是发送的过程
        var sendFileTask = [];
        for (var i = 0; i < tasks.length; i++) {
            // 一个一个的处理
            (function (task) {
                sendFileTask.push(task.dealFun.call(_self, task.file));
            })(tasks[i]);
        }
        $.when.apply(_self, sendFileTask).done(function () {
            dtd.resolve();
        }).fail(function (errorText) {
            dtd.reject(errorText);
        });

        return dtd.promise();
    }

    /**
     * 发送一个图片
     * @param imageFile
     */
    function sendImage(imageFile) {
        var dtd = $.Deferred();
        var _self = this;

        // 向界面中添加消息
        $(document).trigger(app.events.user.addmessage, {
            id: Tool.guid(),
            contentType: "image",

            // 文件名
            name: imageFile.name,
            // 总的字节
            size: imageFile.size,

            type: "sent",
            source: _self._source,
            target: _self._nickName,
            datetime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            text: encodeURIComponent("<img src='" + webkitURL.createObjectURL(imageFile) + "'>")
        });

        if (_self._source == _self._nickName) {
            return;
        }

        // 向对方发送消息
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var imageBase64 = fileReader.result;
            sendImageMessageAction.call(_self, encodeURIComponent("<img src='" + imageBase64 + "'>")).done(function () {
                dtd.resolve();
            }).fail(function (errorText) {
                dtd.reject(errorText);
            });
        }
        fileReader.readAsDataURL(imageFile);

        return dtd.promise();
    }

    /**
     * 发送一个文件
     * @param file
     */
    function sendFile(file) {

        var dtd = $.Deferred();
        var _self = this;

        if (_self._source == _self._nickName) {
            app.f7.app.alert("不能向自己发送文件");
            return;
        }

        // 向界面中添加消息
        var msgId = Tool.guid();

        var fileName = _self._user.getFileName(file.name);
        $(document).trigger(app.events.user.addmessage, {
            id: msgId,
            contentType: "file",

            // 文件名
            name: fileName,
            // 总的字节
            size: file.size,
            // 上传的字节
            loaded: 0,

            type: "sent",
            source: _self._source,
            target: _self._nickName,
            datetime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            text: encodeURIComponent(Class._uploadFileTemplate({
                name: file.name,
                size: file.size,
                loaded: 0
            }))
        });

        var sendTargetNickNames = getSendTargetNickNames.call(_self);

        fileUpload.call(_self, file, msgId, sendTargetNickNames).done(function () {
            // 任务结束了，向target发送下载消息
            sendMessageAction.call(_self, Class._downloadFileTemplate({
                name: fileName,
                downloadPath: _self._source + "To" + sendTargetNickNames.join("_") + "/" + fileName
            })).done(function () {
                dtd.resolve();
            }).fail(function (errorText) {
                dtd.reject(errorText);
            });
        }).fail(function (errorText) {
            dtd.reject(errorText);
        });

        return dtd.promise();
    }

    /**
     * 上传文件
     * @param file
     * @param dtd
     */
    function fileUpload(file, msgId, sendTargetNickNames) {

        var dtd = $.Deferred();
        var _self = this;
        // 对文件进行查分上传
        var SIZE = file.size;
        console.log("文件大小:" + SIZE + "字节");
        // 一次上传的字节数
        var SINGLESIZE = 1024 * 1024 * 0.5;
        var BOUT, curBout;
        // 一共需要多少次
        BOUT = curBout = (parseInt(SIZE / SINGLESIZE) + (SIZE % SINGLESIZE > 0 ? 1 : 0));
        console.log("一共执行:" + BOUT + "次");
        // 一次的线程数
        var UPLOADTHREADCOUNT = 4;
        var curIndex = 0;
        // 当前的消息
        var message = _self._user.getMessage(msgId);
        // 发送人的

        var taskIndex = 0;

        uploadStart(taskIndex);

        /**
         * 一次(4次Ajax请求)
         * @param taskIndex
         */
        function uploadStart(taskIndex) {

            if (curBout == 0) {
                // 结束了
                console.log("任务结束了");
                dtd.resolve();
                return;
            }

            var count = UPLOADTHREADCOUNT;
            if (curBout < 4) {
                count = curBout;
            }
            curBout -= count;
            console.log(taskIndex + "任务用了" + count + "次执行");
            var uploadTasks = [];
            for (var i = 0; i < count; i++, curIndex++) {
                var endSize;
                // 第一次
                if (curIndex == 0) {
                    if (SIZE < SINGLESIZE) {
                        endSize = SIZE;
                    } else {
                        endSize = (curIndex + 1) * SINGLESIZE;
                    }
                }
                // 最后一次
                else if (curIndex == (BOUT - 1)) {
                    endSize = SIZE;
                }
                else {
                    endSize = (curIndex + 1) * SINGLESIZE;
                }

                console.log(taskIndex + "任务第" + curIndex + "次的start:" + curIndex * SINGLESIZE);
                console.log(taskIndex + "任务第" + curIndex + "次的end:" + endSize);


                uploadTasks.push(upload({
                    source: _self._source,
                    target: sendTargetNickNames.join("_"),
                    name: message.name,//file.name.replace(/[\s\_<>/\\|:"\*\?]*/g, ""),
                    size: SIZE,
                    type: file.type,
                    start: curIndex * SINGLESIZE,
                    end: endSize
                }));
            }
            $.when.apply(_self, uploadTasks).done(function () {
                console.log(taskIndex + "任务都完成了");
                uploadStart(++taskIndex);
            }).fail(function () {
                dtd.reject();
            });

        }

        /**
         * 一次Ajax请求
         * @param formDataParm
         * @returns {*}
         */
        function upload(formDataParm) {
            var dtd1 = $.Deferred();

            var data = new FormData();
            data.append("source", formDataParm.source);
            data.append("target", formDataParm.target);
            data.append("name", formDataParm.name);
            data.append("size", formDataParm.size);
            data.append("type", formDataParm.type);
            data.append("start", formDataParm.start);
            data.append("end", formDataParm.end);
            data.append("data", file.slice(formDataParm.start, formDataParm.end, formDataParm.type));

            var xhr = new XMLHttpRequest();
            xhr.open("post", app.appRealPath + "servlet/UploadServlet", true);
            xhr.setRequestHeader("X_Requested_With", location.href.split("/")[5].replace(/[^a-z]+/g, "$"));
            //xhr.upload.addEventListener("progress", function (e) {
            //
            //}, false);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        message.loaded += (formDataParm.end - formDataParm.start);
                        console.log("loaded:" + message.loaded);
                        // 更新进度UI
                        $(document).trigger(app.events.user.uploadfileprogresschange, {
                            nickname: _self._nickName,
                            msgId: msgId
                        });
                        dtd1.resolve();
                    }
                }
            };
            xhr.send(data);
            return dtd1.promise();
        }

        return dtd.promise();
    }

    /**
     * 发送文本消息
     * @param text
     * @returns {*}
     */
    function sendTextMessageAction(text) {
        return sendMessageAction.call(this, text, "text");
    }

    /**
     * 发送图片消息
     * @param text
     * @returns {*}
     */
    function sendImageMessageAction(text) {
        return sendMessageAction.call(this, text, "image");
    }

    /**
     * 执行发送消息的后台接口
     * @param text
     * @returns {*}
     */
    function sendMessageAction(text, contentType) {
        var dtd = $.Deferred();
        var _self = this;
        var sendNickNames = getSendTargetNickNames.call(_self);
        var sendDatetime = new Date().Format("yyyy-MM-dd hh:mm:ss");
        sendNickNames = sendNickNames.map(function (nickName) {
            return {
                nickName: nickName,
                msg: text,
                sendDatetime: sendDatetime,
                dataType: "text"
            }
        });
        app._ws.send({
            url: "servlet/pushServlet",
            dataType: "json",
            data: {
                source: _self._source,
                target: sendNickNames,
                contentType: contentType,
                business: app.business.cTocSendMessage
            },
            success: function (data) {
                dtd.resolve(data);
            },
            fail: function (msg) {
                dtd.reject(msg);
            },
            complete: function (state, data, message) {
                console.log("complete");
            }
        }).fail(function (errorText) {
            dtd.reject(errorText);
        });
        return dtd.promise();
    }

    /**
     * 发送消息
     */
    function onSend() {
        var _self = this;
        if (_self._goingaway) {
            app.f7.app.alert("当前用户已经离开!");
            return;
        }

        var text = _self._$$textareaJO.val().trim();
        if (!text) {
            app.f7.app.alert("请输入内容！");
            return;
        }

        text = encodeURIComponent(text);

        // 本地的添加
        $(document).trigger(app.events.user.addmessage, {
            id: Tool.guid(),
            contentType: "text",
            type: "sent",
            source: _self._source,
            target: _self._nickName,
            datetime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            text: text
        });

        if (_self._source == _self._nickName) {
            return;
        }

        app.f7.app.showIndicator();
        sendTextMessageAction.call(_self, text).done(function () {
            app.f7.app.hideIndicator();
        }).fail(function (errorText) {
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
        });
    }

    /**
     * 添加一个发送对象
     * @param nickName
     * @param isDelete
     * @returns {*|HTMLElement}
     */
    function groupUserListAppend(nickName, isDelete) {
        var user = usermanager.getUser(nickName);
        var $JO = $(Class._groupUserListItemTemplate(user._user));
        if (isDelete) {
            $JO.find(".delete").show();
        }
        Tool.objectToDataSet(user._user, $JO[0]);
        return $JO;
    }

    /**
     * 获取发送的nicknames
     */
    function getSendTargetNickNames() {
        return Array.prototype.map.call(this._$groupUserListJO[0].children, function (item) {
            return item.dataset.nickName
        });
    }


    /**
     * 获取和当前用户的消息
     * @returns {*}
     */
    function loadMessages() {
        var dtd = $.Deferred();
        var messageDates = this._user.getMessageDates();
        var df = document.createDocumentFragment();
        for (var i = 0, len = messageDates.length; i < len; i++) {
            var messages = this._user.getMessages(messageDates[i]);
            for (var j = 0, len2 = messages.length; j < len2; j++) {
                var msg = messages[j];
                var message = $.extend({}, msg);
                var user = message.type == "received" ? usermanager.getUser(this._nickName) : usermanager.getUser(this._source);
                message.avatar = user._user.logo;//app.appRealPath + "res/images/" + (user._user.sex == "男" ? "boy.png" : "girl.png");
                message.text = Class.decodeMessageText(message.text);
                if (message.contentType == "file") {
                    message.text = Class._uploadFileTemplate(message);
                }
                df.appendChild($(Class._dateTemplate(message))[0]);
                df.appendChild($(message.type == "received" ? Class._receivedTemplate(message) : Class._sendTemplate(message))[0]);
            }
        }
        this._$$messagesF7JO[0].appendChild(df);
        this._messages.layout();
        this._messages.scrollMessages(400, this._$$messagesF7JO[0].scrollHeight + 88 - this._$$messagesContentJO[0].offsetHeight);
        dtd.resolve();
        return dtd.promise();
    }

    /**
     * 初始化NavBar的信息
     */
    function initNavBar() {
        var dtd = $.Deferred();
        this._$centerJO.text(this._nickName);
        dtd.resolve();
        return dtd.promise();
    }

    /**
     * 初始化表情
     */
    function initExpression() {
        var lineItemCount = 7;
        var lineCount = 3;
        var count = 70;

        var j = -1;
        var df = document.createDocumentFragment();
        for (var i = 0; i < count; i++) {

            var $pageJO;
            if (i % (lineItemCount * lineCount) == 0) {
                $pageJO = $(
                    '<div class="swiper-slide"></div>'
                );
                df.appendChild($pageJO[0]);
            }

            if (i % 10 == 0) {
                j++;
            }

            $pageJO.append($("<div class='expressionItemWrap expression" + app.expressionPrefix[j] + (i % 10) + "' data-index='" + i + "'></div>"));
        }
        this._$expressionContainerWrapJO[0].appendChild(df);
    }

    /**
     * 初始化F7组件
     */
    function initF7Components() {
        var _self = this;

        this._messages = app.f7.app.messages(this._$$messagesF7JO, {
            autoLayout: true,
            messageTemplate: '{{#if day}}' +
            '<div class="messages-date">{{day}} {{#if time}}, <span>{{time}}</span>{{/if}}</div>' +
            '{{/if}}' +
            '<div class="message message-{{type}} {{#if hasImage}}message-pic{{/if}} {{#if avatar}}message-with-avatar{{/if}} {{#if position}}message-appear-from-{{position}}{{/if}}" id="{{id}}">' +
            '{{#if name}}<div class="message-name">{{name}}</div>{{/if}}' +
            '<div class="message-text">{{text}}{{#if date}}<div class="message-date">{{date}}</div>{{/if}}</div>' +
            '{{#if avatar}}<div class="message-avatar" style="background-image:url({{avatar}})"></div>{{/if}}' +
            '{{#if label}}<div class="message-label">{{label}}</div>{{/if}}' +
            '</div>'
        });

        this._messagebar = app.f7.app.messagebar(this._$$messagebarF7JO);

        w.scrollTopAnimationFactory(this._$messagesContentJO, this._$scrollTopAnimationJO);

        this._userGroupPanel = w.sideslidingFactory({
            parent: this._$sideslidingOverlayJO,
            height: "25%",
            type: "overlay",
            direction: "top",
            listeners: {
                "create": function () {
                    // 加入自己
                    var $JO = groupUserListAppend.call(_self, _self._nickName, false);
                    _self._$groupUserListJO.append($JO);
                },
                "afterClose": function () {
                    _self._$centerJO.addClass("close");
                    _self._userGroupPanel.close();
                }
            }
        });
    }

    /**
     * 初始化变量
     */
    function initVar() {

        this._params = Tool.getUrlParam();

        // 当前用户是否下线
        this._goingaway = false;

        this._nickName = this._params.nickname;
        this._source = this._params.source;
        this._user = usermanager.getUser(this._nickName);

        this._$pageBodyJO = this.getPageJO().find(".page-body");
        this._$centerJO = this.getPageJO().find(".center");
        this._$$messagesContentJO = this.getF7PageJO().find(".messages-content");
        this._$$messagesF7JO = this.getF7PageJO().find(".messages");

        this._$messagesContentJO = $(this._$$messagesContentJO[0]);
        this._$messagesF7JO = $(this._$$messagesF7JO[0]);

        this._$$messagebarF7JO = this.getF7PageJO().find(".messagebar");

        this._$toolbarJO = this.getPageJO().find(".toolbar");
        this._$$textareaJO = this._$$messagebarF7JO.find("textarea");
        //工具栏
        this._$tooltabsJO = this.getPageJO().find(".tooltabs");
        // 表情面板
        this._$expressionJO = this._$tooltabsJO.find(".expression-container");
        this._$expressionContainerJO = this._$expressionJO.find(" > .swiper-container");
        this._$expressionContainerWrapJO = this._$expressionJO.find(".swiper-wrapper");
        this._$expressionSwiperPaginationJO = this._$expressionJO.find(".swiper-pagination");

        // 工具面板
        this._$toolContainerJO = this._$tooltabsJO.find(".tool-container");
        this._$imageBtnJO = this._$toolContainerJO.find(".imageBtn");
        this._$fileBtnJO = this._$toolContainerJO.find(".fileBtn");
        this._$inputFileJO = this._$toolContainerJO.find("input[type='file'][name='fileField']");
        this._$inputImageFileJO = this._$toolContainerJO.find("input[type='file'][name='imageField']");
        this._$groupSendBtnJO = this._$toolContainerJO.find(".groupSendBtn");
        this._$audioJO = this._$toolContainerJO.find(".audioBtn");
        this._$videoJO = this._$toolContainerJO.find(".videoBtn");

        //表情按钮
        this._$expressionBtnJO = this.getPageJO().find(".expressionBtn");
        //加号按钮
        this._$addBtnJO = this.getPageJO().find(".addBtn");

        // 平滑置顶
        this._$scrollTopAnimationJO = this.getPageJO().find(".ct-scrollTopAnimation-btn");

        // 群发人员面板
        this._$sideslidingOverlayJO = this.getPageJO().find(".ct-sidesliding-overlay");
        this._$groupUserListJO = this._$sideslidingOverlayJO.find("ul");

        this._user._unreadCount = 0;
        this._user.hideReadBadge();
    }

    /**
     * constructor
     * @constructor
     */
    var Class = function () {
        initVar.call(this);
        initEvents.call(this);
        initExpression.call(this);
        initF7Components.call(this);

        app.f7.app.showIndicator();
        $.when.apply(this, [
            initNavBar.call(this),
            loadMessages.call(this)
        ]).done(function () {
            app.f7.app.hideIndicator();
        }).fail(function (errorText) {
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
        });
    }

    Class.prototype = {
        getPageJO: function () {
            return $("#" + this.getId());
        },
        getF7PageJO: function () {
            return $$("#" + this.getId());
        },
        getId: function () {
            return "messages";
        }
    }

    /**
     * 在指定的光标处插入文本
     * @param myField
     * @param myValue
     */
    Class.fieldInsertTextByCursor = function (myField, myValue) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;

        // 保存滚动条
        var restoreTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

        if (restoreTop > 0) {
            myField.scrollTop = restoreTop;
        }

        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    }

    /**
     * 解码消息
     * @param messageText
     * @returns {*}
     */
    Class.decodeMessageText = function (messageText) {
        messageText = decodeURIComponent(messageText);
        return /^<img/g.test(messageText) ? messageText : app.decodeExpression(messageText);
    }

    /**
     * 时间组模板
     */
    Class._dateTemplate = _.template(
        "<div class='messages-date'><%=date%><span style='margin-left: 5px;'><%=time%></span></div>"
    );

    /**
     * 发送消息模板
     */
    Class._sendTemplate = _.template(
        '<div class="message message-sent" id="<%=id%>">' +
        '   <div class="message-name"><%=source%></div>' +
        '   <div class="message-text"><%=text%></div>' +
        '   <div class="message-avatar" style="background-image:url(<%=avatar%>)"></div>' +
        '</div>'
    );

    /**
     * 接收消息模板
     */
    Class._receivedTemplate = _.template(
        '<div class="message message-received" id="<%=id%>">' +
        '    <div class="message-name"><%=source%></div>' +
        '    <div class="message-text"><%=text%></div>' +
        '    <div class="message-avatar" style="background-image:url(<%=avatar%>)"></div>' +
        '</div>'
    );

    /**
     * 上传文件模板
     */
    Class._uploadFileTemplate = _.template(
        '<div class="fileWrap">' +
        '   <div class="fileName"><%=name%></div>' +
        '   <div class="fileProgressWrap">' +
        '       <div class="fileProgress" style="width:<%=parseInt(loaded / size * 100)%>%"></div>' +
        '       <div class="fileProgressText"><%=parseInt(loaded / size * 100)%>%</div>' +
        '   </div>' +
        '</div>'
    );

    Class._downloadFileTemplate = _.template(
        '<div class="fileWrap">' +
        '   <div data-url="<%=downloadPath%>" data-name="<%=name%>" class="download">' +
        '       <div class="fileName"><%=name%></div>' +
        '   </div>' +
        '</div>'
    );

    Class._groupUserListItemTemplate = _.template(
        '<li>' +
        '   <div class="delete">×</div>' +
        '   <div><img src="<%=logo%>" class="logo"></div>' +
        '   <div class="name"><%=nickName%><div>' +
        '</li>'
    );

    return Class;

})(jQuery, Dom7, window);

function init_messages() {
    new messages();
}

function init_messages_beforeremove() {
    app.f7.app.hideIndicator();
    $(document).trigger(app.events.page.beforeremove, "messages");
}