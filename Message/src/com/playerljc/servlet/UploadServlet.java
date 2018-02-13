package com.playerljc.servlet;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.alibaba.fastjson.JSONObject;

/**
 * Servlet implementation class UploadServlet
 */
@WebServlet("/servlet/UploadServlet")
public class UploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public UploadServlet() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
			
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 *      
	 */
	protected void doPost(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
		try {
			JSONObject formData = new JSONObject();
			
			ServletFileUpload upload = new ServletFileUpload(new DiskFileItemFactory());
			upload.setFileSizeMax(4 * 1024 * 1024);
			List<FileItem> items = upload.parseRequest(request);
			Iterator<FileItem> it = items.iterator();
			while (it.hasNext()) {
				FileItem item = it.next();
				if (item.isFormField()) {
					formData.put(item.getFieldName(), item.getString("UTF-8"));
				} else {
					
					upload.setHeaderEncoding("UTF-8");

					File dir = new File(String.format("%s%sTo%s", request.getRealPath("/") + "upload" + File.separator ,formData.get("source") , formData.get("target")));
					if(!dir.exists()) {
						dir.mkdir();
					}
					
					File uploadFile = new File(dir.getAbsolutePath() + File.separator + formData.getString("name"));
					if(!uploadFile.exists()) {
						uploadFile.createNewFile();
					} 
					
					RandomAccessFile raf = new RandomAccessFile(uploadFile, "rw");
					raf.seek(formData.getLongValue("start"));
					byte [] bytes = new byte[(int) (formData.getLongValue("end") - formData.getLongValue("start"))];
					InputStream in = item.getInputStream();
					in.read(bytes);
					raf.write(bytes);
					in.close();
					raf.close();
					
//					JSONObject responseObj = new JSONObject();
//					responseObj.put("loaded", formData.getLongValue("end"));
//					response.getWriter().write(JSONObject.toJSONString(responseObj));
//					response.getWriter().flush();
//					response.getWriter().close();
				}
			}
		} catch (FileUploadException e) {
			e.printStackTrace();
		}
	}
}
