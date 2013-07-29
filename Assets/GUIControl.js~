#pragma strict

public var customGUIStyle : GUIStyle;
public var networkController : GameObject;

private var networkPanelVisible : boolean = false;
private var networkPanelButtonWidth = 128;
private var networkPanelButtonHeight = 24;
private var networkPanelButtonMargin = 12;
private var networkPanelWidth = Screen.width / 4 * 3;
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
private var remoteServerIP : String = "1.1.1.1";
private var remoteServerPort : String = "25000";
private var remoteServerPassword : String = "";

public var networkModeIndex = 2;
private var oldNetworkModeIndex;
public var networkModeStrings : String[] = ["Server", "Client", "Offline"];
private var connectionTestStatusScrollViewVector : Vector2 = Vector2.zero;
private var connectionTestStatusScrollViewText : String = "Connection Test...";

function Start () {
	oldNetworkModeIndex = networkModeIndex;
}

function Update () {
	if(Input.GetKeyDown("n")) {
		networkPanelVisible = !networkPanelVisible;
	}

	if(Input.GetKeyDown("escape") && networkPanelVisible) {
		networkPanelVisible = false;
	}
}

function OnGUI () {
	if(networkPanelVisible) { // Show the Network menu
		if(networkPanelVisibleCurrentY < networkPanelVisibleRootY) networkPanelVisibleCurrentY += networkPanelSlideSpeed;

		// Connection Test Display
		var networkingControlScript : NetworkingControl = networkController.GetComponent(NetworkingControl);

		if(networkingControlScript.doneTestingNetworkConnection == false) {
			GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent ("Testing connection...", "Probing a remote server to assess your computer's connectivity (Network Address Translation, Firewall, Proxy Server)."));
		}
		else {
			if (GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent ("Retest connection", "Click to clear network connectivity test results and retry."))) {
				networkingControlScript.doneTestingNetworkConnection = false;
				networkingControlScript.TestConnection(true);
			}
		}

		connectionTestStatusScrollViewText = "Current Status: " + networkingControlScript.connectionTestStatus + "\nTest result : " + networkingControlScript.connectionTestMessage + networkingControlScript.shouldEnableNatMessage;

			// Begin the ScrollView
		connectionTestStatusScrollViewVector = GUI.BeginScrollView (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8), connectionTestStatusScrollViewVector, Rect (0, 0, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8));
		connectionTestStatusScrollViewText = GUI.TextArea (Rect (0, 0, networkPanelButtonWidth, (networkPanelButtonHeight + networkPanelButtonMargin) * 8), connectionTestStatusScrollViewText);
		GUI.EndScrollView();
		// End Connection Test Display

		//networkPanelVisibleCurrentY = Mathf.Lerp(networkPanelVisibleCurrentY, networkPanelVisibleRootY, networkPanelSlideSpeed * Time.smoothDeltaTime);
		//Debug.Log(networkPanelVisibleRootY.ToString());

		if (Network.peerType == NetworkPeerType.Disconnected) {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent("Status: Disconnected."));
		} else if(Network.peerType == NetworkPeerType.Server) {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent("Status: Online as server."));
		}	else if(Network.peerType == NetworkPeerType.Client) {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent("Status: Online as client."));
		}	else if(Network.peerType == NetworkPeerType.Connecting) {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent("Status: Connecting..."));
		} else {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight + networkPanelButtonHeight + networkPanelButtonMargin), GUIContent("Status: Unknown, error!"));
		}

		if(Network.isServer) {
			// GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("Yes", "This computer is currently acting as a server."));



			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("IP: " + Network.player.ipAddress, "This is your computer's current ip address; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("Port: " + Network.player.port, "This is your computer's current network port; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 2 + networkPanelButtonMargin * 2, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("GUID: " + Network.player.guid, "This is your computer's current guid; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 3 + networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent("Index: " + Network.player.ToString(), "This is your computer's current guid; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 4 + networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight * 2), GUIContent("External IP: " + Network.player.externalIP, "This is your computer's current external IP address; helpful for troubleshooting when you're trying to host a server."));
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth + networkPanelButtonMargin, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight * 6 + networkPanelButtonMargin * 6, networkPanelButtonWidth, networkPanelButtonHeight * 2), GUIContent("External Port: " + Network.player.externalPort, "This is your computer's current external port number; helpful for troubleshooting when you're trying to host a server."));

			if (GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth, networkPanelButtonHeight), GUIContent ("Kick Player 1", "Disconnects this person from your server immediately."))) {
				if (Network.connections.Length > 0) {
		      Debug.Log("Disconnecting: " + Network.connections[0].ipAddress + ":" + Network.connections[0].port);
		      Network.CloseConnection(Network.connections[0], true);
		    }
		    else {
					Debug.Log("There aren't any players to disconnect yet.");
		    }
			}
		}
		else {
			// GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("No", "This computer is not currently acting as a server."));
		}

		// GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2.5 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("Server"));

		if(Network.isClient) {
			// GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("Yes", "This computer is currently acting as a client."));
		}
		else {
			// GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("No", "This computer is not currently acting as a client."));
		}

		//GUI.Button (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2.5 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelTopMargin + networkPanelButtonHeight + networkPanelButtonMargin, networkPanelButtonWidth / 2, networkPanelButtonHeight), GUIContent ("Client"));

		networkModeIndex = GUI.Toolbar (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight - networkPanelButtonMargin, networkPanelWidth - networkPanelLeftMargin * 2, networkPanelButtonHeight), networkModeIndex, networkModeStrings);

		if(GUI.changed)	{
			if(networkModeIndex != oldNetworkModeIndex) {
				oldNetworkModeIndex = networkModeIndex;
				networkingControlScript.shutdownNetworkInterface();

				if(networkModeIndex == 0) { // Start a server
					configureClientConnect = false;
					networkingControlScript.LaunchServer();
				} else if(networkModeIndex == 1) { // Join a server as a client
					// networkingControlScript.ConnectToServer(serverIDAddress, serverPort, outgoingPassword);
					configureClientConnect = true;
				} else if(networkModeIndex == 2) { // Just play offline
					configureClientConnect = false;
				}
			}
		}

		if(configureClientConnect) {
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 5 - networkPanelButtonMargin * 5, networkPanelButtonWidth, networkPanelButtonHeight), "Server IP Address:");
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 4 - networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight), "Server port:");
			GUI.Label (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 3 - networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), "Server password:");
			remoteServerIP = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 5 - networkPanelButtonMargin * 5, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerIP, 15);
			remoteServerPort = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 4 - networkPanelButtonMargin * 4, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerPort, 6);
			remoteServerPassword = GUI.TextField (Rect (networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 3 + networkPanelButtonMargin * 3, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 3 - networkPanelButtonMargin * 3, networkPanelButtonWidth, networkPanelButtonHeight), remoteServerPassword, 256);

			if(GUI.Button(Rect(networkPanelVisibleCurrentX + networkPanelLeftMargin + networkPanelButtonWidth * 2 + networkPanelButtonMargin * 2, networkPanelVisibleCurrentY + networkPanelHeight - networkPanelButtonHeight * 2 - networkPanelButtonMargin * 2, networkPanelButtonWidth * 2 + networkPanelButtonMargin, networkPanelButtonHeight), GUIContent("Connect to this server", "Click this button to connect to the server you've specified in the setting above."))) {
				networkingControlScript.ConnectToServer(remoteServerIP, parseInt(remoteServerPort), remoteServerPassword);
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
