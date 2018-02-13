package com.playerljc.message.core;

import com.alibaba.fastjson.JSONObject;

/**
 * 业务处理接口
 * @author playerljc
 *
 */
public interface IServlet {

	JSONObject service(Client client, String data);

	JSONObject service(Client client, JSONObject data);

}
