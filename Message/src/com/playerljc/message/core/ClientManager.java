package com.playerljc.message.core;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 客户端管理
 * @author playerljc
 *
 */
public class ClientManager {

	private Map<String, Client> clients = new HashMap<String, Client>();

	private static ClientManager instance = new ClientManager();

	private ClientManager() {

	}

	public static ClientManager getInstance() {
		return instance;
	}

	public synchronized Client addClient(String nickName, Client client) {
		return clients.put(nickName, client);
	}

	public synchronized Client removeClient(String nickName) {
		return clients.remove(nickName);
	}

	public synchronized boolean containerClient(String nickName) {
		return clients.containsKey(nickName);
	}
	
	public synchronized Client getClient(String nickName) {
		return clients.get(nickName);
	}
	
	public synchronized int getSize() {
		return clients.size();
	}
	
	public synchronized List<String> getNickNames() {
		List<String> nickNames = new ArrayList<String>();
		Collection<Client> values = clients.values();
		Iterator<Client> it = values.iterator();
		Client client = null;
		while(it.hasNext()) {
			client = it.next();
			nickNames.add(client.getNickName());
		}
		
		return nickNames;
	}
	
	public synchronized List<String> getNickNamesExceptNickName(String nickName) {
		List<String> nickNames = getNickNames();
		nickNames.remove(nickName);
		return nickNames;
	}
}
