#pragma strict

function OnServerInitialized () {
	if(Network.isServer) {
		InvokeRepeating("ChangeToRandomColor", 0.1, 15.0);
	}
}

function ChangeToRandomColor() {
	renderer.material.color = Vector4(Random.Range(0.0, 1.0), Random.Range(0.0, 1.0), Random.Range(0.0, 1.0));
	// Debug.Log("EnvironmentCube: Changing to new random color: " + renderer.material.color.ToString());
}