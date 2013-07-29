#pragma strict

public var playerPrefab : Transform;
public var EnvironmentController : GameObject;


private var playerIndex : int = 1; //always at least one, with the server.
private var playerNetworkPlayerArray = new Array();
private var playerNameArray = new Array();
private var playerIsLocalArray = new Array();
private var playerTransformArray = new Array();
private var currentServerHealth = 100; // for practicing network.serialize
private var networkLoggingVerbosity = 1; //Informational: http://docs.unity3d.com/Documentation/ScriptReference/Network-logLevel.html
private var useNat : boolean;
private var serverPassword = "";

public var connectionTestStatus = "Testing network connection capabilities.";
public var connectionTestMessage = "Test in progress";
public var shouldEnableNatMessage : String = "";
public var doneTestingNetworkConnection = false;
public var probingPublicIP = false;
public var connectionTestServerPort = 9999;
public var connectionTestResult = ConnectionTesterStatus.Undetermined;
private var connectionTestTimer : float;

private var masterServerUniqueGameType : String = "Serrafina";
private var masterServerSerrafinaVersion : int = 20130419;

function Awake () {
	setNetworkLoggingVerbosity();
}

function Start () {
	connectionTestTimer = Time.time;
}

function Update () {
	if (doneTestingNetworkConnection == false) {
		TestConnection(false);
	}
}

function setNetworkLoggingVerbosity() {
	if(networkLoggingVerbosity == 0) {
		Debug.Log("...Shutting off network logging.");
		Network.logLevel = NetworkLogLevel.Off;
	}
	else if(networkLoggingVerbosity == 1) {
		Debug.Log("...Setting network logging to informational only (e.g., connection events).");
		Network.logLevel = NetworkLogLevel.Informational;
	}
	else {
		Debug.Log("...Setting network logging to full blast. Get ready to drink from the firehose!");
		Network.logLevel = NetworkLogLevel.Full;
	}
}

function LaunchServer () {
	Debug.Log("Launching multiplayer server...");
  Debug.Log("...Initializing network encryption: CRCs, AES, SynCookies, RSA.");
  Network.InitializeSecurity();

  if(!Network.HavePublicAddress()) {
  	Debug.Log("...Using NAT punchthrough via Unity's facilitator service.");
  }
	else {
		Debug.Log("...Not using NAT punchthrough since you seem to have a public IP address.");
	}

  if(serverPassword.Length > 0) {
  	Debug.Log("...Setting server password.");
  	Network.incomingPassword = serverPassword;
  }
  else {
  	Debug.Log("...No server password supplied, allowing all incoming connections.");
  }
  Network.InitializeServer(32, 25000, useNat);
}

function OnServerInitialized() {
	Debug.Log("...Registering your local server with the master server so others can join easily.");

  MasterServer.RegisterHost(masterServerUniqueGameType + masterServerSerrafinaVersion, "'s game", "l33t game for all");

	Debug.Log("...Your local server is now initialized.");

	Debug.Log("Now spawning the server's player avatar.");
	spawnLocalPlayer();

}

function spawnLocalPlayer() {
	if(Network.isServer) {
		Debug.Log("Networking Control: Spawning your server avatar.");
	}
	else if(Network.isClient) {
		Debug.Log("Networking Control: Spawning your client avatar.");
	}
	else {
		Debug.Log("Networking Control: Spawning your offline avatar.");
	}

	var spawnPoint : GameObject = GameObject.FindGameObjectWithTag("SpawnPoint");
	var spawnPosition = spawnPoint.transform.position;
	var spawnRotation = spawnPoint.transform.rotation;

	var netID : NetworkViewID = Network.AllocateViewID();
	var playerName = "RandomName" + Random.Range(0,999);


	// Register local player in the local player array
	addPlayer(Network.player, playerName/*PlayerPrefs.GetString("playerName")*/ );

	// Create the local player's avatar
	networkSpawn(spawnPosition, spawnRotation, netID, true, Network.player);

	// Register the player to remote players' sessions
	networkView.RPC("addPlayer", RPCMode.OthersBuffered, Network.player, playerName);

	// Spawn local player's avatar in remote players' sessions
	networkView.RPC("networkSpawn", RPCMode.OthersBuffered, spawnPosition, spawnRotation, netID, false, Network.player);
}

