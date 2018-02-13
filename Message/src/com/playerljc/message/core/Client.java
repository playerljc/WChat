/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package com.playerljc.message.core;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import javax.websocket.CloseReason;
import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.RemoteEndpoint;
import javax.websocket.Session;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

/**
 * Client 代表一个浏览器客户端
 * @author playerljc
 *
 */
public class Client extends Endpoint {

	public static enum business {  
	    userGoingAway
	}  
    
    private String nickName;
    private String sex;
    private String describe;
    private String logo;
    
	private Session session; 
	private String addTime;
	
	private EchoMessageHandlerText echoMessageHandlerText;
	private EchoMessageHandlerBinary echoMessageHandlerBinary;
	
	private LinkedBlockingQueue<String> queue;
	private ExecutorService threadPool;
	
	
	public Session getSession() {
		return session;
	}
	
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	
	public String getNickName() {
		return nickName;
	}
	
	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	public String getDescribe() {
		return describe;
	}

	public void setDescribe(String describe) {
		this.describe = describe;
	}

	public String getLogo() {
		return logo;
	}

	public void setLogo(String logo) {
		this.logo = logo;
	}

	public String getAddTime() {
		return addTime;
	}

	public void setAddTime(String addTime) {
		this.addTime = addTime;
	}
	
	public Client() {
		super();
	}
	
	public void send(String msg) throws IOException {
		echoMessageHandlerText.send(msg);
	}
	
	public void sendBinary(byte[] array) throws IOException {
		echoMessageHandlerBinary.send(array);
	}
	
	public JSONObject onServlet(String msg) {
		return echoMessageHandlerText.onServlet(msg);
	}
	
	public void onMessage(String msg) {
		echoMessageHandlerText.onMessage(msg);
	}
	

	@Override
    public void onOpen(Session session, EndpointConfig endpointConfig) {
		this.session = session;
		RemoteEndpoint.Async remoteEndpointAsync = session.getAsyncRemote();
		this.echoMessageHandlerText = new EchoMessageHandlerText(remoteEndpointAsync);
		this.echoMessageHandlerBinary = new EchoMessageHandlerBinary(remoteEndpointAsync);
		this.session.addMessageHandler(echoMessageHandlerText);
		this.session.addMessageHandler(echoMessageHandlerBinary);
    }
    
    @Override
    public void onClose(Session session, CloseReason closeReason) {
    	// 没有输入nickName
    	if(this.getNickName() == null) return;
    	
        if(CloseReason.CloseCodes.GOING_AWAY.equals(closeReason.getCloseCode())) {
        	JSONObject msgObj = new JSONObject();
        	msgObj.put("url", "servlet/userCloseServlet");
        	msgObj.put("dataType", "text");
        	msgObj.put("data", this.getNickName());
        	System.out.println("nickName:"+this.getNickName());
        	this.onMessage(msgObj.toJSONString());
        }
    }

    @Override
    public void onError(Session session, Throwable t) {
    	System.out.println();
    }
    
