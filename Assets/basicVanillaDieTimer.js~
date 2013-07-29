#pragma strict
private var birthDate = 0.0;
private var lifespan = 3.0;

function Awake () {
	birthDate = Time.time;
}

function Update () {
	if(Time.time - birthDate > lifespan) {
		Destroy(gameObject);
	}
}