@RPC
function addPlayer(netPlayer : NetworkPlayer, playerName : String) { // Adds this new player to the arrays of player data
	if(playerIsInArray(netPlayer)) {
		Debug.Log("Error: NetworkingControl: This new player is already in the player arrays.");
		return;
	}

	Debug.Log("NetworkingControl: This new player is being added to the player arrays...");
	Debug.Log("...NetworkPlayer array done.");
	playerNetworkPlayerArray.Push(netPlayer);

	Debug.Log("...Name array done.");
	playerNameArray.Push(playerName);

	if(netPlayer == Network.player) {
		Debug.Log("...Local array done.");
		playerIsLocalArray.Push(true);
	}
}

function playerIsInArray(netplayerToCheck) {
	for(var networkPlayerArrayIndex = 0; networkPlayerArrayIndex < playerNetworkPlayerArray.length; networkPlayerArrayIndex++) {
		if(netplayerToCheck == playerNetworkPlayerArray[networkPlayerArrayIndex]) {
			return true;
		}
	}
	return false;
}

@RPC
function networkSpawn(netSpawnPosition : Vector3, netSpawnRotation : Quaternion, netSpawnID : NetworkViewID, IOwnThisAvatar : boolean, netSpawnPlayer : NetworkPlayer) {
	var newAvatar : Transform = Instantiate(playerPrefab, netSpawnPosition, netSpawnRotation);

	assignAvatarToPlayer(netSpawnPlayer, newAvatar);

	assignNetViewID(newAvatar.gameObject, netSpawnID);

	if(IOwnThisAvatar) {
		Debug.Log("NetworkingControl: IOwnThisAvatar: " + IOwnThisAvatar.ToString());
		var localAvatarRPCs : AvatarRPCs = newAvatar.gameObject.GetComponent("AvatarRPCs");
		localAvatarRPCs.SetPlayer(Network.player); // enables Update() on the local av's RPC script.
	}
}

function assignAvatarToPlayer(playerAssignee : NetworkPlayer, avatarToAssign : Transform) {
	if(!avatarToAssign) {
		Debug.Log("NetworkingControl: Error, the avatar assignment attempt failed because the intended avatar is NULL.");
		return;
	}
	else if(!playerIsInArray(playerAssignee)) {
		Debug.Log("NetworkingControl: Error, the networkPlayer needed for this avatar assignment isn't registered on this server.");
		return;
	}
	else {
		Debug.Log("...Avatar array done.");
		playerTransformArray.Push(avatarToAssign);
	}
}

function assignNetViewID(targetGameObject : GameObject, netID : NetworkViewID) {
	Debug.Log("NetworkingControl: Assigning networkID (" + netID.ToString() + ") to children objects of player's avatar, " + targetGameObject.name);
	var childNetworkViews : Component[];
	childNetworkViews = targetGameObject.GetComponentsInChildren(NetworkView);
	Debug.Log(childNetworkViews.Length.ToString() + " networkViews found on this avatar.");
	var k = 0;
	for(var networkViews : NetworkView in childNetworkViews) {
		k++;
		networkViews.viewID = netID;
		Debug.Log("NetworkingControl: Assigning networkView " + k.ToString() + ".");
	}
	Debug.Log("NetworkingControl: networkID assignments complete for this avatar.");
}

function OnPlayerConnected(newPlayer : NetworkPlayer) {
	// Do nothing, await client's initialization and request to instantiate.

	// Maybe RPC over environment data to begin setting up simulation while waiting for av intantiate
	/*
	playerIndex++;
	playerIPArray[playerIndex] = newPlayer.ipAddress;
	playerPortArray[playerIndex] = newPlayer.port;
	Debug.Log("Player " + playerIndex.ToString() + "connected from " + newPlayer.ipAddress + ":" + newPlayer.port);
	spawnLocalPlayer(newPlayer);
	*/
}

