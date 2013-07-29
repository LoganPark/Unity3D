#pragma strict
private var speed = 2.0;
var bulletPrefab : GameObject;
private var DesignControlScript : BasicVanillaDesignCameraControl;

function Start () {
	if(networkView.isMine) {
		Debug.Log("Local Input: NetworkView is mine, staying active.");
	}
	else {
		Debug.Log("Local Input: NetworkView isn't mine, shutting down.");
		this.enabled = false;
	}

	DesignControlScript = Camera.main.GetComponent("BasicVanillaDesignCameraControl");
}

function Update () {
	if(networkView.isMine && DesignControlScript.notCurrentlyDesigning) {
		transform.Translate(Input.GetAxis("Horizontal") * speed * Time.smoothDeltaTime, 0, Input.GetAxis("Vertical") * speed * Time.smoothDeltaTime);

		if(Input.GetKeyDown("space")) {
			var pos = transform.position + Vector3.forward * 2.0;
			networkView.RPC("fireBullet", RPCMode.All, networkView.viewID, pos, transform.rotation, rigidbody.velocity, rigidbody.angularVelocity);
		}
	}
}

@RPC
function fireBullet (shooterID : NetworkViewID, pos : Vector3, rot : Quaternion, vel : Vector3, angularVel : Vector3) {
	if(shooterID == networkView.viewID) {
		var bullet = Instantiate(bulletPrefab, pos, rot);
		bullet.rigidbody.velocity = vel;
		bullet.rigidbody.angularVelocity = angularVel;
		bullet.rigidbody.AddRelativeForce(Vector3.forward * 50);
		Physics.IgnoreCollision(bullet.collider, collider);
	}
}