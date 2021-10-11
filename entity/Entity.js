var avgDirection;
var annulusPosition;

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
		this.linecolor = null;
		this.filled = true;
		this.renderPriority = 4;
		
        this.uuid = Math.round(p5.prototype.random() * 10000000000);
        this.rotSpeed = 0;
		
		this.dead = false;
		this.hidden = false;
		
		this.forceVectors = [];
		
		this.type = this.constructor.name;
	}
	
	isDead(){
		return this.dead;
	}
	
	render() {
		
		if (this.isDead()){ return; };
		if (!this.scale){
			this.scale = 1;
		}
		
		if (this.filled){
			fill(this.color[0], this.color[1], this.color[2]);
		}else{
			noFill();
		}
		if (selectedEntity == this){
			stroke(255, 128 * (1 + Math.sin(framecount / 15)), 0);
			strokeWeight(6);
		}else if (this.linecolor != null){
			stroke(this.linecolor[0], this.linecolor[1], this.linecolor[2]);
			strokeWeight(2);
		}else{
			stroke(this.color[0], this.color[1], this.color[2]);
			strokeWeight(2);
		}
		var pts = this.getRenderPoints();
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			
			var px = pts[i]; var py = pts[i+1];
			if (!px){ endShape(CLOSE); beginShape(); continue; }
			
			px = ((px - this.x) * this.scale) + this.x;  py = ((py - this.y) * this.scale) + this.y; 
			
			vertex(Math.round(tra_rot_x(px,py)), Math.round(tra_rot_y(px,py)));
		}
		endShape(CLOSE);
		
