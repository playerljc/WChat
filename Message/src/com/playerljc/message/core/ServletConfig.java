package com.playerljc.message.core;

import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;

/**
 * 业务配置解析
 * @author playerljc
 *
 */
public class ServletConfig {

	private static ServletConfig instance = new ServletConfig();
	private Document doc;
	private Element root;

	private ServletConfig() {
		SAXReader reader = new SAXReader();
		try {
			doc = reader.read(this.getClass().getResourceAsStream("request.xml"));
			root = doc.getRootElement();
		} catch (DocumentException e) {
			e.printStackTrace();
		}
	}

	public static ServletConfig getInstance() {
		return instance;
	}
	
	/**
	 * 通过业务名称获取实现的class全路径
	 * @param name
	 * @return
	 */
	public String getClassName(String name) {
		String className = "";
		Node servletNameNode = root.selectSingleNode(String.format("/servlets/servlet/servlet-name[text()='%s']",name));
		className = servletNameNode.getParent().selectSingleNode("servlet-class").getStringValue();
		return className;
	}
	
	public List queryList(String xpath) {
		return root.selectNodes(xpath);
	}
	
	public Node querySingleNode(String xpath) {
		 return root.selectSingleNode(xpath);
	}
	
}
