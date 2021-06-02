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
				
				var planet = new BodyPlanet(star.getX() + orbitDistance, star.getY(), 0, orbitDistance, star.uuid);
				
				this.spawnBody(planet);
				//planetcount++;
				planetChance -= 0.1;
			}
		}
		
/* 		       // Every star gets potentially up to 4 planets
        var planetcount = 0;
        var orbitDistanceInterval = 12000;
        var orbitVariance = 4000;
		
		// chance that a given orbital position will yield a planet
		var planetChance = 1;

        for (var uuid in this.bodies) {
			var body = this.bodies[uuid];
            if (body instanceof BodyStar) {
                //var planetnum = orbitDistanceInterval * Math.floor(random()*4 + 2) + orbitDistanceInterval;
				var planetnum = orbitDistanceInterval * 8 + orbitDistanceInterval;
				//console.log(planetnum);
				//var planetnum = 4;
                for (var planetdist = 2 * orbitDistanceInterval; planetdist < planetnum; planetdist += orbitDistanceInterval) {

                    var orbitDistance = RandomUtil.fromRangeF(planetdist - orbitVariance, planetdist + orbitVariance);
					//var orbitDistance = planetdist;

                    //String name = body.getName() + " " + NymGen.greekLetters()[planetcount];
					
					if ( RandomUtil.nextFloat(1) < planetChance ){
						
						var planet = new BodyPlanet(body.getX() + orbitDistance, body.getY(), 0, orbitDistance, body.uuid);
						
						this.spawnBody(planet);
						planetcount++;
						planetChance -= 0.1;
					}
                }
            }
        } */
	}
	
	getBody(uuid){
		return this.bodies[uuid];
	}
	
	spawnBody(body){
		this.bodies[body.uuid] = body;
		
		if (body.canEntitiesCollide){
			
			var bgr = new BodyGravityRadius(body.x, body.y, body.dir, body.radius*10, body.uuid);
			this.spawnBody(bgr);
		}
	}
	
	update(){
		
	}
}