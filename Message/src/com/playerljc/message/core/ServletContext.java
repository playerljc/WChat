package com.playerljc.message.core;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.dom4j.Node;

/**
 * 业务对象管理
 * @author playerljc
 *
 */
public class ServletContext {
	
	private ConcurrentHashMap<String,IServlet> servlets = new ConcurrentHashMap<String,IServlet>();  
	
	private static ServletContext instance;
	
	private ServletContext() {
		// 初始化所有的servlet
		try {
			List servletConfigs = ServletConfig.getInstance().queryList("//servlet");
			for(int i = 0 ; i < servletConfigs.size(); i++) {
				Node servletConfig = (Node) servletConfigs.get(i);
				String className = servletConfig.selectSingleNode("servlet-class").getStringValue();
				String beanId = servletConfig.selectSingleNode("servlet-name").getStringValue();
				IServlet servlet = createServlet(className);
				servlets.put(beanId, servlet);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static ServletContext getInstance() {
		if(instance == null) {
			instance = new ServletContext();
		}
		return instance;
	}
	
	
	public IServlet getServlet(String beanId) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
		return servlets.get(beanId);
	}

	private IServlet createServlet(String className) throws ClassNotFoundException, InstantiationException, IllegalAccessException {
		Class<?> forName = Class.forName(className);
		IServlet newInstance = (IServlet) forName.newInstance();
		return newInstance;
	}
}