    public void looper() {
    	queue = new LinkedBlockingQueue<String>();
        threadPool = Executors.newFixedThreadPool(1);
        threadPool.submit(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				while(true) {
					String msg = queue.take();
					JSONObject response = onServlet(msg);
					if(response != null) {
						send(JSONObject.toJSONString(response));
					}
				}
			}
		});
        threadPool.shutdown();
	}
    
    /**
     * 文本消息
     * @author playerljc
     */
    private class EchoMessageHandlerText implements MessageHandler.Whole<String> {

        private final RemoteEndpoint.Async remoteEndpointAsync;

        private EchoMessageHandlerText(RemoteEndpoint.Async remoteEndpointAsync) {
            this.remoteEndpointAsync = remoteEndpointAsync;
        }

        public synchronized void send(String msg) throws IOException {
        	if(Client.this.session.isOpen()) {
        		remoteEndpointAsync.sendText(msg);
        	} else {
        		ClientManager cm = ClientManager.getInstance();
        		if(nickName != null && !"".equals(nickName) && cm.getClient(nickName) != null) {
        			cm.removeClient(nickName);
        		}
        	}
		}

		/**
         * 接收到了Client的文本消息
         */
		@Override
		public synchronized void onMessage(String msg) {
			if(Client.this.queue != null) {
				System.out.println("后几次");
				Client.this.queue.add(msg);
			} else {
				System.out.println("第一次");
				JSONObject response = onServlet(msg);
	    		try {
					send(JSONObject.toJSONString(response));
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		
		public synchronized JSONObject onServlet(String msg) {
        	System.out.println(msg);
        	JSONObject response = null;
        	try {
        		// 前端请求过来的消息
				JSONObject msgObj = JSONObject.parseObject(msg);
				
				String servletName = msgObj.getString("url");
				IServlet servlet = ServletContext.getInstance().getServlet(servletName);
				
				Object data = null;
				String dataType = msgObj.getString("dataType");
				if("json".equals(dataType)) {
					data = JSON.parseObject(msgObj.getString("data"));
					response = servlet.service(Client.this,(JSONObject)data);
				} else {
					data = msgObj.getString("data");
					response = servlet.service(Client.this,(String)data);
				}

				/**
		         * token:请求的token,
		         * state:响应码 [200:成功 | 300:失败]
		         * message:描述消息
		         * dataType: [text | json]
		         * data:数据
		         * requestType:pull | push
		         */
				if(response != null) {
					response.put("requestType", "pull");
					response.put("token", msgObj.getString("token"));
				}
				
			} catch (Exception e) {
				e.printStackTrace();
			}
			return response;
        }
    }
    

    /**
     * 字节消息
     * @author playerljc
     */
    private class EchoMessageHandlerBinary implements MessageHandler.Whole<ByteBuffer> {
            
        private final RemoteEndpoint.Async remoteEndpointAsync;
        
        private EchoMessageHandlerBinary(RemoteEndpoint.Async remoteEndpointAsync) {
            this.remoteEndpointAsync = remoteEndpointAsync;
        }

        public void send(byte [] bytes) throws IOException {
        	if(Client.this.session.isOpen()) {
        		ByteBuffer buf = ByteBuffer.wrap(bytes);
            	remoteEndpointAsync.sendBinary(buf);
        	} else {
        		ClientManager cm = ClientManager.getInstance();
        		if(nickName != null && !"".equals(nickName) && cm.getClient(nickName) != null) {
        			cm.removeClient(nickName);
        		}
        	}
		}
        
        /**
         * 接收到了Cient的字节消息
         */
        @Override
        public void onMessage(ByteBuffer msg) {
//            try {
//				JSONObject metadata = Client.this.metadata;
//				
//				// 处理metadata中的target
//				Object obj = metadata.get("target");
//				String source = metadata.getString("source");
//				ClientManager clientManager = ClientManager.getInstance();
//				JSONArray targets = null;
//				if(obj instanceof String) {
//					targets = new JSONArray();
//					List<String> nickNames = clientManager.getNickNamesExceptNickName(source);
//					for(int i = 0 ; i < nickNames.size(); i++) {
//						targets.add(nickNames.get(i));
//					}
//				} else if(obj instanceof JSONArray) {
//					targets = (JSONArray) obj;
//				}
//				
//				
//				// 更新进度(self)
//				Client.this.send(null);
//				
//				// 向targets发送
//				// 原始数据
//				byte[] srcBytes = msg.array();
//				// 元数据
//				JSONObject metadataObj = new JSONObject();
//				byte[] metadataBytes = metadataObj.toJSONString().getBytes("utf-8");
//				
//				for(int i = 0 ; i < targets.size(); i++) {
//					String nickName = targets.getString(i);
//					Client tClient = clientManager.getClient(nickName);
//					if(tClient != null) {
//						tClient.sendBinary(srcBytes);	
//					}
//				}
//				
//			} catch (IOException e) {
//				e.printStackTrace();
//			}
            
        }
    }
    
    public static void main(String[] args) throws UnsupportedEncodingException {
//		JSONObject parseObject = JSONObject.parseObject("{\"a\":\"a\"}");
//		System.out.println(parseObject);
//    	SAXReader reader = new SAXReader();
//    	try {
//			Document doc = reader.read(new File("E:/java-library/apache-tomcat-websocket-example/ws/Message/src/com/playerljc/message/request.xml"));
//			Element root = doc.getRootElement();
//			
//			Node node = root.selectSingleNode("/servlets/servlet/servlet-name[text()='aaaaaa']");
//			Node selectSingleNode = node.getParent().selectSingleNode("//servlet-class");
//			System.out.println();
//			String className = node.getParent().selectSingleNode("//servlet-class").getStringValue();
			
//		} catch (DocumentException e) {
//			e.printStackTrace();
//		}
    	
//    	try {
//    		File file = new File("C:\\a.jpeg");
//			FileInputStream in = new FileInputStream(file);
//			byte [] bytes = new byte[(int) file.length()];
//			in.read(bytes);
//			String str = new String(bytes);
//			bytes = str.getBytes();
//			System.out.println(str);
//		} catch (FileNotFoundException e) {
//			e.printStackTrace();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
    	
	}
	
}
