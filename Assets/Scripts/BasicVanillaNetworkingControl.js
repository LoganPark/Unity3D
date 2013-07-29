#pragma downcast
public var spawnPoint : GameObject;
public var PlayersAvatar : GameObject;
public var EnvironmentControl : GameObject;

private var playerCount: int = 0;
private var version = "20130428";

private var networkLoggingVerbosity = 1;
private var showingConnectDialog : boolean = false;
private var remoteServerIP = "127.0.0.1";
private var remoteServerPort = "25000";
private var remoteServerPassword = "";

private var networkPanelVisible : boolean = false;
private var networkPanelButtonWidth = 128;
private var networkPanelButtonHeight = 24;
private var networkPanelButtonMargin = 12;
private var networkPanelWidth = Screen.width / 10 * 8;
private var networkPanelHeight = 400; //Screen.height / 4;
private var networkPanelHiddenRootX = Screen.width / 8;
private var networkPanelHiddenRootY = networkPanelHeight * -1 + (networkPanelButtonHeight + networkPanelButtonMargin * 2);
private var networkPanelVisibleRootX = Screen.width / 8;
private var networkPanelVisibleRootY = 24;
private var networkPanelVisibleCurrentX = Screen.width / 8;
private var networkPanelVisibleCurrentY = networkPanelHeight * -1 + (networkPanelButtonHeight + networkPanelButtonMargin * 2);
private var networkPanelLeftMargin = 16;
private var networkPanelTopMargin = 24;
private var networkPanelSlideSpeed = 10;

private var configureClientConnect : boolean = false;

private var networkModeIndex = 2;
private var oldNetworkModeIndex;
private var networkModeStrings : String[] = ["(S)erver", "(C)lient", "(O)ffline"];

private var connectionTestStatus = "Testing network connection capabilities.";
private var connectionTestMessage = "Test in progress";
private var shouldEnableNatMessage : String = "";
private var doneTestingNetworkConnection = false;
private var probingPublicIP = false;
private var connectionTestServerPort = 9999;
private var connectionTestResult = ConnectionTesterStatus.Undetermined;
private var connectionTestTimer : float;
private var connectionTestStatusScrollViewVector : Vector2 = Vector2.zero;
private var connectionTestStatusScrollViewText : String = "Connection Test...";

function Start () {
	networkLoggingVerbosity = 1;
	setNetworkLoggingVerbosity();

	// Store the network mode selector button state
	oldNetworkModeIndex = networkModeIndex;

	// For connection testing
	connectionTestTimer = Time.time;
}

function Update () {
	if(Input.GetKeyDown("n")) {
		networkPanelVisible = !networkPanelVisible;
	}

	if(networkPanelVisible) {
		if(Input.GetKeyDown("escape")) {
			networkPanelVisible = false;
		}

		if(Input.GetKeyDown("s") && networkPanelVisible) {
			networkModeIndex = 0;
			switchNetworkModes();
		}
		if(Input.GetKeyDown("c") && networkPanelVisible) {
			networkModeIndex = 1;
			switchNetworkModes();
		}
		if(Input.GetKeyDown("o") && networkPanelVisible) {
			networkModeIndex = 2;
			switchNetworkModes();
		}
	}

	if (doneTestingNetworkConnection == false) {
		TestConnection(false);
	}
}

function switchNetworkModes() {
	if(networkModeIndex != oldNetworkModeIndex) {
		oldNetworkModeIndex = networkModeIndex;
		shutdownNetworkInterface();

		if(networkModeIndex == 0) { // Start a server
			configureClientConnect = false;
			LaunchServer();
		} else if(networkModeIndex == 1) { // Join a server as a client
			// ConnectToServer(serverIDAddress, serverPort, outgoingPassword);
			configureClientConnect = true;

			Debug.Log("Network Control: Requesting fresh list of available servers.");
			RequestHostList();
		} else if(networkModeIndex == 2) { // Just play offline
			configureClientConnect = false;
			Debug.Log("Resetting the scene the easy way... (reloading the level)");
			Application.LoadLevel(Application.loadedLevel);
		}
	}
}

