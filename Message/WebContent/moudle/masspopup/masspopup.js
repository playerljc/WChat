/**
 * 群发对话框
 */
masspopup = (function ($, $$, w) {

    function initVar() {
        this._$userlistJO = this.getPageJO().find(".list-block > ul");
        this._$checkAllJO = this.getPageJO().find(".right");
        this._$submitJO = this.getPageJO().find(".submit");
    }

    function initEvents() {
        var _self = this;
        _self.getF7PageJO().on("open", onOpen.bind(this));

        _self.getF7PageJO().on("opened", onOpened.bind(this));

        _self.getF7PageJO().on("close", onClose.bind(this));

        _self.getF7PageJO().on("closed", onClosed.bind(this));

        _self._$checkAllJO.on("click", Tool.eventBridge(null, onCheckAll, [_self]));

        _self._$userlistJO.on("click", "li", Tool.eventBridge(null, onUserListClick, [_self]));

        _self._$submitJO.on("click", function () {
            var checkUsers = _self._$userlistJO.find(".check");
            if (checkUsers.size() === 0) {
                app.f7.app.alert("请选择要发送的用户");
                return;
            }
            var nickNames = [];
            for (var i = 0; i < checkUsers.size(); i++) {
                nickNames.push($(checkUsers[i]).parents("li")[0].dataset.nickName);
            }
            $(document).trigger(app.events.user.groupsend, {
                data: nickNames
            });
            app.f7.app.closeModal(_self.getPageJO()[0]);
        })
    }

    /**
     * 渲染用户列表
     * @param data
     */
    function renderUserList(data) {
        var df = document.createDocumentFragment();
        for (var i = 0; i < data.length; i++) {
            var $jo = $(index._userCheckListTemplate(data[i]));
            Tool.objectToDataSet(data[i], $jo[0]);
            df.appendChild($jo[0]);
        }
        this._$userlistJO[0].appendChild(df);
    }

    function onOpen() {
        app.f7.app.showIndicator();
        var _self = this;
        this.loadData().done(function (userList) {
            renderUserList.call(_self, userList);
            app.f7.app.hideIndicator();
        }).fail(function (errorText) {
            app.f7.app.hideIndicator();
            app.f7.app.alert(errorText);
        });
    }

    function onOpened() {

    }

    function onClose() {

    }

    function onClosed() {
        this._$userlistJO.empty();
    }

    function onCheckAll(e, _self) {
        if (this.dataset.check === "checkall") {
            _self._$userlistJO.find(".item-check").addClass("check");
            this.dataset.check = "nocheckall";
            this.innerText = "全部取消";
        } else if (this.dataset.check === "nocheckall") {
            _self._$userlistJO.find(".item-check").removeClass("check");
            this.dataset.check = "checkall";
            this.innerText = "全选";
        }
    }

    function onUserListClick(e, _self) {
        var $itemCheckJO = $(this).find(".item-check");
        if (!$itemCheckJO.hasClass("check")) {
            $itemCheckJO.addClass("check");
            if (_self._$userlistJO.find(".check").size() === _self._$userlistJO.find(".item-check").size()) {
                _self._$checkAllJO[0].dataset.check = "nocheckall";
                _self._$checkAllJO.text("全部取消");
            }
        } else {
            $itemCheckJO.removeClass("check");
            _self._$checkAllJO[0].dataset.check = "checkall";
            _self._$checkAllJO.text("全选");
        }
    }

    function F() {

    }

    F.prototype = {
        initial: function () {
            initVar.call(this);
            initEvents.call(this);
        },
        getPageJO: function () {
            return $("#" + this.getId());
        },
        getF7PageJO: function () {
            return $$("#" + this.getId());
        },
        getId: function () {
            return "mass-popup";
        },
        loadData: function () {
            var dtd = $.Deferred();
            var curUser = Preferences.getObjectBySession(app.keys.user);
            app._ws.send({
                url: "servlet/getUserExceptSelfListServlet",
                dataType: "text",
                data: curUser.nickName,
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
    }

    return Object.create(F.prototype, {});

})(jQuery, Dom7, window);