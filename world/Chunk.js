class Chunk {
	constructor(x,y, world){
		this.x = x;
		this.y = y;
		this.bodies = {};
		this.world = world;
		
		var genx = world.CHUNK_DIM * (this.x + 0.5);
		var geny = world.CHUNK_DIM * (this.y + 0.5);
		
		var body = new EntityBody(genx, geny, 0, 130);
		this.spawnBody(body);
	}
	
	spawnBody(body){
		var uuid = Math.round(Math.random() * 10000000);
		body.uuid = uuid;
		this.bodies[uuid] = body;
	}
	
	update(){
		
	}
}