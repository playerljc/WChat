package com.playerljc.servlet;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * 设置用户的信息
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
			response.put("message", "此昵称已经存在");
			response.put("dataType", "text");
			response.put("data", "此昵称已经存在");
		} else {
			client.setNickName(nickName);
			client.setSex(data.getString("sex"));
			client.setDescribe(data.getString("describe"));
			client.setLogo(data.getString("logo"));
			client.setAddTime(new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(new Date()));
			clientManager.addClient(nickName, client);
			
			client.looper();
			
			response.put("state", 200);
			response.put("message", "昵称设置成功");
			response.put("dataType", "text");
			response.put("data", "昵称设置成功");
		}
		
		/**
         * state:响应码 [200:成功 | 300:失败]
         * message:描述消息
         * dataType: [text | json]
         * data:数据
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
