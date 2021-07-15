class MissionExploration extends Mission {
	constructor(sourceCityUUID, body){
		super(sourceCityUUID);
		
		this.timeRemaining = -1;
		
		var sorcecity = server.world.cities[ this.sourceCityUUID ];
		
		if (!sorcecity){ return; }
		
		this.distance = CollisionUtil.euclideanDistance( sorcecity.getSpaceport().x, sorcecity.getSpaceport().y, body.x, body.y );
		this.reward = 10 * Math.round ( this.distance / 300 );
		
		//this.chunkx = chunkx; this.chunky = chunky;
		
		this.destination = new Place(body);
		
		//this.bodyUUID = bodyUUID;
		
		this.displaytext  = "Exploration of " + this.destination.name + "\n";
		this.displaytext += "\n$" + this.reward;
		
		this.desc = "Our nation is ready to send a crewed mission to the planet " + this.destination.name + ".\nWe will be eagerly awaiting your safe return.";
		this.failtext = "The mission to " + this.destination.name + " was unsuccessful.\nThis is a terrible loss for our nation, though we must continue onwards in the pursuit of scientific knowledge.\n"
		this.successtext = "The mission to " + this.destination.name + " was a success!\nOur nation celebrates this great achievement and is ever thankful for your contribution to science!"
		
		this.objectives = [ [ new ObjectiveGoToPlace( this.destination ) ], [ new ObjectiveGoToPlace( new Place( sorcecity.getSpaceport() ) ) ] ];
		
		this.iconColor = body.color;
	}
	
	getIcon(){
		
		var points = [];
		var pointscount = 10;

        for (var i = 0; i < pointscount; i++){
            var angle = frameCount/100 + (i * (2 * Math.PI) / pointscount);

            var pointx = rot_x(angle, 1, 0.0);
            var pointy = rot_y(angle, 1, 0.0);
			
			points.push(pointx); points.push(pointy);
        }

        return points;
	}
}