function RequestHostList() {
	Debug.Log("Requesting updated list of available Serrafina (v. " + version + ") games.");
	MasterServer.ClearHostList();
  MasterServer.RequestHostList("Serrafina" + version);
}

function OnMasterServerEvent(msEvent: MasterServerEvent) {
  if (msEvent == MasterServerEvent.RegistrationSucceeded) {
    Debug.Log("Network Control: Success: Your server's game is now registered and publically accessible.");
  }
  else if (msEvent == MasterServerEvent.RegistrationFailedNoServer ) {
    Debug.Log("Network Control: Error: Your server's game is NOT registered: no server is running.");
  }
  else if (msEvent == MasterServerEvent.RegistrationFailedGameName ) {
    Debug.Log("Network Control: Error: Your server's game is NOT registered: Can't register a server without a game name... Don't leave that field blank.");
  }
  else if (msEvent == MasterServerEvent.RegistrationFailedGameType ) {
    Debug.Log("Network Control: Error: Your server's game is NOT registered: Game Type not supplied.");
  }
  else if (msEvent == MasterServerEvent.HostListReceived ) {
    Debug.Log("Network Control: Host List update received.");
  }
}

function ConnectToServer(ip : String, port : int, outgoingPassword : String) {
	Debug.Log("Basic Vanilla Networking: Attempting to connect as a client to server: " + ip + ":" + port.ToString() + ", using password: " + outgoingPassword);
	Network.Connect(ip, port, outgoingPassword);
}

function LaunchServer () {
	Debug.Log("Launching multiplayer server...");

  Debug.Log("...Initializing network encryption: CRCs, AES, SynCookies, RSA.");
  Network.InitializeSecurity();


  var useNat = !Network.HavePublicAddress();
  if(useNat) {
  	Debug.Log("...Using NAT punchthrough via Unity's facilitator service.");
  }
	else {
		Debug.Log("...Not using NAT punchthrough since you seem to have a public IP address.");
	}

	Network.incomingPassword = "";
	if(Network.incomingPassword.Length > 0) {
  	Debug.Log("...Setting server password.");
  }
  else {
  	Debug.Log("...No server password set; allowing all viable incoming connections.");
  }

  Network.InitializeServer(32, 25000, useNat);
}

function OnServerInitialized() {

	var serverPlayersAvatar = Network.Instantiate(PlayersAvatar, spawnPoint.transform.position, spawnPoint.transform.rotation, 0); // AllBuffered: http://docs.unity3d.com/Documentation/ScriptReference/Network.Instantiate.html

	var cameraControlScript : SmoothFollowCamera = Camera.main.GetComponent("SmoothFollowCamera");
	cameraControlScript.target = serverPlayersAvatar.transform;

	Debug.Log("...Registering your local server with the master server so others can join easily.");
	MasterServer.updateRate = 15;
	MasterServer.RegisterHost("Serrafina" + version, "Logan's game", "This is the description for Logan's game.");

	Debug.Log("Network Control: Server initialized and ready.");
}

function OnConnectedToServer() { // Just got online as client
	Debug.Log("Network Control: Connected to server.");

	var localPlayersAvatar = Network.Instantiate(PlayersAvatar, spawnPoint.transform.position, spawnPoint.transform.rotation, 0); // AllBuffered: http://docs.unity3d.com/Documentation/ScriptReference/Network.Instantiate.html

	var cameraControlScript : SmoothFollowCamera = Camera.main.GetComponent("SmoothFollowCamera");
	cameraControlScript.target = localPlayersAvatar.transform;
}

function OnFailedToConnect(error: NetworkConnectionError) {
  Debug.Log("Network Control: Could not connect to server: "+ error);
}

function OnFailedToConnectToMasterServer(error : NetworkConnectionError) {
  Debug.Log("Problem connecting to master server to announce the game server's existence: "+ error);
}