function ConnectToServer(ip : String, port : int, outgoingPassword : String) {
	Debug.Log("Attempting to connect as a client to server: " + ip + ":" + port.ToString() + ", using password: " + outgoingPassword);
	Network.Connect(ip, port, outgoingPassword);
}

function OnNetworkInstantiate(info : NetworkMessageInfo) { // with an authoritative master server setup, this event shouldn't ever actually fire unless we put in a network.instantiate somewhere by accident.
	Debug.Log("Object network.instantiated by " + info.sender + " at " + info.timestamp);
}

function OnConnectedToServer() {
	Debug.Log("Connected successfully as a client to the server.");

	Debug.Log("Spawning your local avatar.");
	spawnLocalPlayer();
}

function OnPlayerDisconnected(player : NetworkPlayer) { // Only runs on server
	Debug.Log("Cleaning up after disconnecting player: " + player);

	var playerStillExistsInArrays : boolean = false;
	var departingPlayerIndex : int = -1;

	for(var j : int; j < playerNetworkPlayerArray.length; j++) {
		if(player == playerNetworkPlayerArray[j]) {
			playerStillExistsInArrays = true;
			departingPlayerIndex = j;
			return;
		}
	}

	if(playerStillExistsInArrays) {
		Debug.Log("NetworkingControl: Removing player from arrays.");

		playerNetworkPlayerArray.RemoveAt(departingPlayerIndex);
		playerNameArray.RemoveAt(departingPlayerIndex);
		playerIsLocalArray.RemoveAt(departingPlayerIndex);
		playerTransformArray.RemoveAt(departingPlayerIndex);

		// Invoke Chat RPC to notify of departing player
	}
	else {
		Debug.Log("NetworkingControl: The disconnecting player doesn't appear in the arrays.");
	}

	networkView.RPC("removePlayer", RPCMode.All, player);
	
	// For an authoritative server,
	// the next destroys will not destroy anything since the players never
	// instantiated anything nor buffered RPCs. Buuuuuuuuuut, just in case we missed something...
	Network.RemoveRPCs(player);
	Network.DestroyPlayerObjects(player);
}

@RPC
function removePlayer(player : NetworkPlayer) {
	Network.RemoveRPCs(player);

	if(Network.isServer) {
		Network.DestroyPlayerObjects(player);
	}
}

function OnDisconnectedFromServer(info : NetworkDisconnection) {
	if(Network.isServer) {
		Debug.Log("The server's (i.e., your) connection is now dead.");
	}
	else {
		if(info == NetworkDisconnection.LostConnection) {
			Debug.Log("Uh oh, we lost our end of the connection to the server.");
		}
		else {
			Debug.Log("Successfully disconnected from the server");
			Debug.Log("Resetting the scene the easy way... (reloading the level)");
			Application.LoadLevel(Application.loadedLevel);
		}
	}
}

function OnFailedToConnect(error : NetworkConnectionError) {
	Debug.Log("Problem connecting to the server: " + error);
}

function OnFailedToConnectToMasterServer(error : NetworkConnectionError) {
  Debug.Log("Problem connecting to master server: "+ error);
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
	var serverHealth : int = 0;

	if(stream.isWriting) {
		serverHealth = currentServerHealth;
		stream.Serialize(serverHealth);
	} else {
		stream.Serialize(serverHealth);
		currentServerHealth = serverHealth;
	}
}

