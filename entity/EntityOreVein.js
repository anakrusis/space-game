class EntityOreVein extends Entity {
	constructor(x,y,planetuuid, startindex, endindex){
		super(x,y,0);
		this.name = "Ore";
		this.startindex = startindex;
		this.endindex = endindex;
		this.planetUUID = planetuuid;
		this.filled = true;
		this.grounded = true;
		this.groundedBodyUUID = planetuuid;
	}
	
	getPlanet(){
		return this.getChunk().getBody(this.planetUUID);
	}
	
	getAbsolutePoints(){
		
		var ende = this.endindex;
		if (this.endindex < this.startindex){
			ende += this.terrainSize;
		}
		
		// This is because of the boundary like (on a 127-size planet) 125, 126, 0, 1, 2...
		// becomes 125, 126, 127, 128, 129... and iterates smoothely
		var points = this.getPlanet().getAbsPointsSlice(this.startindex, this.endindex);
		
		var middleindex = Math.round( (ende + this.startindex) / 2 ); //console.log(middleindex);
		middleindex = loopyMod(middleindex, this.getPlanet().terrainSize);
		
		var terr = this.getPlanet().getAbsPointsSlice(middleindex, middleindex);
		
		var terrx = terr[0]
		var terry = terr[1]
		
		var dist = CollisionUtil.euclideanDistance(this.getPlanet().x, this.getPlanet().y, terrx, terry);
		//var angle = Math.atan2(terry - this.getPlanet().y, terrx - this.getPlanet().x);
		var angle = this.getPlanet().dir + (middleindex * (2 * Math.PI) / this.getPlanet().terrainSize);
		dist -= (2 * (ende - this.startindex));
		var bottompointx = this.getPlanet().x + rot_x( angle, dist, 0 )
		var bottompointy = this.getPlanet().y + rot_y( angle, dist, 0 )
		points.push(bottompointx); points.push(bottompointy);
		
		return points;
	}
	
	update(){
		this.grounded = true;
		this.groundedBodyUUID = this.planetUUID
		
		var angle = this.getPlanet().dir + (this.startindex * (2 * Math.PI) / this.getPlanet().terrainSize);
		this.x = this.getPlanet().x + rot_x( angle, this.getPlanet().getRadius(), 0 )
		this.y = this.getPlanet().y + rot_y( angle, this.getPlanet().getRadius(), 0 )
		
				// This moves the entity along with a planet by anticipating where it will be in the next tick
		if (this.getGroundedBody() instanceof BodyPlanet) {
			var planet = this.getGroundedBody();
			// Added on an extra step (2pi/orbitPeriod) because planets update after entities (lol)
			var angle = planet.getOrbitAngle() + (Math.PI * 2) / planet.getOrbitPeriod();
			var futurePlanetX = rot_x(angle, planet.getOrbitDistance(), 0) + planet.getStar().getX();
			var futurePlanetY = rot_y(angle, planet.getOrbitDistance(), 0) + planet.getStar().getY();

			this.x += (futurePlanetX - planet.getX());
			this.y += (futurePlanetY - planet.getY());
		}

		var body = this.getGroundedBody();
		// This moves the entity along with any rotating body
		this.dir += body.rotSpeed;
		this.x = rot_x(body.rotSpeed, this.x - body.x, this.y - body.y) + body.getX();
		this.y = rot_y(body.rotSpeed, this.x - body.x, this.y - body.y) + body.getY();
		
		this.ticksExisted++;
	}

	isOnScreen(){
		if(!buildingDrawEnabled || cam_zoom < MAX_INTERPLANETARY_ZOOM){ return false };
		
		var buffer = 25;
		var tx = tra_rot_x(this.x,this.y); var ty = tra_rot_y(this.x,this.y); 
		return ((tx > -(buffer*cam_zoom) && tx < width+(buffer*cam_zoom)) && (ty > -(buffer*cam_zoom) && ty < height+(buffer*cam_zoom)));
	}
}