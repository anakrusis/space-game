class World {
	constructor(){
		this.RESPAWN_INTERVAL = 100;
		// This is kinda hacky; it means that the player initially spawns on the second game tick,
		// allowing the planets' positions in orbit to be initialized
		this.playerLastDeathTime = -99;
		
		this.chunks        = [];
		this.loadedChunksX = []; // a pair of X and Y coordinates of every loaded chunk
		this.loadedChunksY = [];
		this.entities      = {};
		this.nations       = {};
		
		var homePlanet = this.findHomePlanet();
		
		var playerNation = new Nation(0, 0, homePlanet.uuid);
		this.nations[playerNation.uuid] = playerNation;
		
		this.player = new EntityPlayer(7500, 8192, 0)
		this.player.nationUUID = playerNation.uuid;
		this.spawnEntity( this.player );
		
		this.worldTime = 0;
	}
	
	findHomePlanet(){
		var cx = 0; var cy = 0;
		while (true){
			this.loadChunk(cx,cy);
			var chunk = this.chunks[cx][cy];
			
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
				if (b instanceof BodyPlanet){ return b; }
			}
			cx += 1;
		}
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
					if (this.worldTime - this.playerLastDeathTime > this.RESPAWN_INTERVAL){
						this.playerLastDeathTime = this.worldTime;
					}
				}else{
					delete this.entities[uuid];
				}
				
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
			
			this.player.dead = false;
			this.player.boostForce = new ForceVector(0,0);
			
			var homenation = this.nations[this.player.nationUUID];
			var homeplanid = homenation.homePlanetUUID;
			var homechunkx = homenation.homeChunkX; var homechunky = homenation.homeChunkY;
			var homeplanet = this.chunks[homechunkx][homechunky].bodies[homeplanid];
			this.player.moveToIndexOnPlanet(0, homeplanet);
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
	
	copyPlayer(op,np){
		for (var attr in op){
			np[attr] = op[attr];
		}
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