function TestConnection(guiForcing) {
	//Debug.Log("Network connection tesing isng IP: " + Network.connectionTesterIP);
	// Start/Poll the connection test, report the results in a label and
	// react to the results accordingly
	if(guiForcing) {
		connectionTestResult = Network.TestConnection(true);
	}
	else {
		//Debug.Log("Network connection tesing isng IP: " + Network.connectionTesterIP);
		connectionTestResult = Network.TestConnection(false);
	}

	switch (connectionTestResult) {
		case ConnectionTesterStatus.Error:
			connectionTestMessage = "Problem determining NAT capabilities";
			doneTestingNetworkConnection = true;
		break;
	
		case ConnectionTesterStatus.Undetermined:
			connectionTestMessage = "Undetermined NAT capabilities";
			doneTestingNetworkConnection = false;
		break;
	
		case ConnectionTesterStatus.PublicIPIsConnectable:
			connectionTestMessage = "Directly connectable public IP address.";
			useNat = false;
			doneTestingNetworkConnection = true;
		break;
	
		// This case is a bit special as we now need to check if we can
		// circumvent the blocking by using NAT punchthrough
		case ConnectionTesterStatus.PublicIPPortBlocked:
			connectionTestMessage = "Non-connectable public IP address (port " + connectionTestServerPort +" blocked), running a server is impossible.";
			useNat = false;
			// If no NAT punchthrough test has been performed on this public
			// IP, force a test
			if (!probingPublicIP) {
				connectionTestResult = Network.TestConnectionNAT();
				probingPublicIP = true;
				connectionTestStatus = "Testing if blocked public IP can be circumvented";
				connectionTestTimer = Time.time + 10;
			}
			// NAT punchthrough test was performed but we still get blocked
			else if (Time.time > connectionTestTimer) {
				probingPublicIP = false;         // reset
				useNat = true;
				doneTestingNetworkConnection = true;
			}
		break;

		case ConnectionTesterStatus.PublicIPNoServerStarted:
			connectionTestMessage = "Public IP address but server not initialized, "+ "it must be started to check server accessibility. Restart "+"connection test when ready.";
		break;
		  
		case ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted:
			connectionTestMessage = "Limited NAT punchthrough capabilities. Cannot "+
			"connect to all types of NAT servers. Running a server "+
			"is ill advised as not everyone can connect.";
			useNat = true;
			doneTestingNetworkConnection = true;
		break;
	
		case ConnectionTesterStatus.LimitedNATPunchthroughSymmetric:
			connectionTestMessage = "Limited NAT punchthrough capabilities. Cannot "+
			"connect to all types of NAT servers. Running a server "+
			"is ill advised as not everyone can connect.";
			useNat = true;
			doneTestingNetworkConnection = true;
		break;
		
		case ConnectionTesterStatus.NATpunchthroughAddressRestrictedCone:
		case ConnectionTesterStatus.NATpunchthroughFullCone:
			connectionTestMessage = "NAT punchthrough capable. Can connect to all "+
			"servers and receive connections from all clients. Enabling "+
			"NAT punchthrough functionality.";
			useNat = true;
			doneTestingNetworkConnection = true;
		break;
	
	default:
	connectionTestMessage = "Error in test routine, got " + connectionTestResult;
	}
	if (doneTestingNetworkConnection) {
	if (useNat)
	shouldEnableNatMessage = "When starting a server the NAT "+
	"punchthrough feature should be enabled (useNat parameter)";
	else
	shouldEnableNatMessage = "NAT punchthrough not needed";
	connectionTestStatus = "Done testing";
	}
}

function shutdownNetworkInterface() {
	if(Network.isServer) {
		//Notify all clients to log off gracefully.
		for(var i = 0; i < Network.connections.Length; i++) {
			Debug.Log("Disconnecting from: "+ Network.connections[i].ipAddress+":"+Network.connections[i].port);
			Network.CloseConnection(Network.connections[i], true);
		}
		Debug.Log(Network.connections.Length.ToString() + " connections remain.");
		Debug.Log("Unregistering server session from master server.");
		MasterServer.UnregisterHost();
	}
	else if(Network.isClient) {
		Debug.Log("Disconnecting from server: "+ Network.connections[0].ipAddress+":"+Network.connections[0].port);
		Debug.Log(Network.connections.Length.ToString() + " connections remain.");
    Network.CloseConnection(Network.connections[0], true);
	}
	else if (Network.connections.Length == 0) {
		Debug.Log("No one is connected, but shutting down network connection anyway.");
	}

	Debug.Log("Shutting down network interface.");
	Network.Disconnect(5000);
}

function OnGUI() {	// This is handled elsewhere by GUIControl.js.

}