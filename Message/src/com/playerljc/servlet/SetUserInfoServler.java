package com.playerljc.servlet;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * �����û�����Ϣ
 * @author playerljc
 */
public class SetUserInfoServler implements IServlet {

	@Override
	public JSONObject service(Client client, String nickName) {
		return null;
	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		JSONObject response = new JSONObject();
		
		String nickName = data.getString("nickName");
		ClientManager clientManager = ClientManager.getInstance();
		boolean exists = clientManager.containerClient(nickName);
		if(exists) {
			response.put("state", 300);
			response.put("message", "���ǳ��Ѿ�����");
			response.put("dataType", "text");
			response.put("data", "���ǳ��Ѿ�����");
		} else {
			client.setNickName(nickName);
			client.setSex(data.getString("sex"));
			client.setDescribe(data.getString("describe"));
			client.setLogo(data.getString("logo"));
			client.setAddTime(new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(new Date()));
			clientManager.addClient(nickName, client);
			
			client.looper();
			
			response.put("state", 200);
			response.put("message", "�ǳ����óɹ�");
			response.put("dataType", "text");
			response.put("data", "�ǳ����óɹ�");
		}
		
		/**
         * state:��Ӧ�� [200:�ɹ� | 300:ʧ��]
         * message:������Ϣ
         * dataType: [text | json]
         * data:����
         */
		
		return response;
	}
	
	public static void main(String[] args) {
		String [] zm = new String[]{
				"a","b","c","d","e","f","g"
		};
		int j = -1;
		for(int i = 0 ; i < 70 ; i++) {
			if(i % 10 == 0) {
				j++;
			}
			
			System.out.println(
					".expression"+zm[j]+(i%10)+" {"+
					"    background: url(images/expression/61130210_"+(i+1)+".png) no-repeat center center;"+
					"    background-size: 70% 70%;"+
					"}"
			);
		}
	}

}
