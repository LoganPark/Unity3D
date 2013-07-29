#pragma strict
public var networkControl : GameObject;



function Start () {

}

function Update () {

}

function OnGUI () {
	GUI.Button (Rect ((Screen.width / 2) - 10, (Screen.height / 2) - 5,20,10), "");
	GUI.Button (Rect ((Screen.width / 2) - 5, (Screen.height / 2) - 10,10,20), "");
}
