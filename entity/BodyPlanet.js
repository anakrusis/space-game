class BodyPlanet extends EntityBody {
	constructor(x,y,dir,orbitDistance,starUUID){
		super(x, y, dir, RandomUtil.fromRangeF(256,1024));
		
		// Core properties
		this.name = Nymgen.newName();
		this.color = [RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255)];
		this.terrainSize = Math.round(this.radius * (40/16)); this.terrainSize -= (this.terrainSize % 64);
		this.tiles = [];
		this.generateTerrain();
		this.hasOcean  = false;
		
		// Physics properties
		this.canEntitiesCollide = true;
		this.rotSpeed = RandomUtil.fromRangeF(0.00004,0.00010);
		this.orbitDistance = orbitDistance;
        this.orbitPeriod = 300 * orbitDistance; //RandomUtil.fromRangeI(7000000, 20000000);
		this.orbitStart =  RandomUtil.fromRangeF(0, Math.PI * 2);
        this.orbitAngle = this.orbitStart;
		
		// Referential properties
		this.starUUID = starUUID;
		//this.buildingUUIDs = []; // the index into this object/array matches the terrain position of building
		this.oceanUUID = null;
		
		this.populateOreVeins();
	}
	
	update(){
		super.update();
		
		this.orbitAngle += (Math.PI * 2) / this.orbitPeriod;
        this.x = rot_x(this.orbitAngle, this.orbitDistance,0) + this.getStar().getX();
        this.y = rot_y(this.orbitAngle, this.orbitDistance, 0) + this.getStar().getY();
	}
	
	generateTerrain(){
		this.terrain = [];
		var octaves = [];
		
		octaves.push( this.fillOctave( this.terrainSize, 64, 64 ) );
		octaves.push( this.fillOctave( this.terrainSize, 32, 32 ) );
		octaves.push( this.fillOctave( this.terrainSize, 16, 8 ) );
		octaves.push( this.fillOctave( this.terrainSize, 8,  4 ) );
		octaves.push( this.fillOctave( this.terrainSize, 4,  2 ) );
		octaves.push( this.fillOctave( this.terrainSize, 2,  1 ) );
		
		for (var i = 0; i < this.terrainSize; i++){
			var octsum = 0;
			for (var j = 0; j < octaves.length; j++){
			
				octsum += octaves[j][i];
			
			}
			this.terrain.push( octsum ); 
			
			// now creating the tile for the planet
			var tile = new Tile( i, octsum );
			this.tiles.push(tile);
		}
		
		var noise2;
		

	}
	// len: length of array to fill with a perlin noise octave
	// scale: which octave
	// coeff: random range (-1 to 1)*coeff
	fillOctave(len, scale, coeff){
		var out = []
		for (var i = 0; i < len / scale; i++){
			var val = RandomUtil.fromRangeF(-coeff,coeff);
			for (var j = 0; j < scale; j++){
				out.push ( val );
			}
        }
/* 		for (var i = 0; i < len; i++){
			if ( i % 16 >= 8 ){ out.push(3); } else{ out.push(0); }
		} */
		
		out.push( out[0] );
		
		for (var i = 0; i < len; i += scale){
			
			var val1 = out[i]; var val2 = out[i+scale]
			
			for (var j = 0; j < scale; j++){
				
				var t = (j/scale);
				
				out[i+j] = this.lerp(val1, val2, t);
			}
        }
		
		return out;
	}
	
	populateOreVeins(){
		var oreveinscount = RandomUtil.fromRangeI(5,20);
		for (var i = 0; i < 10; i++){
			var pos = RandomUtil.fromRangeI(0,this.terrainSize); var end = pos + RandomUtil.fromRangeI(1,5)
			var e = new EntityOreVein(this.x, this.y, this.uuid, pos, end);
			//server.worldworld.spawnEntity( e );
			
			for (var j = e.startindex; j <= end; j++){
				
				var index = loopyMod(j, this.terrainSize);
				
				this.tiles[index].oreVeinUUID = e.uuid;
			}
		}
	}
	
	// returns the city if it can do it, else returns false.
	spawnCity(nation){
		var cityPlaceAttempts = 30;
		var city = new City(nation.uuid, this.getChunk().x, this.getChunk().y, this.uuid );

		var cityRadius;

		// The first part tries to reserve the neccessary amount of space to place the city
		// based from a center point outwards in a certain number of tiles
		for (var a = 0; a < cityPlaceAttempts; a++){
			
			var cityCenterIndex = RandomUtil.fromRangeI(0, this.terrainSize);
			cityRadius = 8;
			
			var cityCenterValid = true;
			for (var i = -cityRadius; i <= cityRadius; i++){
				
				var relIndex = loopyMod((cityCenterIndex + i), this.terrainSize);
				var tile = this.tiles[relIndex];
				
				// Tiles under sea level ( or very close to sea level ) cannot be part of a city. 
				if (tile.height <= 0.1){
					cityCenterValid = false; break;
				}
				
				// Tiles which already have buildings on them cannot be part of a city
				if (tile.buildingUUID != null){
					cityCenterValid = false; break;
				}
			}
			
			if (cityCenterValid){
				break;
			}
		}
		// This is what happens if all the tries fail and no city could be placed..
		if (!cityCenterValid){
			return false;
		}
		
		// The spaceport is always the first one placed because, it has to spawn no matter what.
		var newbuilding = new BuildingSpaceport( this.x, this.y, this.uuid, city.uuid, cityCenterIndex, cityCenterIndex + 4);
		this.spawnBuilding( newbuilding, city );
		
		for (var i = -cityRadius; i <= cityRadius; i++){
			
			var relIndex = loopyMod((cityCenterIndex + i), this.terrainSize);
			
			var newbuilding;
			if (i == 0){
				
				// Spaceport already done above
				
			}else if (i == 1){
				var ei = loopyMod(relIndex + 1, this.terrainSize);
				newbuilding = new BuildingBigTest( this.x, this.y, this.uuid, city.uuid, relIndex, ei);
				
			}else{
				
				if (this.tiles[relIndex].oreVeinUUID != null){
					newbuilding = new BuildingMine( this.x, this.y, this.uuid, city.uuid, relIndex, relIndex);
				}else{
					newbuilding = new BuildingFarm( this.x, this.y, this.uuid, city.uuid, relIndex, relIndex + 1);
				}					
			}
			this.spawnBuilding( newbuilding, city );
			
			this.tiles[relIndex].hasRoad = true;
		}
		city.centerIndex = cityCenterIndex;
		server.world.cities[city.uuid] = city;
		return city;
	}
	
	spawnBuilding(building, city){
		if (building.endindex >= this.terrainSize){
			building.endindex -= this.terrainSize;
		}
		
		if (this.tiles[building.startindex].buildingUUID == null){
			
			var ende = building.endindex;
			if (building.endindex < building.startindex){
				ende += this.terrainSize;
			}
			
			for (var i = building.startindex; i <= ende; i++){
				
				var index = loopyMod(i, this.terrainSize);
				
				this.tiles[index].buildingUUID = building.uuid;
			}
			building.grounded = true;
            building.groundedBodyUUID = this.uuid;

            building.moveToIndexOnPlanet(building.startindex, this, 1);
			server.world.spawnEntity(building);
			
			if (city){
				city.registerBuilding(building);
			}
			return true;
		}
		return false;
	}
	
	// This is from the page https://en.wikipedia.org/wiki/Linear_interpolation
	lerp(v0, v1, t) {
		return (1 - t) * v0 + t * v1;
	}
	
	getStar(){
		return this.getChunk().bodies[this.starUUID];
	}
	
	getOrbitAngle(){ return this.orbitAngle; }
	
	getOrbitPeriod(){ return this.orbitPeriod; }
	
	getOrbitDistance(){ return this.orbitDistance; }
}