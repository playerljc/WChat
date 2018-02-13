index = (function ($, $$, w) {

    /**
     * 注册事件
     */
    function initEvents() {
        var _self = this;

        /**
         * 窗体的移除事件
         */
        $(document).on(app.events.page.beforeremove, onPageBeforeRemove.bind(this));

        /**
         * 用户的添加事件
         */
        $(document).on(app.events.user.adduser, onAddUser.bind(this));

        /**
         * 用户的删除事件
         */
        $(document).on(app.events.user.removeuser, onRemoveUser.bind(this));

        /**
         * 消息的添加事件
         */
        $(document).on(app.events.user.addmessage, onAddMessage.bind(this));

        /**
         * 点击了用户列表的一行
         */
        this._$userlistJO.on("click", " > li", Tool.eventBridge(null, onClickUserListViewItem, [_self]));
    }

    /**
     * 点击了用户列表的一行
     * @param e
     */
    function onClickUserListViewItem(e, _self) {
        if (_self._onPushLock) return;

        // 点击了一行
        var liDom = this;

        _self._curNickname = liDom.dataset.nickName;
        app.f7.mainView.router.load({
            url: app.appRealPath + "moudle/messages/messages.html?nickname=" + liDom.dataset.nickName + "&source=" + _self._nickName
        });
    }

    /**
     * 添加消息
     * @param e
     * @param message
     */
    function onAddMessage(e, message) {
        var _self = this;
        if (message.source == _self._nickName || message.source == _self._curNickname) return;
        app.makeNotification("提示", "来自" + message.source + "的一条消息，请查看");
        var user = usermanager.getUser(message.source);
        user.addMessage(message);
        user._unreadCount++;
        user.showReadBadge();

        var childrenDoms = this._$userlistJO[0].children;
        var firstUiDom = childrenDoms[0];
        if (firstUiDom === user._uiDom) return;

        var firstUiDomClone = firstUiDom.cloneNode(true);
        var uiDomClone = user._uiDom.cloneNode(true);


        var userUiDomIndex;
        for (var i = 0, len = childrenDoms.length; i < len; i++) {
            if (childrenDoms[i].dataset.nickName == user._uiDom.dataset.nickName) {
                userUiDomIndex = i;
                break;
            }
        }

        this._$userlistJO[0].replaceChild(uiDomClone, firstUiDom);
        this._$userlistJO[0].replaceChild(firstUiDomClone, childrenDoms[userUiDomIndex]);
        user._uiDom = uiDomClone;
        usermanager.getUser(firstUiDomClone.dataset.nickName)._uiDom = firstUiDomClone;

    }

    /**
     * 删除用户
     */
    function onRemoveUser(e, source) {
        var user = usermanager.getUser(source);
        $(user._uiDom).remove();
        usermanager.removeUser(source);
        if (this._curNickname == source) {
            $(document).trigger(app.events.user.usergoingaway, source);
        }
    }

    /**
     * 添加用户
     * @param e
     * @param obj
     */
    function onAddUser(e, obj) {
        usermanager.addUser(obj.user.nickName, new user(obj.user, obj.uiDom));
    }

    /**
     * 页面销毁之前
     * @param e
     * @param pageName
     */
    function onPageBeforeRemove(e, pageName) {
        if (pageName === "messages") {
            this._curNickname = null;
        }
    }

    /**
     * 用户上线消息
     * @param msgObj
     * nickName:昵称
     * msg:消息
     * sendDatetime:发送时间
     * dataType:[text | json]
     * source:源
     * business:业务id
     */
    function newUserOnLine(msgObj) {
        var $jo = $(Class._userListTemplate(msgObj.source));
        Tool.objectToDataSet(msgObj.source, $jo[0]);
        this._$userlistJO.prepend($jo);
        $(document).trigger(app.events.user.adduser, {
            user: msgObj.source,
            uiDom: $jo[0]
        });
        app.makeNotification("提示", msgObj.source.nickName + "上线了");
        getMessage.call(this);
    }

    /**
     * CTOC的消息接收
     * @param msgObj
     * source:源
     * nickName:昵称
     * msg:消息
     * sendDatetime:发送时间
     * dataType:[text | json]
     * business:业务id
     */
    function cTocSendMessage(msgObj) {
        $(document).trigger(app.events.user.addmessage, {
            id: Tool.guid(),
            contentType: msgObj.contentType,
            type: "received",
            source: msgObj.source.nickName,
            target: msgObj.nickName,
            datetime: msgObj.sendDatetime,
            text: msgObj.msg
        });
        getMessage.call(this);
    }

    /**
     * * 用户退出的消息
     * @param msgObj
     * source:源
     * nickName:昵称
     * msg:消息
     * sendDatetime:发送时间
     * dataType:[text | json]
     * business:业务id
     * @param msgObj
     */
    function userGoingAway(msgObj) {
        $(document).trigger(app.events.user.removeuser, msgObj.source.nickName);
        app.makeNotification("提示", msgObj.source.nickName + "下线了");
        getMessage.call(this);
    }

    /**
     * 业务事件
     * @param msgObj
     */
    function onPush(msgObj) {
        var business = msgObj.business;
        // 加入锁
        this._onPushLock = true;
        switch (business) {
            // 新用户登录
            case app.business.newUserOnLine:
                this._onPushMsgQueue.push({
                    method: newUserOnLine,
                    context: this,
                    params: [msgObj]
                });
                getMessage.call(this);
                break;
            // CTOC消息
            case app.business.cTocSendMessage:
                this._onPushMsgQueue.push({
                    method: cTocSendMessage,
                    context: this,
                    params: [msgObj]
                });
                getMessage.call(this);
                break;
            // 用户退出的消息
            case app.business.userGoingAway:
                this._onPushMsgQueue.push({
                    method: userGoingAway,
                    context: this,
                    params: [msgObj]
                });
                getMessage.call(this);
                break;
        }
        this._onPushLock = false;
        // 解除锁
    }

    /**
     * 从消息队列中拿出一个消息进行处理
     */
    function getMessage() {
        if (this._onPushMsgQueue.length == 0) return;
        var message = this._onPushMsgQueue.pop();
        message.method.apply(message.context, message.params);
    }

    /**
     * 设置用户信息的birdge
     */
    function setUserInfoBirdge(userInfo) {
        var _self = this;

        var $parentJO = $(".modal .modal-inner .modal-text");
        var $logo = $parentJO.find(".logo");

        setUserInfoAction.call(_self, {
            nickName: userInfo.nickName,
            sex: userInfo.sex,
            describe: userInfo.describe,
            logo: $logo.attr("src")
        }).done(function () {
            _self._nickName = userInfo.nickName;
            _self._sex = userInfo.sex;
            _self._describe = userInfo.describe;
            _self._logo = $logo.attr("src");

            Preferences.putObjectBySession(app.keys.user, {
                nickName: _self._nickName,
                sex: _self._sex,
                describe: _self._describe,
                logo: _self._logo
            });

            $.when.apply(_self, [
                loadUserListAction.call(_self),
                newUserOnLineAction.call(_self)
            ]).done(function (userList) {
                renderUserList.call(_self, userList);
                app.f7.app.hideIndicator();
            }).fail(function (errorText) {
                app.f7.app.hideIndicator();
                app.f7.app.alert(errorText);
            });
        }).fail(function (errorText) {
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
            setUserInfo.call(_self);
        });

    }

    /**
     * 设置用户信息
     */
    function setUserInfo() {
        var _self = this;

        app.f7.app.modal({
            title: "提示",
            text: Class.userInfoModelTemplateStr,
            buttons: [{
                text: "确定",
                onClick: function () {
                    if (isLoadingLogo) return;

                    var $nickNameJO = $parentJO.find("input[name='nickname']");
                    var $describeJO = $parentJO.find("textarea[name='describe']");

                    var result = Tool.submitValidate($parentJO[0]);
                    if (!result) {
                        setUserInfo.call(_self);
                        return;
                    }

                    app.f7.app.showIndicator();

                    var nickName = $nickNameJO.val().trim().replace(/[\s\_<>/\\|:"\*\?]*/g, "");
                    var sex = $sexJO.val().trim();
                    var describe = $describeJO.val().trim();

                    setUserInfoBirdge.call(_self, {
                        nickName: nickName,
                        sex: sex,
                        describe: describe
                    });
                }
            }]
        });


        var $parentJO = $(".modal .modal-inner .modal-text");
        var $logo = $parentJO.find(".logo");
        var $logoFieldJO = $parentJO.find("input[name='logoField']");
        var $logoPathFieldJO = $parentJO.find("input[name='logoPathField']");
        var $uploadBtnJO = $parentJO.find(".uploadBtn");
        var isLoadingLogo = false;

        var $sexJO = $parentJO.find("select[name='sex']");

        $sexJO.on("change", function () {
            if ($sexJO.val() == "男") {
                $logo.attr("src", app.appRealPath + "res/images/boy.png");
            } else if ($sexJO.val() == "女") {
                $logo.attr("src", app.appRealPath + "res/images/girl.png");
            }
        });

        $logoFieldJO.on("change", function () {
            var file = this.files[0];
            if (!/^image\//g.test(file.type)) {
                app.f7.app.alert("请选择图片文件，请重新选择！");
                isLoadingLogo = false;
                return;
            }

            $logoPathFieldJO.val(this.value);
            var reader = new FileReader();
            reader.onload = function () {
                $logo.attr("src", reader.result);
                isLoadingLogo = false;
            }
            reader.readAsDataURL(file);
        });

        $uploadBtnJO.on("click", function () {
            isLoadingLogo = true;
            $logoFieldJO.click();
        });
    }

    /**
     * 渲染用户列表
     * @param data
     */
    function renderUserList(data) {
        var df = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            var $jo = $(Class._userListTemplate(data[i]));
            Tool.objectToDataSet(data[i], $jo[0]);
            df.appendChild($jo[0]);
            $(document).trigger(app.events.user.adduser, {
                user: data[i],
                uiDom: $jo[0]
            });
        }

        this._$userlistJO[0].appendChild(df);
    }

    /**
     * 获取在线用户列表
     * @returns {*}
     */
    function loadUserListAction() {
        var dtd = $.Deferred();
        app._ws.send({
            url: "servlet/getUserListServlet",
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
     * 设置用户信息
     * @params userInfo
     * {
     *      nickName:$nickNameJO.val().trim(),
            sex:$sexJO.val(),
            describe:$describeJO.val()
     * }
     */
    function setUserInfoAction(userInfo) {
        var dtd = $.Deferred();
        app._ws.send({
            url: "servlet/setUserInfoServler",
            dataType: "json",
            data: userInfo,
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
     * 删除用户
     * @returns {*}
     */
    function deleteUser(nickName) {
        var dtd = $.Deferred();
        app._ws.send({
            url: "servlet/deleteUserServlet",
            dataType: "text",
            data: nickName,
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

    ///**
    // * 用户退出
    // */
    //function userCloseAction() {
    //    var dtd = $.Deferred();
    //    app._ws.send({
    //        url: "servlet/userCloseServlet",
    //        dataType: "text",
    //        data: this._nickName,
    //        success: function (data) {
    //            dtd.resolve(data);
    //        },
    //        fail: function (msg) {
    //            dtd.reject(msg);
    //        },
    //        complete: function (state, data, message) {
    //            console.log("complete");
    //        }
    //    }).fail(function (errorText) {
    //        dtd.reject(errorText);
    //    });
    //    return dtd.promise();
    //}

    /**
     * 链接服务器
     */
    function connectionWS() {
        var dtd = $.Deferred();
        var _self = this;
        app._ws.connect(function () {
            app._ws.on(websocket.TYPES.open, onOpen.bind(_self));
            app._ws.on(websocket.TYPES.error, onError.bind(_self));
            app._ws.on(websocket.TYPES.close, onClose.bind(_self));
            app._ws.on(websocket.TYPES.push, onPush.bind(_self));
            dtd.resolve();
        }, function () {
            dtd.reject("您的浏览器太老了，换一个新的吧!")
        });
        return dtd.promise();
    }

    /**
     * 用户上线
     * @returns {*}
     */
    function newUserOnLineAction() {
        var dtd = $.Deferred();
        var _self = this;
        app._ws.send({
            url: "servlet/pushServlet",
            dataType: "json",
            data: {
                source: _self._nickName,
                target: "all",
                business: app.business.newUserOnLine
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
     * 初始化f7的组件
     */
    function initF7Components() {
        this._searchBar = app.f7.app.searchbar(this._$$searchBar, {
            searchList: this._$userlistJO[0],
            overlay: this._$searchBarOverlayJO[0],
            searchIn: ".item-title"
            //customSearch: true,
        });
    }

    /**
     * 初始化所有的popups
     */
    function initPopups() {
        masspopup.initial();
    }

    /**
     * 初始化变量
     */
    function initVar() {
        app._ws = new websocket(app.wsUrl);
        // 客户端是否关闭
        this._isClose = false;
        // cTc的消息栈
        this._onPushMsgQueue = [];
        // cTc的锁
        this._onPushLock = false;
        this._$userlistJO = $("#userlist");
        this._$searchBarOverlayJO = this.getPageJO().find(".searchbar-overlay");
        this._$$searchBar = $$("#" + this.getId() + " .searchbar");
    }

    /**
     * 链接成功
     */
    function onOpen() {
        var _self = this;
        if (this._isClose) {
            // 如果重连成功
            deleteUser.call(_self).done(function () {
                setUserInfoBirdge.call(_self, {
                    nickName: _self._nickName,
                    sex: _self._sex,
                    describe: _self._describe
                });
            }).fail(function (errorText) {
                app.f7.app.hideIndicator();
                app.f7.app.alert(errorText);
            });
        } else {
            setUserInfo.call(this);
        }
    }

    /**
     * 链接失败
     */
    function onError() {
        onClose.call(this);
    }

    /**
     * 链接关闭
     */
    function onClose(e) {
        debugger

        //code:1001
        //composed:false
        //reason:"The web application is stopping"
        //type:"close"
        //wasClean:true

        // 如果没登录则不需要重连
        if(!this._nickName) {
            window.location.href = app.appRealPath + "moudle/index/index.html";
            return;
        }

        // 如果服务器关闭不需要重连
        if(e.type == "close") {
            window.location.href = app.appRealPath + "moudle/index/index.html";
            return;
        }
        
        // 重新连接
        this._isClose = true;
        app.f7.app.showIndicator();
        connectionWS.call(this).fail(function(errorText){
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
        });
    }

    /**
     * constructor
     * @constructor
     */
    var Class = function () {
        debugger
        initVar.call(this);
        initEvents.call(this);
        initF7Components.call(this);
        initPopups.call(this);
        app.f7.app.showIndicator();
        connectionWS.call(this).done(function(){
            app.f7.app.hideIndicator();
        }).fail(function(errorText){
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
            return "index";
        }
    }

    Class.userInfoModelTemplateStr =
        '<div class="list-block media-list userInfoModel">' +
        '    <ul>' +
        '        <li>' +
        '            <div class="item-content">' +
        '                <div class="item-inner">' +
            //'                    <div class="item-title label">昵称</div>'+
        '                    <div class="item-input">' +
        '                        <input type="text" placeholder="昵称" name="nickname" required="required" requiredmessage="请输入昵称" maxlength="10" lengthmessage="昵称的长度不能超过10个字">' +
        '                    </div>' +
        '                </div>' +
        '             </div>' +
        '         </li>' +

        '         <li>' +
        '            <div class="item-content">' +
        '                <div class="item-inner">' +
            //'                    <div class="item-title label">性别</div>'+
        '                    <div class="item-input">' +
        '                        <select name="sex">' +
        '                            <option>男</option>' +
        '                            <option>女</option>' +
        '                        </select>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '         </li>' +

        '         <li class="logoGroup">' +
        '            <div class="item-content">' +
        '                <div class="item-media"><img class="logo" src="' + (app.appRealPath + "res/images/boy.png") + '" width="40"></div>' +
        '                <div class="item-inner">' +
        '                    <div class="item-input">' +
        '                        <input type="file" name="logoField" style="display: none;">' +
        '                        <input type="text" placeholder="头像" readonly name="logoPathField" style="width: 100%;">' +
        '                        <div class="uploadBtn">...</div>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '         </li>' +

        '         <li>' +
        '            <div class="item-content">' +
        '                <div class="item-inner">' +
            //'                    <div class="item-title label">简单描述</div>'+
        '                    <div class="item-input">' +
        '                        <textarea class="resizable" placeholder="简单描述" name="describe" maxlength="150" lengthmessage="描述的长度不能超过150个字"></textarea>' +
        '                    </div>' +
        '                </div>' +
        '            </div>' +
        '         </li>' +
        '    </ul>' +
        '</div>';

    Class._userListTemplate = _.template(
        '<li>' +
        '   <div class="item-content">' +
        '     <div class="item-media"><img src="<%=logo%>" width="44"></div>' +
        '     <div class="item-inner">' +
        '        <div class="item-title-row">' +
        '             <div class="item-title"><%=nickName%></div>' +
        '             <div class="item-after">' +
        '                  <span class="badge" style="display: none;">0</span>' +
        '             </div>' +
        '        </div>' +
        '        <div class="item-subtitle"><%=describe%></div>' +
        '     </div>' +
        '  </div>' +
        '</li>'
    );

    Class._userCheckListTemplate = _.template(
        '<li>' +
        '   <div class="item-content">' +
        '     <div class="item-check"></div>' +
        '     <div class="item-media"><img src="<%=logo%>" width="44"></div>' +
        '     <div class="item-inner">' +
        '        <div class="item-title-row">' +
        '             <div class="item-title"><%=nickName%></div>' +
        '             <div class="item-after">' +
        '                  <span class="badge" style="display: none;">0</span>' +
        '             </div>' +
        '        </div>' +
        '        <div class="item-subtitle"><%=describe%></div>' +
        '     </div>' +
        '  </div>' +
        '</li>'
    );

    return Class;

})(jQuery, Dom7, window);

function init_index() {
    new index;
}