#pragma downcast

private var showingChatInputBox : boolean = false;
private var maxChatStringsArrayLength = 4;
private var chatInputBoxHeight = 24;
private var chatInputBoxContent = "";
private var chatStringsArray = new Array();
private var chatTimesArray = new Array();
private var chatFadeDelay = 10;
private var chatString = "";

function Start () {
	// Read in chat preferences from player prefs or server account
	for(var i = 0; i < maxChatStringsArrayLength; i++) {
		//Debug.Log("Adding " + i.ToString() + " to chat buffer.");
		chatTimesArray.Push(Time.time);
		chatStringsArray.Push(" ");
	}

}

function Update () {
	if(Input.GetKeyDown("t")) {
		showingChatInputBox = !showingChatInputBox;
	}
}

function OnGUI () {
	if (Event.current.type == EventType.KeyDown && Event.current.character == '\n') {
		networkView.RPC("ReceiveChatInput", RPCMode.All, chatInputBoxContent);
		chatInputBoxContent = "";
	}

	if(showingChatInputBox) {
		chatInputBoxContent = GUI.TextField( Rect (Screen.width / 10, Screen.height - chatInputBoxHeight * 1.5, Screen.width * 0.8, chatInputBoxHeight), chatInputBoxContent);
	}

	GUI.Label (Rect (Screen.width / 10, Screen.height - chatInputBoxHeight * 4.5, Screen.width * 0.8, chatInputBoxHeight * 3), chatString);
}

@RPC
function ReceiveChatInput(receivedChatString : String) {
	if(chatStringsArray.length >= maxChatStringsArrayLength) {
		//Debug.Log("Removing: '" + chatStringsArray[0] + "' from chat buffer.");
		chatStringsArray.Shift();
		chatTimesArray.Shift();
	}

	//Debug.Log("Adding '" + receivedChatString + "' to chat buffer.");
	chatStringsArray.Push(receivedChatString);

	//Debug.Log("Removing: '" + chatTimesArray[0] + "' from chat timer.");
	chatTimesArray.Push(Time.time);

	chatString = "";
	for(var i = 0; i < chatStringsArray.length; i++) {
		Debug.Log("Adding " + chatStringsArray[i] + " to chat buffer.");
		chatString += chatStringsArray[i];
		chatString += "\n";
	}
	//Debug.Log("chat buffer: " + chatString + "\nBuffer size: " + chatStringsArray.length.ToString());
}