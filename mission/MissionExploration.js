class MissionExploration extends Mission {
	constructor(sourceCityUUID, body){
		super(sourceCityUUID);
		
		this.timeRemaining = -1;
		
		var sorcecity = server.world.cities[ this.sourceCityUUID ];
		
		this.distance = CollisionUtil.euclideanDistance( sorcecity.getSpaceport().x, sorcecity.getSpaceport().y, body.x, body.y );
		this.reward = 10 * Math.round ( this.distance / 300 );
		
		//this.chunkx = chunkx; this.chunky = chunky;
		
		this.destination = new Place(body);
		
		//this.bodyUUID = bodyUUID;
		
		this.displaytext  = "Exploration of " + this.destination.name + "\n";
		this.displaytext += "\n$" + this.reward;
		
		this.desc = "Our nation is ready to send a crewed mission to the planet " + this.destination.name + ".\nWe will be eagerly awaiting your safe return.";
		
		this.objectives = [ [ new ObjectiveGoToPlace( this.destination ) ], [ new ObjectiveGoToPlace( new Place( sorcecity.getSpaceport() ) ) ] ];
	}
}