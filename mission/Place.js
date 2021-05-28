// A Place is a hierarchical, generic reference type to some location in the world.
// It can be a Body, a City, a Building, etc... from the lower levels, one can access the higher level stuff as well

class Place {
	
	constructor( obj ){
		
		this.name = obj.name;
		this.uuid = obj.uuid;
		
		if (obj instanceof BodyPlanet){
			
			this.type = "planet";
			this.chunkx = obj.chunkx; this.chunky = obj.chunky;
			
		}
		
		if (obj instanceof EntityBuilding){

			this.type = "building";
			
		}
	}
	
	get(){
		
		if (this.type == "planet"){
			
			return server.world.chunks[this.chunkx][this.chunky].bodies[this.uuid];
		}
		
		if (this.type == "building"){
			
			return server.world.entities[this.uuid];
		}
	}

}