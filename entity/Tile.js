// A single face of the planet polygon, which has its own properties

class Tile {
	
	constructor( index, height ){
		
		this.index = index;
		this.height = height;
		this.buildingUUID = null;
		this.oreVeinUUID  = null;
		this.hasRoad      = false;
	}
	
}