#pragma strict

var environmentCube : GameObject;

function Start () {

}

function Update () {

}

function OnServerInitialized() {
	if(Network.isServer) {
		InvokeRepeating("BroadcastEnvironmentCubeState", 1.0, 10.0); // The clients are not likely to drift noticeably within 10 seconds of environmental simulation, so we can save badwidth this way.
	}
	else {
		Debug.Log("Environment Control: attempted to invoke repeating on BroadcastEnvironmentCubeState, but I'm not the server. Aborting.");
	}
}

function BroadcastEnvironmentCubeState () {
	if(Network.isServer) {
		// Debug.Log("Environment control: Synching environment as server.");
		networkView.RPC("SparseEnvironmentSync", RPCMode.Others, environmentCube.renderer.material.color.r, environmentCube.renderer.material.color.g, environmentCube.renderer.material.color.b, environmentCube.renderer.material.color.a);
	}
	else {
		Debug.Log("Environment Control: attempted to broadcast environment state, but I'm not the server. Aborting.");
	}
}

@RPC
function SparseEnvironmentSync (red : float, green : float, blue : float, alpha : float) {
	if(Network.isClient) {
		// Debug.Log("Environment control: Synching environment as client.");
	environmentCube.renderer.material.color = Vector4(red, green, blue, alpha);
	}
	else {
		Debug.Log("Environment Control: attempted to receive a sparse environment sync, but I'm not the client. Aborting.");
	}
}