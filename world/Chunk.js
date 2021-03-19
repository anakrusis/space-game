class Chunk {
	constructor(x,y, world){
		this.x = x;
		this.y = y;
		this.bodies = {};
		this.world = world;
		
		var genx = world.CHUNK_DIM * (this.x + 0.5);
		var geny = world.CHUNK_DIM * (this.y + 0.5);
		
		var body = new BodyStar(genx, geny, 0, 130);
		this.spawnBody(body);
		
		       // Every star gets potentially up to 4 planets
        var planetcount = 0;
        var orbitDistanceInterval = 240;
        var orbitVariance = 60;

        for (var uuid in this.bodies) {
			var body = this.bodies[uuid];
            if (body instanceof BodyStar) {
                var planetnum = orbitDistanceInterval * Math.floor(Math.random()*4 + 2) + orbitDistanceInterval;
                for (var planetdist = 2 * orbitDistanceInterval; planetdist < planetnum; planetdist += orbitDistanceInterval) {

                    //var orbitDistance = RandomUtil.fromRangeF(planetdist - orbitVariance, planetdist + orbitVariance);
					var orbitDistance = planetdist;

                    //String name = body.getName() + " " + NymGen.greekLetters()[planetcount];

                    var planet = new BodyPlanet(body.getX() + orbitDistance, body.getY(), 0, orbitDistance, body);

					this.spawnBody(planet);
                    planetcount++;
                }
            }
        }
	}
	
	spawnBody(body){
		var uuid = Math.round(Math.random() * 10000000);
		body.uuid = uuid;
		this.bodies[uuid] = body;
		
		if (body.canEntitiesCollide){
			
			var bgr = new BodyGravityRadius(body.x, body.y, body.dir, body.radius*3, body);
			this.spawnBody(bgr);
		}
	}
	
	update(){
		
	}
}