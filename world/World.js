class World {
	constructor(){
		this.CHUNK_DIM        = 4096; // both width and height of the chunks are equal. this could technically be very large.
		this.RESPAWN_INTERVAL = 100;
		
		this.chunks       = [];
		this.loadedChunks = [];
		this.entities     = {};
		
		// temporarily pushing a single loaded chunk into the arrays
		this.chunks[0] = [];
		this.chunks[0][0] = new Chunk(0,0, this);
		this.loadedChunks.push(this.chunks[0][0]);
		
		this.player = new EntityPlayer(1900, 2000, 0)
		this.spawnEntity( this.player );
		
		this.worldTime = 0;
	}
	
	spawnEntity(entity){
		var uuid = Math.round(Math.random() * 10000000);
		entity.uuid = uuid;
		this.entities[uuid] = entity;
	}
	
	update(){
		
		for ( var uuid in this.entities ){
			var e = this.entities[uuid];
			
			if (e.isDead()){
				
				if (e instanceof EntityPlayer){
					this.playerLastDeathTime = this.worldTime;
				}
				
				delete this.entities[uuid];
			}else{
				e.update();
			}
		}
		for (var chunk of this.loadedChunks){
			
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
				b.update();
			}
		}
		
		if (this.worldTime - this.playerLastDeathTime == this.RESPAWN_INTERVAL){

            this.player = new EntityPlayer(1900,2000,0);
            this.spawnEntity(this.player);
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
	
	loadChunk(chunkx, chunky){
		if (!this.chunks[chunkx]){
			this.chunks[chunkx] = [];
		}
		if (!this.chunks[chunkx][chunky]){
			this.chunks[chunkx][chunky] = new Chunk(chunkx, chunky, this);
		}
		this.loadedChunks.push(this.chunks[chunkx][chunky]);
	}
}