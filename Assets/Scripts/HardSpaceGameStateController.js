#pragma strict

public var LocalPlayerState : int = 0; /* What is the player doing?
													|	0 --> roaming, playing, building, etc.
													|	1 --> designing self
													|	2 --> in blocking menus, options, settings, present but not playing
													*/
													
public var starPrefab : GameObject;
public var starSpawnRadius : float = 1000.0;

function Start () {
	
	Network.incomingPassword = "HolyMoly";
	var useNat = !Network.HavePublicAddress();
	Network.InitializeServer(32, 25000, useNat);
	
	for(var i = 0; i < 5; i++) {
		networkView.RPC("SpawnSingleStar", RPCMode.AllBuffered);
	}
}

function Update () {

}

@RPC
function  SpawnSingleStar() {
	Debug.Log("Spawning a star in random location");
	var starLocation  = Random.insideUnitSphere * starSpawnRadius;
	var StarClone : GameObject;
	StarClone = Instantiate(starPrefab, starLocation, Quaternion.identity);
	var StarCloneLight : Light = StarClone.GetComponent(Light);
	StarCloneLight.range = Random.Range(500, 2000);
	StarCloneLight.color = Color(Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0));
	StarCloneLight.intensity = Random.Range(0.0, 8.0);
}