var randomSeed : float = 5.0;

var TerrainSquareTile : Transform;
var TerrainHexTile : Transform;
private var TerrainTile : Transform;
var tileLength : float = 2.0; 		// Tile length and width.  For hexes: 1.16667 tile : 2 grid size ratio tesselates well.
var tileDefaultHeight : float = -2.0;// Base global y-axis height for tiles
var vertRandomScale : float = 0.1;	// How much noise the vertical position has
var tileGridSpacing : float = 2.1;	// The size of each grid cell containing a tile
private var tileGridSpacingZ;
var tileGridLength : int = 3;		// how many tiles per side of the grid to keep visible at once?
private var visible_tiles = new Array();
var thisIsAHexGrid : int = 0;

function clone_new_tile(new_pos : Vector3, new_rot : Quaternion, new_scale : float)
{
	var tile_clone : Transform;
	tile_clone = Instantiate(TerrainTile, new_pos, new_rot);
    tile_clone.transform.localScale.x = new_scale;
    tile_clone.transform.localScale.z = new_scale;
    
    tile_clone.name = Random.Range(1,1000000000).ToString();
    
    visible_tiles.Add(tile_clone);
}

function Start()
{
	if(transform.networkView.isMine) {
		Random.seed = randomSeed;
	
		if(thisIsAHexGrid == 1)
		{
			tileGridSpacingZ = tileGridSpacing * 5 / 6;
			TerrainTile = TerrainHexTile;
		}
		else
		{
			tileGridSpacingZ = tileGridSpacing;
			TerrainTile = TerrainSquareTile;
		}
	
		
	
		for(var i : int = -1; i < 2; i++) 
		{
			for(var j : int = -1; j < 2; j++)
			{
			// Debug.Log("Initial tile generation (" + i.ToString() + "," + j.ToString() + ")");
				var derived_x : float;
				var derived_z : float;
				var derived_rot : Quaternion = Quaternion.identity;
	
				if(thisIsAHexGrid == 1) 
				{
					if( Mathf.Floor(j) % 2 == 0) // and if we're setting up an even-numbered row
					{
						derived_x = transform.position.x + i * (tileGridSpacing) + (tileGridSpacing) / 2.0;
					}
					else
					{
						derived_x = transform.position.x + i * (tileGridSpacing);
					}
					derived_z = transform.position.z + j * (tileGridSpacing) * (5.0 / 6.0);
				}
				else
				{
					derived_x = transform.position.x + i * (tileGridSpacing);
					derived_z = transform.position.z + j * (tileGridSpacing);
				}
	
				clone_new_tile(Vector3(	derived_x, 
									tileDefaultHeight + ((Random.value * vertRandomScale) - (vertRandomScale / 2.0)), 
									derived_z),
									derived_rot, 
									tileLength);
				
			} // j loop
		} // i loop
		
		Debug.Log("Tiler: triggering looping periodic tile check.");
		
		InvokeRepeating("PeriodicTileCheck", 5.0, 5.0);
	
	}
	else { // Only tile locally
		this.enabled = false;
	}
}

function PeriodicTileCheck() 
{
	var player_pos : Vector3 = transform.position;

	//Debug.Log("Re-tiling the map.");
	for(var i : int = 0; i < visible_tiles.length; i++)
	{	
		//Debug.Log("Cull check, tile " + i.ToString());
		
		if(visible_tiles[i].position.x > player_pos.x + ((tileGridLength - 1) * (tileGridSpacing)) )
		{
			
			visible_tiles[i].position.x -= (tileGridLength) * (tileGridSpacing);				
		}		
		else if(visible_tiles[i].position.x < player_pos.x - ((tileGridLength - 1) * (tileGridSpacing)))
		{
			
			visible_tiles[i].position.x += (tileGridLength) * (tileGridSpacing);
		}
		else if(visible_tiles[i].position.z > player_pos.z + ((tileGridLength - 1) * tileGridSpacingZ))
		{
			
			visible_tiles[i].position.z -= (tileGridLength * tileGridSpacingZ);
		}		
		else if(visible_tiles[i].position.z < player_pos.z - ((tileGridLength - 1) * tileGridSpacingZ))
		{
			
			visible_tiles[i].position.z += (tileGridLength * tileGridSpacingZ);
		}
	} 
}

function localStartup() {
	Debug.Log("Starting up local tile engine");
}

function localShutdown() {
	Debug.Log("Shutting down local tile engine");
}


function Update() {

}

 