/* 	if (e instanceof EntityBuilding){
		var pts = e.getAbsolutePoints();
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			var px = pts[i]; var py = pts[i+1];
			px = ((px - e.x) * scale) + e.x;  py = ((py - e.y) * scale) + e.y; 
			vertex(tra_x(px), tra_y(py));
		}
		endShape(CLOSE);
	} */
	
		strokeWeight(1);
		
	}
	
	update() {
		
		var lastvel = this.velocity;
		
		var lastx = this.x; var lasty = this.y;
		
		var magnitudeSum = 0;
		for (var force of this.forceVectors){
			magnitudeSum += Math.abs(force.magnitude);
		}
		
		var forcesXSum = 0; var forcesYSum = 0;
		for (var i = 0; i < this.forceVectors.length; i++){
			var force  = this.forceVectors[i];
			var magratio = (force.magnitude / magnitudeSum);
			
			var forcex = Math.cos(force.dir); var forcey = Math.sin(force.dir);
			forcesXSum += forcex * magratio; forcesYSum += forcey * magratio;
			
			//this.velocity += 0.001 * force.magnitude;
			this.x += force.magnitude * Math.cos(force.dir);
			this.y += force.magnitude * Math.sin(force.dir);
		}
		//forcesXSum /= this.forceVectors.length; forcesYSum /= this.forceVectors.length;
		avgDirection = Math.atan2(forcesYSum, forcesXSum);
		if (avgDirection && !this.grounded){
			this.dir = avgDirection;
		}
		
		//this.x += this.velocity * Math.cos(this.dir);
        //this.y += this.velocity * Math.sin(this.dir);
		
		this.forceVectors = []; // clears forces for the next tick
		
		//this.dir = this.dir % (2 * Math.PI);
		
		// what to do if the entity is not found within a chunk
		if (!this.getChunk()){
			
			var chunkx = Math.floor( this.x / CHUNK_DIM );
			var chunky = Math.floor( this.y / CHUNK_DIM );
			
			server.world.loadChunk(chunkx, chunky);
			
		// what to do if the entity is within a chunk--
		}else{
			
			var isColliding = false;
			for (var uuid in this.getChunk().bodies) {
				var body = this.getChunk().bodies[uuid];
				
				// examples of bodies that can collide are Planets and Stars
				if (body.canEntitiesCollide){
					
					if (CollisionUtil.isColliding(this, body)) {

                        // Setting collision markers
                        if ( body instanceof BodyStar ) {
                            this.onCrash();
                        } else {
							
							// This is a first-tick grounded check which triggers an event for missions
							if (this instanceof EntityPlayer && !this.grounded){
								MissionHandler.onPlayerGround( this, body );
							}
							
                            this.grounded = true;
                            this.groundedBodyUUID = body.uuid;
                            isColliding = true;
                            CollisionUtil.resolveCollision(this, body);
							
                        }
                    }
					
				// examples of bodies that do not collide are GravityRadius, Ocean and Atmosphere
				}else{
					
					if (CollisionUtil.isColliding(this, body)){
						
						// GravityRadius acts a force of gravity on entities
                        if (body instanceof BodyGravityRadius) {
                            var bgr = body;
                            var dependentBody = bgr.getDependentBody();
                            var distance = CollisionUtil.euclideanDistance(this.x, this.y, bgr.getX(), bgr.getY());
							
                            // This function returns ~0 at the edge of the gravity radius, and ~1 at the surface of the body.
                            annulusPosition = (-1 / (bgr.getRadius() - dependentBody.getRadius())) * ( distance - dependentBody.getRadius() ) + 1;
                            var forceMagnitude;

                            // It is then mapped to a coefficient representing its "mass"
                            // which determines how much to pull in the entity every tick
                            if (dependentBody instanceof BodyStar){
                                //forceMagnitude = 10 / ( distance );
								forceMagnitude = 0.05 * annulusPosition;
                            }else{
                                //forceMagnitude = 500 / ( distance * distance );
								forceMagnitude = 0.05 * annulusPosition;
                            }
                            var angleFromCenter = Math.atan2(this.y - body.getY(), this.x - body.getX());
							
							// To prevent drift when grounded, the player only is attracted to the nearest body
							if (this.grounded){
								if ( this.getNearestBody() == dependentBody ){
									this.forceVectors.push ( new ForceVector( "Gravity", 0 - forceMagnitude, angleFromCenter ) );
								}
							}else{
								this.forceVectors.push ( new ForceVector( "Gravity", 0 - forceMagnitude, angleFromCenter ) );
							}
						
						// BodyOcean enacts a buoyant force slightly stronger than gravity to slowly push entities up
                        }else if (body instanceof BodyOcean){
							
							forceMagnitude = 0.07;
							var angleFromCenter = Math.atan2(this.y - body.getY(), this.x - body.getX());
							this.forceVectors.push ( new ForceVector( "Buoyancy", forceMagnitude, angleFromCenter ) );
						}
                    }
				}
			}
			
			if (!(isColliding)){
                this.groundedBodyUUID = null;
                this.grounded = false;
            }

            if (this.grounded && this.getGroundedBody() != null) {

                // This moves the entity along with a planet by anticipating where it will be in the next tick
                if (this.getGroundedBody() instanceof BodyPlanet) {
                    var planet = this.getGroundedBody();
					
                    // It works by adding on an extra step (2pi/orbitPeriod) to move along entities with the planets
				
					// This getStar() terminology is a relic from when there were no moons, only planets orbiting stars
					// anyways this if statement is made for moving along entities on moons
/* 					if (planet.getStar() instanceof BodyPlanet){
						var star = planet.getStar();
						var starangle = star.getOrbitAngle() + (Math.PI * 2) / star.getOrbitPeriod();
						var futureStarX = rot_x(starangle, star.getOrbitDistance(), 0) + star.getStar().getX();
						var futureStarY = rot_y(starangle, star.getOrbitDistance(), 0) + star.getStar().getY();
						
						this.x += (futureStarX - star.getX());
						this.y += (futureStarY - star.getY());
						
					}else{ */
						var futureStarX = planet.getStar().getX();
						var futureStarY = planet.getStar().getY();
					//}
					
					// This older portion is for moving along entities on planets and moons
					var angle = planet.getOrbitAngle() + (Math.PI * 2) / planet.getOrbitPeriod();
					var futurePlanetX = rot_x(angle, planet.getOrbitDistance(), 0) + planet.getStar().x;
					var futurePlanetY = rot_y(angle, planet.getOrbitDistance(), 0) + planet.getStar().y;

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
		
		this.velocity = CollisionUtil.euclideanDistance(lastx, lasty, this.x, this.y);
		
		var veldiff = Math.abs( lastvel - this.velocity );
		
		if (veldiff > 0.5 && this.ticksExisted > 10 && !this.dead){
			this.onCrash();
		}
		
		this.ticksExisted++;
	}
	
	getChunk() {
		var chunkx = Math.floor( this.x / CHUNK_DIM );
		var chunky = Math.floor( this.y / CHUNK_DIM );
		
		if (server.world.chunks[chunkx]){
			if (server.world.chunks[chunkx][chunky]){
				return server.world.chunks[chunkx][chunky];
			}
		}
		return null;
	}
	// this method is used when doing object collision.
	// defaults to a single point for generic entitys, can be given a specific hitbox shape if desired
	getAbsolutePoints() {
		return [this.x, this.y];
    }
	
	getRenderPoints(){
		return this.getAbsolutePoints();
	}
	
	getX(){ return this.x; }
	getY(){ return this.y; }
	getDir() { return this.dir; }
	
	getGroundedBody(){
		if (this.grounded && this.getChunk()){
			return this.getChunk().bodies[this.groundedBodyUUID];
		}
		return null;
	}
	
	onCrash(){

	}
	
	explode(){
        this.dead = true;

        for (var i = 0; i < 20; i++){
            var randomdir = (2 * Math.PI) * random();
			var particle = new ParticleSmoke(this.x, this.y, randomdir); particle.color = [255, 128, 0]; particle.velocity = Math.random(); particle.size = 0.1;
            server.world.spawnEntity(particle);
        }
    }
	
	moveToIndexOnPlanet(index, planet, radiusoffset){
		// the first part gets an angle and moves the player to a fixed radius from the planets center
        var angle = (planet.getDir() + (2 * Math.PI * ((index + 0.5) / planet.terrainSize)));
		this.x = rot_x(angle, 100, 0) + planet.getX();
        this.y = rot_y(angle, 100, 0) + planet.getY();
		
		// from this position the radius is calculable reliably (radius offset applied, 1 for buildings, 0 for entitys)
        var rad = planet.getRadius() + CollisionUtil.heightFromEntityAngle(this, planet) + radiusoffset;
		
		// now the position is modified to incorporate the calculated radius
        this.x = rot_x(angle, rad, 0) + planet.getX();
        this.y = rot_y(angle, rad, 0) + planet.getY();

		// and the entitys position is adjusted as well
        var angleFromCenter = Math.atan2(this.y - planet.getY(), this.x - planet.getX());
        this.dir = angleFromCenter;
    }
	
	isOnScreen(){
		var buffer = 5;
		var tx = tra_rot_x(this.x,this.y); var ty = tra_rot_y(this.x,this.y); 
		return ((tx > -(buffer*cam_zoom) && tx < width+(buffer*cam_zoom)) && (ty > -(buffer*cam_zoom) && ty < height+(buffer*cam_zoom)));
	}
}