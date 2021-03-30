class Chunk {
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.bodies = {};
		
		var genx = CHUNK_DIM * (this.x + 0.5);
		var geny = CHUNK_DIM * (this.y + 0.5);
		
		var body = new BodyStar(genx, geny, 0, 130);
		this.spawnBody(body);
		
		       // Every star gets potentially up to 4 planets
        var planetcount = 0;
        var orbitDistanceInterval = 12000;
        var orbitVariance = 60;

        for (var uuid in this.bodies) {
			var body = this.bodies[uuid];
            if (body instanceof BodyStar) {
                //var planetnum = orbitDistanceInterval * Math.floor(Math.random()*4 + 2) + orbitDistanceInterval;
				var planetnum = orbitDistanceInterval * 5 + orbitDistanceInterval;
				//console.log(planetnum);
				//var planetnum = 4;
                for (var planetdist = 2 * orbitDistanceInterval; planetdist < planetnum; planetdist += orbitDistanceInterval) {

                    //var orbitDistance = RandomUtil.fromRangeF(planetdist - orbitVariance, planetdist + orbitVariance);
					var orbitDistance = planetdist;

                    //String name = body.getName() + " " + NymGen.greekLetters()[planetcount];

                    var planet = new BodyPlanet(body.getX() + orbitDistance, body.getY(), 0, orbitDistance, body.uuid);

					this.spawnBody(planet);
                    planetcount++;
                }
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
		}
	}
	
	update(){
		
	}
}