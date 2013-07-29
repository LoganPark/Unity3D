#pragma strict

public var owner : NetworkPlayer;
var mainCamera : Camera;

//Last input value, we're saving this to be able to save network messages/bandwidth.
private var lastClientHInput : float=0;
private var lastClientVInput : float=0;

//The input values the server will execute on this object
private var serverCurrentHInput : float = 0;
private var serverCurrentVInput : float = 0;

// Geometry Variables
var rocketRezzer : Transform;

// Weapon Variables
var dumbfireRocket : Rigidbody;

function Awake(){
	if(/*GameObject.FindWithTag("Player") && */ networkView.isMine /* networkView.owner == Network.player*/) {
		//Debug.Log("AvatarRPCs: Passed client check, instantiating main camera.");
		//var mainCameraClone = Instantiate(mainCamera, transform.position, transform.rotation);
		var cameraController : SmoothFollowCamera = Camera.main.GetComponent(SmoothFollowCamera);
		cameraController.target = transform;
	}


	if (Network.isClient) {

		// We are probably not the owner of this object: disable this script.
	    // RPC's and OnSerializeNetworkView will STILL get trough!
	    // The server ALWAYS run this script though
	    Debug.Log("AvatarRPCs: Disabling self because you're running as a client.");
	    enabled=false;	 // disable this script (this disables Update());
	}
}

function Start () {
	rocketRezzer = transform.Find("rocketRezzer");
}

function Update(){
	//Client code
	if(owner != null && Network.player == owner){
		//Only the client that owns this object executes this code
		var HInput : float = Input.GetAxis("Horizontal");
		var VInput : float = Input.GetAxis("Vertical");

		//Is our input different? Do we need to update the server?
		if(lastClientHInput!=HInput || lastClientVInput!=VInput ){
			lastClientHInput = HInput;
			lastClientVInput = VInput;

			if(Network.isServer){
				//Too bad a server can't send an rpc to itself using "RPCMode.Server"!
				//This is a Unity "feature", see `Tips`
				SendMovementInput(HInput, VInput);
			}else if(Network.isClient){
				//SendMovementInput(HInput, VInput); //Use this (and line 64) for simple "prediction"
				networkView.RPC("SendMovementInput", RPCMode.Server, HInput, VInput);
			}
		}
	}

	//Server movement code
	if(Network.isServer){//To also enable this on the client itself, use: "|| Network.player==owner){|"
		//Actually move the player using his/her input
		var moveDirection : Vector3 = new Vector3(serverCurrentHInput, 0, serverCurrentVInput);
		var speed : float = 5;
		transform.Translate(speed * moveDirection * Time.deltaTime);
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

/*  This file is part of the "Ultimate Unity networking project" by M2H (http://www.M2H.nl)
 *  This project is available on the Unity Store. You are only allowed to use these
 *  resources if you've bought them from the Unity Assets Store.
 */


@RPC
function SetPlayer(player : NetworkPlayer) {
	owner = player;
	if(player == Network.player) {
		//Hey thats us! We can control this player: enable this script (this enables Update());
		enabled=true;
	}
}


@RPC
function SendMovementInput(HInput : float, VInput : float){	
	//Called on the server
	serverCurrentHInput = HInput;
	serverCurrentVInput = VInput;
}


function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	if (stream.isWriting){
		//This is executed on the owner of the networkview
		//The owner sends it's position over the network
		
		var pos : Vector3 = transform.position;		
		stream.Serialize(pos);//"Encode" it, and send it
				
	}
	else {
		//Executed on all non-owners
		//receive a position and set the object to it
		
		var posReceive : Vector3 = Vector3.zero;
		stream.Serialize(posReceive); //"Decode" it and receive it
		
		//We've just recieved the current servers position of this object in 'posReceive'.
		
		transform.position = posReceive;		
		//To reduce laggy movement a bit you could comment the line above and use position lerping below instead:	
		//transform.position = Vector3.Lerp(transform.position, posReceive, 0.9); //"lerp" to the posReceive by 90%
		//It would be even better to save the last received server position and lerp to it in Update because it is executed more often than OnSerializeNetworkView
		
	}
}