class Entity {
	constructor(x, y, dir){
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.velocity = 0;
        this.ticksExisted = 0;
		
        this.grounded = false;
		this.groundedBodyUUID = null;
		
        this.name = "Entity";
        this.color = [ 255, 255, 255 ];
		this.filled = true;
        this.uuid = Math.round(Math.random() * 10000000);
        this.rotSpeed = 0;
	}
	
	update() {
		
		this.dir += this.rotSpeed;
        this.x   += this.velocity * Math.cos(this.dir);
        this.y   += this.velocity * Math.sin(this.dir);
		
		// THIS IS TEMPORARY, once we have more than one entity this should really be removed
		cam_x = this.x; cam_y = this.y;
		
		// what to do if the entity is not found within a chunk
		if (!this.getChunk()){
			
			var chunkx = Math.floor( this.x / server.world.CHUNK_DIM );
			var chunky = Math.floor( this.y / server.world.CHUNK_DIM );
			
			server.world.loadChunk(chunkx, chunky);
			
		// what to do if the entity is within a chunk--
		}else{
			
			var isColliding = false;
			for (var uuid in this.getChunk().bodies) {
				var body = this.getChunk().bodies[uuid];
				
				if (body.canEntitiesCollide){
					
					if (CollisionUtil.isColliding(this, body)) {

                        // Setting collision markers
                        if (this.velocity > 1.0 ) {
                            //this.explode();
                        } else {
                            this.grounded = true;
                            this.groundedBodyUUID = body.uuid;
                            isColliding = true;
                            CollisionUtil.resolveCollision(this, body);
                        }
                    }
				}
			}
			
			if (!(isColliding)){
                this.groundedBodyUUID = null;
                this.grounded = false;
            }

            if (this.grounded && this.getGroundedBody() != null) {

                if (this.velocity > 0.2){
                    this.velocity = 0.2;
                }

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
            }
		}
		
		this.ticksExisted++;
	}
	
	getChunk() {
		var chunkx = Math.floor( this.x / server.world.CHUNK_DIM );
		var chunky = Math.floor( this.y / server.world.CHUNK_DIM );
		
		if (server.world.chunks[chunkx]){
			if (server.world.chunks[chunkx][chunky]){
				return server.world.chunks[chunkx][chunky];
			}
		}
		return null;
	}
	// this method is used when rendering objects
	getAbsolutePoints() {
		return [];
	}
	
	getX(){ return this.x; }
	getY(){ return this.y; }
	getDir() { return this.dir; }
	
	getGroundedBody(){
		if (this.grounded){
			return this.getChunk().bodies[this.groundedBodyUUID];
		}
		return null;
	}
}