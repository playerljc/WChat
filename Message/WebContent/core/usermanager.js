/**
 * Created by Administrator on 2017/4/14.
 * 用户管理
 */
usermanager = (function ($, $$, w) {

    var users = new HashMap();

    return {
        addUser: function (nickName, user) {
            users.put(nickName, user);
        },
        getUser: function (nickName) {
            return users.get(nickName);
        },
        isUser: function (nickName) {
            return users.containsKey(nickName);
        },
        removeUser: function (nickName) {
            users.remove(nickName);
        },
        getSize: function () {
            return users.size();
        },
        getUsers: function () {
            return users.values();
        }
    }

})(jQuery, Dom7, window);