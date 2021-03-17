class World {
	constructor(){
		this.CHUNK_DIM    = 4096; // both width and height of the chunks are equal. this could technically be very large.
		
		this.chunks       = [];
		this.loadedChunks = [];
		this.entities     = {};
		
		// temporarily pushing a single loaded chunk into the arrays
		this.chunks[0] = [];
		this.chunks[0][0] = new Chunk(0,0);
		this.loadedChunks.push(this.chunks[0][0]);
		
		this.player = new EntityPlayer(0, 0, 0)
		this.spawnEntity( this.player );
		
		this.worldTime = 0;
	}
	
	spawnEntity(entity){
		var uuid = Math.round(Math.random() * 100000);
		entity.uuid = uuid;
		this.entities[uuid] = entity;
	}
	
	update(){
		
		for ( var uuid in this.entities ){
			var e = this.entities[uuid];
			e.update();
		}
		
		this.worldTime++;
		
	}
	// temporary single player function
	getPlayer(){
		for ( var uuid in this.entities ){
			var e = this.entities[uuid];
			if (e instanceof EntityPlayer){
				return e;
			}
		}
		return null;
	}
}