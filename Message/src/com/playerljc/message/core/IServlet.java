package com.playerljc.message.core;

import com.alibaba.fastjson.JSONObject;

/**
 * ҵ����ӿ�
 * @author playerljc
 *
 */
public interface IServlet {

	JSONObject service(Client client, String data);

	JSONObject service(Client client, JSONObject data);

}
