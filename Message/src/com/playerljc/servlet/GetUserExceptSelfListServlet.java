package com.playerljc.servlet;

import java.util.ArrayList;
import java.util.List;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * 获取用户列表除了自己
 * 
 * @author playerljc
 */
public class GetUserExceptSelfListServlet implements IServlet {

	@Override
	public JSONObject service(Client client, String selfNickName) {
		JSONObject response = new JSONObject();
		ClientManager clientManager = ClientManager.getInstance();
		List<String> nickNames = clientManager.getNickNamesExceptNickName(selfNickName);

		List<JSONObject> users = new ArrayList<JSONObject>();
		for (int i = 0; i < nickNames.size(); i++) {
			String nickName = nickNames.get(i);
			Client tClient = clientManager.getClient(nickName);
			JSONObject user = new JSONObject();
			user.put("nickName", tClient.getNickName());
			user.put("sex", tClient.getSex());
			user.put("describe", tClient.getDescribe());
			user.put("logo", tClient.getLogo());
			user.put("addTime", tClient.getAddTime());
			users.add(user);
		}

		response.put("state", 200);
		response.put("message", "success");
		response.put("dataType", "json");
		response.put("data", users);
		return response;
	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		System.out.println(data);
		return null;
	}

}
