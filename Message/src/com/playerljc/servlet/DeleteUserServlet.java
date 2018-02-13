package com.playerljc.servlet;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * ɾ��ָ���û�
 * @author Administrator
 */
public class DeleteUserServlet implements IServlet {
	
	@Override
	public JSONObject service(Client client, String nickName) {
		JSONObject response = new JSONObject();
		ClientManager clientManager = ClientManager.getInstance();
		clientManager.removeClient(nickName);
//			response.put("state", 300);
//			response.put("message", "���ǳ��Ѿ�����");
//			response.put("dataType", "text");
//			response.put("data", "���ǳ��Ѿ�����");
		response.put("state", 200);
		response.put("message", "ɾ���û��ɹ�");
		response.put("dataType", "text");
		response.put("data", "ɾ���û��ɹ�");

		/**
		 * state:��Ӧ�� [200:�ɹ� | 300:ʧ��] message:������Ϣ dataType: [text | json]
		 * data:����
		 */

		return response;

	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		
		return null;
	}
}
