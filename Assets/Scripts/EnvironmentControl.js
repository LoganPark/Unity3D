#pragma strict
var homeLight : Light;
var spawnPoint : GameObject;

function Start () {
	rezHomeLight();
	rezSpawnPoint();
}

function Update () {

}

@RPC
function rezHomeLight() {
	Instantiate(homeLight, transform.position, transform.rotation);
}

@RPC
function rezSpawnPoint() {
	Instantiate(spawnPoint, Vector3.zero, transform.rotation);
}