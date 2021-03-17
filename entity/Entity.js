class Entity {
	constructor(x, y, dir){
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.velocity = 0;
        this.ticksExisted = 0;
        this.grounded = false;
        this.name = "Entity";
        this.color = [ 255, 255, 255 ];
		this.filled = true;
        this.uuid = Math.round(Math.random() * 100000);
        this.rotSpeed = 0;
	}
	
	update() {
		
		this.dir += this.rotSpeed;
        this.x   += this.velocity * Math.cos(this.dir);
        this.y   += this.velocity * Math.sin(this.dir);
		
		this.ticksExisted++;
		cam_x = this.x; cam_y = this.y;
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
}