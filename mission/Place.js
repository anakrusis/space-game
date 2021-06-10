// A Place is a hierarchical, generic reference type to some location in the world.
// It can be a Body, a City, a Building, etc... from the lower levels, one can access the higher level stuff as well

class Place {
	
	constructor( obj ){
		
		if (obj){
			this.name = obj.name;
			this.uuid = obj.uuid;
			this.type = this.constructor.name;
			
			if (obj instanceof BodyPlanet){
				
				this.placetype = "planet";
				this.chunkx = obj.chunkx; this.chunky = obj.chunky;
				
			}
			
			if (obj instanceof EntityBuilding){

				this.placetype = "building";
				
			}
		}
	}
	
	get(){
		
		if (this.placetype == "planet"){
			
			return server.world.chunks[this.chunkx][this.chunky].bodies[this.uuid];
		}
		
		if (this.placetype == "building"){
			
			return server.world.entities[this.uuid];
		}
	}

}