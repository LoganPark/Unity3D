#pragma strict

var NumberOfChildPrims : int = 0;
var NumberOfMainThrusters : int = 0;
var NumberOfAfterburners : int = 0;
var NumberOfVernierThrusters : int = 0;
var NumberOfFuelTanks : int = 0;
var NumberOfRadiationShields : int = 0;

function Start () {
	ReportNumberOfPrims();
		
}

function Update () {

}

function RefreshHierarchy () {
	ReportNumberOfPrims();
	
	NumberOfChildPrims = 0;
	NumberOfMainThrusters = 0;
	NumberOfAfterburners = 0;
	NumberOfVernierThrusters = 0;
	NumberOfFuelTanks = 0;
	NumberOfRadiationShields = 0;
	
	if(transform.childCount)
	{
		var ChildList : Transform[] = GetComponentsInChildren.< Transform >() as Transform[];
		for(var child in ChildList) {
			NumberOfChildPrims++;
			if(child.tag == "Main Thruster") {
				NumberOfMainThrusters++;
			} else if(child.tag == "Afterburner") {
				NumberOfAfterburners++;
			} else if(child.tag == "Vernier Thruster") {
				NumberOfVernierThrusters++;
			} else if(child.tag == "Fuel Tank") {
				NumberOfFuelTanks++;
			} else if(child.tag == "Radiation Shielding") {
				NumberOfRadiationShields++;
			}
		}
		Debug.Log(	"Mass: " + NumberOfChildPrims.ToString() + "\n" + 
						"Main thrusters: " + NumberOfMainThrusters.ToString() + "\n" + 
						"Afterburners: " + NumberOfAfterburners.ToString() + "\n" + 
						"Vernier Thrusters: " + NumberOfVernierThrusters.ToString() + "\n" + 
						"Fuel Capacity: " + NumberOfFuelTanks.ToString() + "\n" + 
						"Radiation Shielding: " + NumberOfRadiationShields.ToString());
	}
		
}

function ReportNumberOfPrims() {
	if(transform.childCount)
	{	
		Debug.Log("Av Attributes: " + transform.childCount.ToString() + " AvPrims.");
	} else {
		Debug.Log("Av Attributes: No child prims found.");
	}
}