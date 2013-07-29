/*  This file is part of the "Ultimate Unity networking project" by M2H (http://www.M2H.nl)
 *  This project is available on the Unity Store. You are only allowed to use these
 *  resources if you've bought them from the Unity Assets Store.
 */
#pragma strict


public var usingChat : boolean = false;	//Can be used to determine if we need to stop player movement since we're chatting
var skin : GUISkin;						//Skin
var showChat : boolean= false;			//Show/Hide the chat
public static var scriptName : chatControl;

//Private vars used by the script
private var inputField : String= "";

private var scrollPosition : Vector2;
private var width : int= 500;
private var height : int= 180;
private var playerName : String;
private var lastUnfocusTime : float =0;
private var chatWindow : Rect;
	
//Server-only playerlist
private var playerList = new ArrayList();
class PlayerNode {
	var playerName : String;
	var networkPlayer : NetworkPlayer;
}

private var chatEntries = new ArrayList();
class ChatEntry
{
	var name : String= "";
	var text : String= "";	
}

function Awake(){
	chatWindow = Rect(Screen.width / 2 - width / 2, Screen.height - height + 5, width, height);
	scriptName = this;
	
	//We get the name from the masterserver example, if you entered your name there ;).
	playerName = PlayerPrefs.GetString("playerName", "");
	if(!playerName || playerName==""){
		playerName = "RandomName"+Random.Range(1,999);
	}	
	
}


//Client function
function OnConnectedToServer() {
	ShowChatWindow();
	networkView.RPC ("TellServerOurName", RPCMode.Server, playerName);
	// //We could also announce ourselves:
	// addGameChatMessage(playerName" joined the chat");
	// //But using "TellServer.." we build a list of active players which we can use for other stuff as well.
}

//Server function
function OnServerInitialized() {
	ShowChatWindow();
	//I wish Unity supported sending an RPC on the server to the server itself :(
	// If so; we could use the same line as in "OnConnectedToServer();"
	var newEntry : PlayerNode = new PlayerNode();
	newEntry.playerName=playerName;
	newEntry.networkPlayer=Network.player;
	playerList.Add(newEntry);	
	addGameChatMessage(playerName+" joined the chat");
}

//A handy wrapper function to get the PlayerNode by networkplayer
function GetPlayerNode(networkPlayer : NetworkPlayer){
	for(var entry  in  playerList){
		if((entry as PlayerNode).networkPlayer==networkPlayer){
			return entry;
		}
	}
	Debug.LogError("GetPlayerNode: Requested a playernode of non-existing player!");
	return null;
}


//Server function
function OnPlayerDisconnected(player: NetworkPlayer) {
	addGameChatMessage("Player disconnected from: " + player.ipAddress+":" + player.port);
	
	//Remove player from the server list
	playerList.Remove( GetPlayerNode(player) );
}

function OnDisconnectedFromServer(){
	CloseChatWindow();
}

//Server function
function OnPlayerConnected(player: NetworkPlayer) {
	addGameChatMessage("Player connected from: " + player.ipAddress +":" + player.port);
}

@RPC
//Sent by newly connected clients, recieved by server
function TellServerOurName(name : String, info : NetworkMessageInfo){
	var newEntry : PlayerNode = new PlayerNode();
	newEntry.playerName=name;
	newEntry.networkPlayer=info.sender;
	playerList.Add(newEntry);
	
	addGameChatMessage(name+" joined the chat");
}




function CloseChatWindow ()
{
	showChat = false;
	inputField = "";
	chatEntries = new ArrayList();
}

function ShowChatWindow ()
{
	showChat = true;
	inputField = "";
	chatEntries = new ArrayList();
}

function OnGUI ()
{
	if(!showChat){
		return;
	}
	
	GUI.skin = skin;		
			
	if (Event.current.type == EventType.keyDown && Event.current.character == "\n" && inputField.Length <= 0)
	{
		if(lastUnfocusTime+0.25<Time.time){
			usingChat=true;
			GUI.FocusWindow(5);
			GUI.FocusControl("Chat input field");
		}
	}
	
	chatWindow = GUI.Window (5, chatWindow, GlobalChatWindow, "");
	GUI.SetNextControlName(""); 
}


function GlobalChatWindow (id : int) {
	
	GUILayout.BeginVertical();
	GUILayout.Space(10);
	GUILayout.EndVertical();
	
	// Begin a scroll view. All rects are calculated automatically - 
    // it will use up any available screen space and make sure contents flow correctly.
    // This is kept small with the last two parameters to force scrollbars to appear.
	scrollPosition = GUILayout.BeginScrollView (scrollPosition);

	for (var entry  in chatEntries)
	{
		GUILayout.BeginHorizontal();
		if((entry as ChatEntry).name==""){//Game message
			GUILayout.Label ((entry as ChatEntry).text);
		}else{
			GUILayout.Label ((entry as ChatEntry).name+": "+(entry as ChatEntry).text);
		}
		GUILayout.EndHorizontal();
		GUILayout.Space(3);
		
	}
	// End the scrollview we began above.
    GUILayout.EndScrollView ();
	
	if (Event.current.type == EventType.keyDown && Event.current.character == "\n" && inputField.Length > 0)
	{
		HitEnter(inputField);
	}
	GUI.SetNextControlName("Chat input field");
	inputField = GUILayout.TextField(inputField);
	
	
	if(Input.GetKeyDown("mouse 0")){
		if(usingChat){
			Debug.Log("ChatControl: defocusing chat due to mouse input.");
			usingChat=false;
			GUI.UnfocusWindow ();//Deselect chat
			lastUnfocusTime=Time.time;
		}
	}
}

function HitEnter(msg : String){
	 GUI.FocusControl(""); 
	 msg = msg.Replace("\n", "");
	networkView.RPC("ApplyGlobalChatText", RPCMode.All, playerName, msg);
	inputField = ""; //Clear line
	GUI.UnfocusWindow ();//Deselect chat
	lastUnfocusTime=Time.time;
	usingChat=false;
}


@RPC
function ApplyGlobalChatText (name : String, msg : String)
{
	var entry = new ChatEntry();
	entry.name = name;
	entry.text = msg;

	chatEntries.Add(entry);
	
	//Remove old entries
	if (chatEntries.Count > 4){
		chatEntries.RemoveAt(0);
	}

	scrollPosition.y = 1000000;	
}

//Add game messages etc
function addGameChatMessage(str : String){
	ApplyGlobalChatText("", str);
	if(Network.connections.length>0){
		networkView.RPC("ApplyGlobalChatText", RPCMode.Others, "", str);	
	}	
}