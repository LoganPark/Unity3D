#pragma strict

public var rocketsList = new Array();
public var rocketLifetime : float = 10.0;
public var checkInterval : float = 0.2;
private var lastCheck : float = Time.time;
private var rocketName = "Rocket(Clone)";
//private var i;

function Start () {
	if(Network.isClient) {
		Debug.Log("Munition control: We are not the server, shutting this script down to conserve compute cycles.");
		this.enabled = false;
	}
	else {
		lastCheck = Time.time;
		InvokeRepeating("check", checkInterval, checkInterval);
		acquireExistingMunitions(rocketName);
	}
}

function acquireExistingMunitions(munitionName) { //For when a client switches to server mode mid-game.
	var GOS : float[ ];
	//sGOS = GameObject.FindGameObjectsWithTag("") //Dump existing ones into an array
	// Parse each object's name into its age
	// Add each age to the appropriate munition array for periodic checking.
}

function check() {
	/*
	var i = 0;
	for(i = 0; i < rocketsList.length; i++) {
		if(rocketsList[i] < Time.time - rocketLifetime) {
			destroyMunition("Rocket(Clone)", i);
		}
	}
	*/
}

function destroyMunition(munitionType, id) {
	Debug.Log("Munition Controller: destroying a " + munitionType);
	//var munitionToDestroy = GameObject.Find(munitionType + i);
	//Network.Destroy(munitionToDestroy);
	//Network.RemoveRPC();
}