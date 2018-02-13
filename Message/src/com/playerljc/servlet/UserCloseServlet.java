package com.playerljc.servlet;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * 用户退出
 * 
 * @author Administrator
 */
public class UserCloseServlet implements IServlet {

	@Override
	public JSONObject service(Client client, String nickName) {

		JSONObject response = new JSONObject();
		ClientManager cm = ClientManager.getInstance();

		if (nickName == null || "".equals(nickName)) {
			response.put("state", 300);
			response.put("message", "fail");
			response.put("dataType", "text");
			response.put("data", "fail");
		} else if (!cm.containerClient(nickName)) {
			response.put("state", 300);
			response.put("message", "fail");
			response.put("dataType", "text");
			response.put("data", "fail");
		} else {
			// 向其他人返送推出的通知
			JSONObject msg = new JSONObject();
			msg.put("url", "servlet/pushServlet");
			msg.put("dataType", "json");
			JSONObject data = new JSONObject();
			data.put("source", nickName);
			data.put("target", "all");
			data.put("business", Client.business.userGoingAway.toString());
			msg.put("data", data);
			client.onServlet(JSONObject.toJSONString(msg));
			// 获取退出的Client
			// 在集合中删除client
			cm.removeClient(nickName);

			response.put("state", 200);
			response.put("message", "success");
			response.put("dataType", "text");
			response.put("data", "success");
		}

		return response;
	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		return null;
	}

}
