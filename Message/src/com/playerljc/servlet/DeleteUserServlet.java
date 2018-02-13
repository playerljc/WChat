package com.playerljc.servlet;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * 删除指定用户
 * @author Administrator
 */
public class DeleteUserServlet implements IServlet {
	
	@Override
	public JSONObject service(Client client, String nickName) {
		JSONObject response = new JSONObject();
		ClientManager clientManager = ClientManager.getInstance();
		clientManager.removeClient(nickName);
//			response.put("state", 300);
//			response.put("message", "此昵称已经存在");
//			response.put("dataType", "text");
//			response.put("data", "此昵称已经存在");
		response.put("state", 200);
		response.put("message", "删除用户成功");
		response.put("dataType", "text");
		response.put("data", "删除用户成功");

		/**
		 * state:响应码 [200:成功 | 300:失败] message:描述消息 dataType: [text | json]
		 * data:数据
		 */

		return response;

	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		
		return null;
	}
}