function OnDisconnectedFromServer(info : NetworkDisconnection) {
	if (Network.isServer) {
		Debug.Log("Network Control: Local server connection disconnected.");
	}
	else {
		if (info == NetworkDisconnection.LostConnection) {
			Debug.Log("Network Control: Lost connection to the server (disconnection was not clean/graceful).  No reliable packets were able to roundtrip between the server and your client.");
		}
		else {
			Debug.Log("Network Control: Successfully/cleanly diconnected from the server");

			Debug.Log("Resetting the scene the easy way... (reloading the level)");
			Application.LoadLevel(Application.loadedLevel);
		}
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

	Debug.Log("Shutting down network interface completely.");
	Network.Disconnect(2000);
}

function OnPlayerConnected(player: NetworkPlayer) {
  Debug.Log("Player " + playerCount++ + " connected from " + player.ipAddress + ":" + player.port);

  Debug.Log("Network Controller: Sending initial environmental state to new client (and everybody else, because screw you).");
  var environmentController : basicVanillaEnvironmentController = EnvironmentControl.GetComponent("basicVanillaEnvironmentController");
  environmentController.BroadcastEnvironmentCubeState();
}

function OnPlayerDisconnected(player: NetworkPlayer) {
  Debug.Log("Network Control: Cleaning up after player " +  player);
  Network.RemoveRPCs(player);
  Network.DestroyPlayerObjects(player);
}

function setNetworkLoggingVerbosity() {
	if(networkLoggingVerbosity == 0) {
		Debug.Log("Network Control: ...Shutting off network logging.");
		Network.logLevel = NetworkLogLevel.Off;
	}
	else if(networkLoggingVerbosity == 1) {
		Debug.Log("Network Control: ...Setting network logging to informational only (e.g., connection events).");
		Network.logLevel = NetworkLogLevel.Informational;
	}
	else {
		Debug.Log("Network Control: ...Setting network logging to full blast. Get ready to drink from the firehose!");
		Network.logLevel = NetworkLogLevel.Full;
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

function OnGUI () {

	if(networkPanelVisible) { // Show the Network menu

		if(networkPanelVisibleCurrentY < networkPanelVisibleRootY) {
			networkPanelVisibleCurrentY += networkPanelSlideSpeed;
		}

		// Connection Test Display
		if(doneTestingNetworkConnection == false) {
			GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent ("Testing connection...", "Probing a remote server to assess your computer's connectivity (Network Address Translation, Firewall, Proxy Server)."));
		}
		else {
			if (GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent ("Retest connection", "Click to clear network connectivity test results and retry."))) {
				doneTestingNetworkConnection = false;
				TestConnection(true);
			}
		}

		connectionTestStatusScrollViewText = "Current Status: " + connectionTestStatus + "\nTest result : " + connectionTestMessage + shouldEnableNatMessage;

			// Begin the ScrollView
		connectionTestStatusScrollViewVector = GUI.BeginScrollView (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8), connectionTestStatusScrollViewVector, Rect (0, 0, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8));
		connectionTestStatusScrollViewText = GUI.TextArea (Rect (0, 0, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8), connectionTestStatusScrollViewText);
		GUI.EndScrollView();
		// End Connection Test Display

		var networkStatusString : String = "";

		if (Network.peerType == NetworkPeerType.Disconnected) {
			networkStatusString = "Status: Disconnected.";
		} else if(Network.peerType == NetworkPeerType.Server) {
			networkStatusString = "Status: Server.";
		}	else if(Network.peerType == NetworkPeerType.Client) {
			networkStatusString = "Status: Client.";
		}	else if(Network.peerType == NetworkPeerType.Connecting) {
			networkStatusString = "Status: Connecting...";
		} else {
			networkStatusString = "Status: Error/Unknown!";
		}
		GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent(networkStatusString));

		if(Network.isServer) {
			

			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("IP: " + Network.player.ipAddress, "This is your computer's current ip address; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("Port: " + Network.player.port, "This is your computer's current network port; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 2 + networkPanelButtonMargin * 2, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("GUID: " + Network.player.guid, "This is your computer's current guid; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 3 + networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("Index: " + Network.player.ToString(), "This is your computer's current guid; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 4 + networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight * 2), GUIContent("External IP: " + Network.player.externalIP, "This is your computer's current external IP address; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 6 + networkPanelButtonMargin * 6, networkPanelButtonWidth, networkPanelButtonHeight * 2), GUIContent("External Port: " + Network.player.externalPort, "This is your computer's current external port number; helpful for troubleshooting when you're trying to host a server."));

			for (var i : int = 0; i < Network.connections.Length; i++) {
		    GUI.Label(Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * i + networkPanelButtonMargin * i, networkPanelButtonWidth * 2, networkPanelButtonHeight),"Player " + Network.connections[i].ToString() + " ping: " + Network.GetLastPing(Network.connections[i]) + " / Avg: " +  Network.GetAveragePing(Network.connections[i]) + " ms");
		    if(GUI.Button(Rect(networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 5 + networkPanelButtonMargin * 5, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * i + networkPanelButtonMargin * i, networkPanelButtonWidth, networkPanelButtonHeight), "Kick")) {
					//networkView.RPC("AnnounceKickToPlayer", Network.connections[i]);
					Network.CloseConnection(Network.connections[i], true);
		    }
		  }
		}

		networkModeIndex = GUI.Toolbar (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight - networkPanelButtonMargin, networkPanelWidth - networkPanelLeftMargin * 2, networkPanelButtonHeight), networkModeIndex, networkModeStrings);

		if(GUI.changed)	{
			switchNetworkModes();
		}

		if(configureClientConnect) {

			//List-Selection Connection Interface
			var data : HostData[] = MasterServer.PollHostList();
			// Go through all the hosts in the host list
			for (var element in data)
			{
				GUILayout.BeginHorizontal();
				var name : String = element.gameName + " " + element.connectedPlayers + " / " + element.playerLimit;
				GUILayout.Label(name);
				GUILayout.Space(5);
				var hostInfo : String;
				hostInfo = "[";
				for (var host in element.ip) {
					hostInfo = hostInfo + host + ":" + element.port + " ";
				}
				hostInfo = hostInfo + "]";
				GUILayout.Label(hostInfo);
				GUILayout.Space(5);
				GUILayout.Label(element.comment);
				GUILayout.Space(5);
				GUILayout.FlexibleSpace();
				if (GUILayout.Button("Connect"))
				{
					// Connect to HostData struct, internally the correct method is used (GUID when using NAT).
					Network.Connect(element);
				}
				GUILayout.EndHorizontal();
			}

			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 5 - networkPanelButtonMargin * 5, networkPanelButtonWidth, networkPanelButtonHeight), "Server IP Address:");
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 4 - networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight), "Server port:");
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 3 - networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), "Server password:");
			remoteServerIP = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 5 - networkPanelButtonMargin * 5, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerIP, 15);
			remoteServerPort = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 4 - networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerPort, 6);
			remoteServerPassword = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 3 - networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerPassword, 256);

			if(GUI.Button(Rect(networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 2 - networkPanelButtonMargin * 2, networkPanelButtonWidth * 2 + networkPanelButtonMargin, networkPanelButtonHeight), GUIContent("Connect to this server", "Click this button to connect to the server you've specified in the setting above."))) {
				ConnectToServer(remoteServerIP, parseInt(remoteServerPort), remoteServerPassword);
			}
		}
	}
	else { // Hide the Network menu
		if(networkPanelVisibleCurrentY > networkPanelHiddenRootY) networkPanelVisibleCurrentY -= networkPanelSlideSpeed;
		//networkPanelVisibleCurrentY = Mathf.Lerp(networkPanelVisibleCurrentY, networkPanelHiddenRootY, networkPanelSlideSpeed * Time.smoothDeltaTime);
		//Debug.Log(networkPanelHiddenRootY.ToString());
		if(GUI.Button (Rect(networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight - networkPanelButtonMargin, networkPanelWidth - networkPanelLeftMargin * 2, networkPanelButtonHeight), GUIContent("(N)etwork / Server Administration" /* + networkPanelVisibleCurrentY.ToString() */, "Use these tools to run your PocketSpace as a publically accessible area."))) {
			networkPanelVisible = true;
		}
	}
	GUI.Box (Rect (networkPanelVisibleCurrentX, networkPanelVisibleCurrentY, networkPanelWidth, networkPanelHeight), "(N)etworking Menu");
}