class PlanetHomeworld extends BodyPlanet {
	
	constructor( x,y,dir,orbitDistance,starUUID ){
		
		super( x,y,dir,orbitDistance,starUUID );
		
		this.hasOcean  = true;
		var ocean = new BodyOcean(this.x,this.y,0,this.radius,this.uuid);
		this.oceanUUID = ocean.uuid;
		this.getChunk().spawnBody(ocean);
		
		this.explored = true;
	}
	
}