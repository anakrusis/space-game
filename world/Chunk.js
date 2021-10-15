class Chunk {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.bodies = {};
		this.random = new Random();
		
		this.type = this.constructor.name;
	}
	
	init(){
		this.seed = MathUtil.signedPair(this.x, this.y) + server.world.chunkseedoffset;
		console.log(this.seed);
		this.random = new Random( this.seed );
		
		var genx = CHUNK_DIM * (this.x + 0.5);
		var geny = CHUNK_DIM * (this.y + 0.5);
		
		var star = new BodyStar(genx, geny, 0, 130);
		this.spawnBody(star);
		
		// this value starts at 1 (so there is always 1 planet at least) and steps down 0.1 with each planet
		var planetChance = 1;
		// serves as a minimum value so that planets don't get too close in orbit
		var orbitDistanceInterval = this.random.nextFloat(12000,18000);
		// random variation so they aren't too boring/evenly spaced
        var orbitVariance = 10000;
		for (var pc = 0; pc < 8; pc++){
			
			var orbitSlot = this.random.nextInt(0,8);
			var planetdist = orbitDistanceInterval * (orbitSlot + 2);
			var orbitDistance = this.random.nextFloat(planetdist - orbitVariance, planetdist + orbitVariance);
			
			// enforces the orbitDistanceInterval, "clearing the neighborhood" of orbital paths
			var neighborhoodClear = true;
			for (var uuid in this.bodies){
				var body = this.bodies[uuid];
				if (body instanceof BodyPlanet && body.descriptor != "moon" ){ //&& !(body.getStar() instanceof BodyPlanet)
					var orbitDiff = Math.abs(body.orbitDistance - orbitDistance);
					if (orbitDiff < orbitDistanceInterval){
						neighborhoodClear = false; break;
					}
				}
			}
			
			console.log(this.random.state);
			var planettry = this.random.next(); console.log(planettry);
			if ( planettry < planetChance && neighborhoodClear){
				
				var radius = this.random.nextFloat(256,1024);
				var planet = new BodyPlanet(star.getX() + orbitDistance, star.getY(), 0, radius, orbitDistance, star.uuid);
				planet.populateOreVeins();
				
				this.spawnBody(planet);
				
				// TODO the chance of moons should ramp up with bigger radius planets
				if ( this.random.next() < 0.5 ){
					
					var moonradius = radius/4;
					var moondistance = this.random.nextFloat(15,20) * radius;
					var moon = new BodyPlanet(planet.getX() + moondistance, planet.getY(), 0, moonradius, moondistance, planet.uuid);
					moon.temperature = Math.max(0,planet.temperature + this.random.nextFloat(-100,100));
					moon.uuid = planet.uuid - 5;
					moon.icon = "🌙";
					moon.updatePriority = 0;
					moon.descriptor = "moon";
					
					moon.populateOreVeins(); // temporarily pulled out here because it relies on establishing a uuid first
					
					// TODO spawn all moons afterwards so they dont affect the orbit positioning
					this.spawnBody(moon);
				}
				
				//planetcount++;
				planetChance -= 0.1;
			}
		}
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