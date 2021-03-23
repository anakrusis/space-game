class World {
	constructor(){
		this.RESPAWN_INTERVAL = 100;
		
		this.chunks        = [];
		this.loadedChunksX = []; // a pair of X and Y coordinates of every loaded chunk
		this.loadedChunksY = [];
		this.entities      = {};
		
		this.player = new EntityPlayer(7500, 8192, 0)
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
		for (var chunk of this.getLoadedChunks()){
			
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
				b.update();
			}
		}
		
		if (this.worldTime - this.playerLastDeathTime == this.RESPAWN_INTERVAL){

            this.player = new EntityPlayer(7500,8192,0);
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
	
	getLoadedChunks(){
		var loadedchunks = [];
		for (var i = 0; i < this.loadedChunksX.length; i++){
			var chunkx = this.loadedChunksX[i]; var chunky = this.loadedChunksY[i];
			var cc = this.chunks[chunkx][chunky];
			loadedchunks.push(cc);
		}
		return loadedchunks;
	}
	
	loadChunk(chunkx, chunky){
		if (!this.chunks[chunkx]){
			this.chunks[chunkx] = [];
		}
		if (!this.chunks[chunkx][chunky]){
			this.chunks[chunkx][chunky] = new Chunk(chunkx, chunky);
		}
		this.loadedChunksX.push(chunkx);
		this.loadedChunksY.push(chunky);
	}
}