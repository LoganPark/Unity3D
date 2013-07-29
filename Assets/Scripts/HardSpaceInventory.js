#pragma strict

private var hotbarHeight = 100;
private var hotbarWidth = 900;
private var hotbarItemStrings : String[] = ["Main\nThruster", "Afterburner", "Vernier", "Fuel\nTank", "Radiation\nShielding", "Blue", "White", "Gray", "Black"];
private var hotbarItemQuantities : String[] = ["12","3","14","5","8","44","112","83","11"];
private var hotbarIndex = 0;

private var cargoDrawerMargin = 12;
private var cargoDrawerSlotWidth = 100;
private var cargoDrawerWidth = hotbarWidth + cargoDrawerMargin * 2;
private var cargoDrawerRowHeight = 100;
private var cargoDrawerTotalHeight = 100;
private var cargoDrawerCurrentY = Screen.height - cargoDrawerRowHeight;
private var cargoDrawerOpenY = cargoDrawerRowHeight / 2;
private var cargoDrawerClosedY = Screen.height - cargoDrawerRowHeight;
private var cargoDrawerX = Screen.width / 2 - cargoDrawerWidth / 2 - cargoDrawerMargin;
private var cargoDrawerIsOpen = false;
private var cargoDrawerStepSize = 10;

private var cargoPrims = 4;
private var cargoItemStrings : String[] = ["foo", "bar", "bat"];
private var cargoItemQuantities : int[] = [11,2,333];
private var fakeItems : String[] = ["Hydrogen", "Helium","Lithium","Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese"];
private var cargoGridWidth = cargoDrawerSlotWidth;
private var cargoGridHeight = cargoGridWidth;
private var cargoGridSelectedIndex = -1;

private var lastScrollWheelTime : float;
private var scrollWheelDelay : float = 0.3;


function Start () {
	lastScrollWheelTime = Time.time;
	cargoDrawerTotalHeight = cargoDrawerRowHeight * (Mathf.Ceil(cargoPrims / 9.0) + 1.0);
	//Debug.Log(cargoDrawerTotalHeight);

	resizeCargoArray(17);
}

function resizeCargoArray(numberOfPrims : int) {
	cargoItemStrings = new String[numberOfPrims];

	for(var i = 0; i < cargoItemStrings.Length; i++) {
		cargoItemStrings[i] = fakeItems[i];
		Debug.Log("Inventory: added " + cargoItemStrings[i] + " to cargo grid.");
	}

	if(numberOfPrims <= 9) {
		cargoGridWidth = 9 * cargoDrawerSlotWidth;
		cargoGridHeight = Mathf.Ceil(parseFloat(numberOfPrims) / 9.0) * cargoDrawerRowHeight;
		//Debug.Log("Inventory: cargo grid height: " + cargoGridHeight);
	}
	else {
		cargoGridWidth = cargoDrawerSlotWidth * 9;
		cargoGridHeight = Mathf.Ceil(parseFloat(numberOfPrims) / 9.0) * cargoDrawerRowHeight;
		//Debug.Log("Inventory: cargo grid height: " + cargoGridHeight);
	}
	//Debug.Log("Inventory: cargo width:" + cargoGridWidth + " vs. hotbar width: " + hotbarWidth);
	Debug.Log("Inventory: cargo height:" + cargoGridHeight);
	cargoDrawerTotalHeight = cargoGridHeight + hotbarHeight;
	cargoDrawerOpenY = Screen.height - (cargoDrawerTotalHeight + cargoDrawerMargin);
}

function decrementActiveItemQuantity() {
	var tempInt : int;
	tempInt = int.Parse(hotbarItemQuantities[hotbarIndex]);
	tempInt--;
	hotbarItemQuantities[hotbarIndex] = tempInt.ToString();
}

function incrementItemQuantity(prim : GameObject) {
	var tempInt : int;
	//tempInt = int.Parse(hotbarItemQuantities[index]);
	tempInt++;
	//hotbarItemQuantities[index] = tempInt.ToString();
}

function getActiveItemQuantity() {
	var tempInt : int;
	tempInt = int.Parse(hotbarItemQuantities[hotbarIndex]);
	return tempInt;
}

function assignPrimMatter(prim : GameObject) {
	 if( hotbarItemStrings[hotbarIndex] == "Main\nThruster" ) {
		prim.renderer.material.color = Color.magenta;
		prim.tag = "Main Thruster";
	} else if( hotbarItemStrings[hotbarIndex] == "Afterburner" ) {
		prim.renderer.material.color = Color.red;
		prim.tag = "Afterburner";
	} else if( hotbarItemStrings[hotbarIndex] == "Vernier" ) {
		prim.renderer.material.color = Color.white;
		prim.tag = "Vernier Thruster";
	} else if( hotbarItemStrings[hotbarIndex] == "Fuel\nTank" ) {
		prim.renderer.material.color = Color.yellow;
		prim.tag = "Fuel Tank";
	} else if( hotbarItemStrings[hotbarIndex] == "Radiation\nShielding" ) {
		prim.renderer.material.color = Color.green;
		prim.tag = "Radiation Shielding";
	} else if( hotbarItemStrings[hotbarIndex] == "Cyan" ) {
		prim.renderer.material.color = Color.cyan;
	} else if( hotbarItemStrings[hotbarIndex] == "Blue" ) {
		prim.renderer.material.color = Color.blue;
	} else if( hotbarItemStrings[hotbarIndex] == "Gray" ) {
		prim.renderer.material.color = Color.gray;
	} else if( hotbarItemStrings[hotbarIndex] == "Black" ) {
		prim.renderer.material.color = Color.black;
	} else {
		Debug.Log("Inventory: Error, I was unable to match the new prim's matter type from the hotbar index against the list of known matter types.");
	}
}

