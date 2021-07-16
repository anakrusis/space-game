class Chunk {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.bodies = {};
		
		var genx = CHUNK_DIM * (this.x + 0.5);
		var geny = CHUNK_DIM * (this.y + 0.5);
		
		var star = new BodyStar(genx, geny, 0, 130);
		this.spawnBody(star);
		
		// this value starts at 1 (so there is always 1 planet at least) and steps down 0.1 with each planet
		var planetChance = 1;
		// serves as a minimum value so that planets don't get too close in orbit
		var orbitDistanceInterval = 12000;
		// random variation so they aren't too boring/evenly spaced
        var orbitVariance = 5000;
		for (i = 0; i < 8; i++){
			
			var orbitSlot = RandomUtil.fromRangeI(0,8);
			var planetdist = orbitDistanceInterval * (orbitSlot + 2);
			var orbitDistance = RandomUtil.fromRangeF(planetdist - orbitVariance, planetdist + orbitVariance);
			
			// enforces the orbitDistanceInterval, "clearing the neighborhood" of orbital paths
			var neighborhoodClear = true;
			for (var uuid in this.bodies){
				var body = this.bodies[uuid];
				if (body instanceof BodyPlanet){
					var orbitDiff = Math.abs(body.orbitDistance - orbitDistance);
					if (orbitDiff < orbitDistanceInterval){
						neighborhoodClear = false; break;
					}
				}
			}
			
			if ( RandomUtil.nextFloat(1) < planetChance && neighborhoodClear){
				
				var radius = RandomUtil.fromRangeF(256,1024);
				var planet = new BodyPlanet(star.getX() + orbitDistance, star.getY(), 0, radius, orbitDistance, star.uuid);
				
				this.spawnBody(planet);
				
				if ( RandomUtil.nextFloat(1) < 1 ){
					
					var moonradius = radius / 4;//RandomUtil.fromRangeF(64,1024);
					var moondistance = RandomUtil.fromRangeF(5,20) * radius;
					var moon = new BodyPlanet(planet.getX() + moondistance, planet.getY(), 0, moonradius, moondistance, planet.uuid);
					moon.temperature = planet.temperature - RandomUtil.fromRangeF(100,200);;
					
					this.spawnBody(moon);
				}
				
				//planetcount++;
				planetChance -= 0.1;
			}
		}
		
		this.type = this.constructor.name;
	}
	
	getBody(uuid){
		return this.bodies[uuid];
	}
	
	spawnBody(body){
		this.bodies[body.uuid] = body;
		
		if (body.canEntitiesCollide){
			
			var bgr = new BodyGravityRadius(body.x, body.y, body.dir, body.radius*10, body.uuid);
			this.spawnBody(bgr);
			body.gravUUID = bgr.uuid;
		}
	}
	
	update(){
		
	}
}