package com.playerljc.servlet;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.playerljc.message.core.Client;
import com.playerljc.message.core.ClientManager;
import com.playerljc.message.core.IServlet;

/**
 * 推模式
 * cToc
 * @author playerljc
 *
 */
public class PushServlet implements IServlet{

	@Override
	public JSONObject service(Client client, String data) {
		return null;
	}

	@Override
	public JSONObject service(Client client, JSONObject data) {
		JSONObject response = null;
		ClientManager clientManager = ClientManager.getInstance();
		try {
			response = new JSONObject();
			String source = data.getString("source");
			String contentType = data.getString("contentType");
			Client sourceClient = clientManager.getClient(source);
			String business = data.getString("business");
			
			// 得到推的nickNames
			Object obj = data.get("target");
			JSONArray targets = null;
			if(obj instanceof String) {
				targets = new JSONArray();
				List<String> nickNames = clientManager.getNickNamesExceptNickName(source);
				for(int i = 0 ; i < nickNames.size(); i++) {
					JSONObject target = new JSONObject();
					target.put("nickName", nickNames.get(i));
					target.put("sendDatetime", new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").format(new Date()));
					target.put("msg", "");
					target.put("dataType", "text");
					targets.add(target);
				}
			} else if(obj instanceof JSONArray) {
				targets = (JSONArray) obj;
			}
			
			
			for(int i = 0 ; i < targets.size(); i++) {
				JSONObject target = targets.getJSONObject(i);
				Client tClient = clientManager.getClient(target.getString("nickName"));
				if(tClient == null) continue;
				target.put("requestType", "push");
				JSONObject sourceObj = new JSONObject();
				sourceObj.put("nickName", sourceClient.getNickName());
				sourceObj.put("sex", sourceClient.getSex());
				sourceObj.put("describe", sourceClient.getDescribe());
				sourceObj.put("logo", sourceClient.getLogo());
				target.put("source", sourceObj);
				target.put("contentType", contentType);
				target.put("business", business);
				tClient.send(JSONObject.toJSONString(target));	
			}
			
			response.put("state", 200);
			response.put("message", "success");
			response.put("dataType", "text");
			response.put("data", "success");
			
		} catch (IOException e) {
			e.printStackTrace();
			response.put("state", 300);
			response.put("message", "fail");
			response.put("dataType", "text");
			response.put("data", "fail");
		}
		
		return response;
	}

}