function detectPrimMatter(detectedPrim : GameObject) {
	if( detectedPrim.name == "Magenta" ) {

	} else if( detectedPrim.name == "Red" ) {

	} else if( detectedPrim.name == "White" ) {

	} else if( detectedPrim.name == "Yellow" ) {

	} else if( detectedPrim.name == "Green" ) {

	} else if( detectedPrim.name == "Cyan" ) {

	} else if( detectedPrim.name == "Blue" ) {

	} else if( detectedPrim.name == "Gray" ) {

	} else if( detectedPrim.name == "Black" ) {

	} else {
		Debug.Log("Inventory: Error, I was unable to identify the prim's matter type against the list of known matter types.");
	}
}

function Update () {
	if(Input.GetKeyDown("1")) {
		hotbarIndex = 0;
	}
	else if(Input.GetKeyDown("2")) {
		hotbarIndex = 1;
	}
	else if(Input.GetKeyDown("3")) {
		hotbarIndex = 2;
	}
	else if(Input.GetKeyDown("4")) {
		hotbarIndex = 3;
	}
	else if(Input.GetKeyDown("5")) {
		hotbarIndex = 4;
	}
	else if(Input.GetKeyDown("6")) {
		hotbarIndex = 5;
	}
	else if(Input.GetKeyDown("7")) {
		hotbarIndex = 6;
	}
	else if(Input.GetKeyDown("8")) {
		hotbarIndex = 7;
	}
	else if(Input.GetKeyDown("9")) {
		hotbarIndex = 8;
	}

	if(Input.GetAxis("Mouse ScrollWheel")) {
		if(Time.time - scrollWheelDelay > lastScrollWheelTime) {
			lastScrollWheelTime = Time.time;

			if (Input.GetAxis("Mouse ScrollWheel") > 0) {
				hotbarIndex++;
				if ( hotbarIndex > hotbarItemStrings.Length - 1) {
					hotbarIndex = 0;
				}
			}
			else if(Input.GetAxis("Mouse ScrollWheel") < 0) {
				hotbarIndex--;
				if ( hotbarIndex < 0 ) {
					hotbarIndex = hotbarItemStrings.Length - 1;
				}
			}
		}
	}

	if( Input.GetKeyDown("i")) {
		cargoDrawerIsOpen = !cargoDrawerIsOpen;

		if(cargoDrawerIsOpen) {
			Screen.lockCursor = false;
		}
		else {
			Screen.lockCursor = true;
		}
	}
}

function OnGUI () {
	/*
	if(GUILayout.Button("+")) {
		resizeCargoArray(cargoItemStrings.Length + 1);
	}

	if(GUILayout.Button("-")) {
		resizeCargoArray(cargoItemStrings.Length - 1);
	}
	*/

	GUI.depth = 100;

	if(cargoDrawerIsOpen && cargoDrawerCurrentY > cargoDrawerOpenY) {
		cargoDrawerCurrentY -= cargoDrawerStepSize;
	}
	else if(cargoDrawerIsOpen && cargoDrawerCurrentY < cargoDrawerOpenY) {
		cargoDrawerCurrentY += cargoDrawerStepSize;
	}
	else if(!cargoDrawerIsOpen && cargoDrawerCurrentY < cargoDrawerClosedY) {
		cargoDrawerCurrentY += cargoDrawerStepSize;
	}
	else if(!cargoDrawerIsOpen && cargoDrawerCurrentY > cargoDrawerClosedY) {
		cargoDrawerCurrentY -= cargoDrawerStepSize;
	}

	// Draw the hotbar
	GUI.Box(Rect(cargoDrawerX, cargoDrawerCurrentY, cargoDrawerWidth, cargoDrawerTotalHeight), "Hotbar");
	hotbarIndex = GUI.Toolbar(Rect(cargoDrawerX + cargoDrawerMargin, cargoDrawerCurrentY, hotbarWidth, cargoDrawerRowHeight), hotbarIndex, hotbarItemStrings);
	cargoGridSelectedIndex = GUI.SelectionGrid(Rect(cargoDrawerX + cargoDrawerMargin, cargoDrawerCurrentY + cargoDrawerRowHeight, cargoGridWidth, cargoGridHeight), cargoGridSelectedIndex, cargoItemStrings, 9);
	//GUI.Toolbar(Rect(Screen.width / 2 - hotbarWidth / 2, Screen.height - hotbarHeight * 2, hotbarWidth, hotbarHeight), hotbarIndex, hotbarItemQuantities);
}