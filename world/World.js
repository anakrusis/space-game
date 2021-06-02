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
		this.cities        = {};
		
		this.worldTime = 0;
	}
	
	init(){
		
		this.seed = Math.floor ( random() * 10000 );
		//this.seed = (2653);
		p5.prototype.randomSeed(this.seed);
		
		var homePlanet = this.findHomePlanet();
		homePlanet.makeLush(); homePlanet.explored = true;
/* 		var ocean = new BodyOcean(homePlanet.x,homePlanet.y,0,homePlanet.radius,homePlanet.uuid);
		homePlanet.hasOcean = true; homePlanet.oceanUUID = ocean.uuid;
		homePlanet.getChunk().spawnBody(ocean);
		homePlanet.explored = true; */
		
		//this.spawnEntity( new EntityOreVein(homePlanet.x, homePlanet.y, homePlanet.uuid, 24, 27) );
		
		var playerNation = new Nation(homePlanet.getChunk().x, homePlanet.getChunk().y, homePlanet.uuid);
		this.nations[playerNation.uuid] = playerNation;
		
		var capitalCity = homePlanet.spawnCity( playerNation );
		playerNation.cityUUIDs.push(capitalCity.uuid);
		playerNation.capitalCityUUID = capitalCity.uuid;
		
		// Other nations
		for (var i = 0; i < 4; i++){
			
			var nat = new Nation(homePlanet.getChunk().x, homePlanet.getChunk().y, homePlanet.uuid);
			this.nations[nat.uuid] = nat;
		
			var natcap = homePlanet.spawnCity( nat );
			nat.cityUUIDs.push(natcap.uuid);
			nat.capitalCityUUID = natcap.uuid;
			
			var ship = new EntityShip(7500, 8192, 0);
			ship.nationUUID = nat.uuid;
			if ( this.cities[natcap.uuid] ){
				ship.moveToSpawnPoint(); this.spawnEntity(ship);
			}
		}
		
		// Generates player now
		this.player = new EntityPlayer(7500, 8192, 0)
		this.player.nationUUID = playerNation.uuid;
		this.spawnEntity( this.player );
		
		//this.player.inventory.add( new ItemStack( Items.ITEM_IRON, 4 ) );
		
	}
	
	// This function works by searching for planets within a 50 degree difference of the ideal temperature, i.e. ~15C
	// If there are no planets which match this criterion within a chunk, it will move onto the chunk next to it.
	
	findHomePlanet(){
		var cx = 0; var cy = 0;
		while (true){
			this.loadChunk(cx,cy);
			var chunk = this.chunks[cx][cy];
			
			var idealTemp = 288 // almost 15 deg celcius
			var nearestPlanet = null;
			var nearestDiff;
			
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
					
				if (b instanceof BodyPlanet){ 
					
					if (nearestPlanet){
						var diff = Math.abs( idealTemp - b.temperature );
						if (diff < nearestDiff){
							
							nearestPlanet = b;
							nearestDiff = diff;
						}
						
					}else{
						nearestPlanet = b;
						nearestDiff = Math.abs( idealTemp - b.temperature );
					}
				}
			}
			if (nearestPlanet && nearestDiff < 50){
				return nearestPlanet;
			}
			
			cx += 1;
		}
	}
	
	spawnEntity(entity){
		this.entities[entity.uuid] = entity;
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
				//if (b == this.getPlayer().getNearestBody()){
				b.update();
				//}
			}
		}
		// The reason the first two ticks have no city updates is so that the planets can be situated into place
		// otherwise mission will give incorrect distances between locations
		if (this.worldTime > 2){
			for (var uuid in this.cities){
				this.cities[uuid].update();
			}
		}
		
		if (this.worldTime - this.playerLastDeathTime == this.RESPAWN_INTERVAL){
			
			selectedEntity = null;
			this.player.dead = false; this.player.velocity = 0; 
			this.player.boostForce = new ForceVector(0,0); this.player.forceVectors = [];
			
			this.player.moveToSpawnPoint();
			
			if (this.player.currentMission){
				this.player.currentMission.onFail();
			}
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
	
	getChunk(x,y){
		if (this.chunks[x]){
			if (this.chunks[x][y]){
				return this.chunks[x][y];
			}
		}
		return false;
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