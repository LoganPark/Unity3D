#pragma strict
private var helpIsVisible : boolean = false;

private var helpDrawerMargin : float = 18.0;
private var helpDrawerWidth : float = 200.0;
private var helpDrawerCurrentX : float = Screen.width - helpDrawerMargin;
private var helpDrawerExtendedX : float = Screen.width - helpDrawerMargin - helpDrawerWidth;
private var helpDrawerY : float = helpDrawerMargin;
private var helpDrawerHeight : float = Screen.height - 2.0 * helpDrawerMargin;

function Update () {
	if(Input.GetKeyDown("h")) {
		helpIsVisible = !helpIsVisible;
		resizeHelpDrawer();
	}
}

function OnGUI() {
	if(helpIsVisible) {
		GUI.Box(Rect(helpDrawerCurrentX, helpDrawerY, helpDrawerWidth, helpDrawerHeight), "Help!");
	}
}

function resizeHelpDrawer() {

}

