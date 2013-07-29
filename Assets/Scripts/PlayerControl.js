#pragma strict

// Instantiation Variables
var playerPrefab : GameObject;
var mainCamera : Camera;
var playerClone: String;
var Player : GameObject;

// Geometry Variables
var rocketRezzer : Transform;

// Weapon Variables
var dumbfireRocket : Rigidbody;

// Movement Variables


// Customization Variables
var networkIDNumber: String;
var OneTime = 0;
var renderCustomizeWindow : boolean  = false;
var customizeWindowRect : Rect = Rect (20, 20, 320, 270);
var customizeWindowIsHidden= true;
var addTextureBodyI="serrafina.shadowmecha.org/textures/1.jpg";
var addTextureHeadI="serrafina.shadowmecha.org/textures/2.jpg";
var addTextureHairI="serrafina.shadowmecha.org/textures/3.jpg";
var addTextureBody=" ";
var addTextureHead =" ";
var addTextureHair =" ";
var customizerButtonTitle="Avatar - Open/Change";

function Start () {

}

function OnLoaded() {

	// Create the local player's avatar
	Network.Instantiate(playerPrefab, transform.position, transform.rotation, 0);
	playerClone =  "playerPrefab(Clone)" ;
	Player = GameObject.Find(playerClone);
	rocketRezzer = Player.transform.Find("rocketRezzer");

	// Customize the local player's avatar
	Debug.Log("Player (ID " + Player.networkView.viewID.ToString().Remove(0,13) + ") rezzed.");
	networkIDNumber = Player.networkView.viewID.ToString().Remove(0,13);
 	if(Player.networkView.isMine) {
		Player.networkView.RPC("Change",RPCMode.AllBuffered,  networkIDNumber);
 	}

	// Allocate the camera
	var cameraClone = Instantiate(mainCamera, transform.position, Quaternion.identity);
	var cameraControlScript : SmoothFollowCamera = cameraClone.GetComponent(SmoothFollowCamera);
	cameraControlScript.target = Player.transform;

	// Launch the tile engine
	var tileControlScript : tileEngine = Player.GetComponent(tileEngine);
	if(Player.networkView.isMine) {

		tileControlScript.enabled = true;
		tileControlScript.localStartup();
	}
	else {
		tileControlScript.localShutdown();
		tileControlScript.enabled = false;
	}
}

function Update () {
	if(!Player) return;

// Movement
	if(Player.networkView.isMine) {

	}
}

function OnPlayerDisconnected (player : NetworkPlayer) {
	Network.RemoveRPCs(player, 0);
	Network.DestroyPlayerObjects(player);
}


function OnGUI() {
	if(!Player) return;
 	GUI.depth = 1; //layer under 0
 	if(OneTime == 0 /* && Player.networkView.isMine */) {
  	if (GUI.Button(new Rect(10, Screen.height-30, 135, 20), customizerButtonTitle)) {
   		if (customizeWindowIsHidden == true){
     		showWindow();
     		customizeWindowIsHidden = false;
   		}
  		else {
    		hideWindow();
    		customizeWindowIsHidden = true;
    		Load();
    		OneTime=1;
   		}
  	}
 	}

 	if(renderCustomizeWindow) {
  	customizeWindowRect = GUI.Window (1, customizeWindowRect, renderCustomizationWindow, "Redefine and close the window");
 	}
}

// Custom Functions
function showWindow(){
 renderCustomizeWindow = true;
}

function  hideWindow(){
 renderCustomizeWindow = false;
}

function renderCustomizationWindow (windowID : int) {
	GUI.DragWindow (Rect (0,0, 120, 20)); // drag area
	GUI.Label(new Rect(10,40,400,20),"Body: texture address");
	addTextureBodyI = GUI.TextField(new Rect(10,80,300,20),addTextureBodyI);
	GUI.Label(new Rect(10,120,400,20),"Head: texture address");
	addTextureHeadI = GUI.TextField(new Rect(10,160,300,20),addTextureHeadI);
	GUI.Label(new Rect(10,190,400,20),"Hair: texture address");
	addTextureHairI = GUI.TextField(new Rect(10,220,300,20),addTextureHairI );
}

function Load() {
 	addTextureBody = addTextureBodyI;
 	addTextureHead = addTextureHeadI;
 	addTextureHair = addTextureHairI;
 	if(Player.networkView.isMine) {
  	Player.networkView.RPC("retextureAvFromWeb", RPCMode.AllBuffered, networkIDNumber, addTextureBody);
  	Debug.Log("PlayerControl: Initiating web-retexture from: " + addTextureBody);
	}
}

// RPC Remote Procedure Call Functions
@RPC
function fireRocket(rocketViewID : NetworkViewID, rocketLocation : Vector3, rocketOrientation : Quaternion) {
	var dumbfiredRocket = Instantiate(dumbfireRocket, rocketLocation, rocketOrientation) as Rigidbody;
	var nView : NetworkView;
	nView = dumbfiredRocket.GetComponent(NetworkView);
	nView.viewID = rocketViewID;
	dumbfiredRocket.velocity = rocketRezzer.TransformDirection (Vector3.forward * 10);
}


@RPC
function Change(avatarNetworkID:String) {
	if(gameObject.networkView.viewID.ToString().Remove(0,13) == avatarNetworkID) {
		var gos= GetComponentsInChildren(Transform);
		for (go in gos) {
			if(go.tag == "PlayerCanRetexture") {
				go.name = go.name + avatarNetworkID;
			}
		}
		var renderers : Renderer[] = GetComponentsInChildren(Renderer);
		for (var r : Renderer in renderers) {
			for (var m : Material in r.materials) {
				m.name = m.name + avatarNetworkID;
			}
		}
	}
}

@RPC
function retextureAvFromWeb(avatarNetworkID : String, textureURL : String ) {
	Debug.Log("retextureAvatar: Checking to see if we can web-retexture Avatar #" + avatarNetworkID.ToString());
	if(gameObject.networkView.viewID.ToString().Remove(0,13) == avatarNetworkID) {
		Debug.Log("retextureAvatar: Attempting to download texture from " + textureURL);
		//texture body
		var avatarGameObject = GameObject.Find("playerPrefab" + avatarNetworkID);
		Debug.Log("retextureAvatar: target av is " + "playerPrefab" + avatarNetworkID);
		var urlTT = textureURL;
		var textureDownloadRequest = WWW(urlTT);
		yield textureDownloadRequest;
		avatarGameObject.renderer.materials[0].mainTexture = textureDownloadRequest.texture;
	}
}