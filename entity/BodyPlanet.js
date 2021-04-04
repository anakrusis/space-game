class BodyPlanet extends EntityBody {
	constructor(x,y,dir,orbitDistance,starUUID){
		super(x, y, dir, RandomUtil.fromRangeF(256,1024));
		
		this.starUUID = starUUID;
		this.buildingUUIDs = []; // the index into this object/array matches the terrain position of building
		
		this.orbitDistance = orbitDistance;
        this.orbitPeriod = 300 * orbitDistance; //RandomUtil.fromRangeI(7000000, 20000000);
		
		this.rotSpeed = RandomUtil.fromRangeF(0.00004,0.00010)
        //this.rotSpeed = 0.000082;
		//this.rotSpeed = 2 * Math.PI / 60;
		
		this.color = [RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255), RandomUtil.fromRangeI(0,255)];
		
        this.canEntitiesCollide = true;

        this.terrainSize = Math.round(this.radius * (40/16)); this.terrainSize -= (this.terrainSize % 64);
		this.generateTerrain();
		
		this.orbitStart =  RandomUtil.fromRangeF(0, Math.PI * 2);
        this.orbitAngle = this.orbitStart;
		
		this.name = Nymgen.newName();
		
		this.hasOcean  = false;
		this.oceanUUID = null;
		
		var oreveinscount = RandomUtil.fromRangeI(0,10);
		for (var i = 0; i < 10; i++){
			var pos = RandomUtil.fromRangeI(0,this.terrainSize); var end = pos + RandomUtil.fromRangeI(1,5)
			var e = new EntityOreVein(this.x, this.y, this.uuid, pos, end);
			server.world.spawnEntity( e );
		}
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
	
	// will try to find a position on the planet as such:
	// randomly picks a center point. makes sure it has at least 5 consecutive tiles free in each direction.
	spawnCity(nation){
		var cityPlaceAttempts = 30;
		var city = new City(nation.uuid, this.getChunk().x, this.getChunk().y, this.uuid );
		
		for (var a = 0; a < cityPlaceAttempts; a++){
			
			var cityCenterIndex = RandomUtil.fromRangeI(0, this.terrainSize);
			
			var cityCenterValid = true;
			for (var i = -2; i <= 2; i++){
				
				var relIndex = loopyMod((cityCenterIndex + i), this.terrainSize);
				if (this.terrain[relIndex] <= 0){
					cityCenterValid = false;
					break;
				}
			}
			if (cityCenterValid){
				
				for (var i = -2; i <= 2; i++){
					
					var relIndex = loopyMod((cityCenterIndex + i), this.terrainSize);
					var newbuilding;
					if (i == 0){
						newbuilding = new BuildingSpaceport( this.x, this.y, 0);
					}else{
						newbuilding = new EntityBuilding( this.x, this.y, 0);
					}
					this.spawnBuilding( newbuilding, relIndex, city );
				}
				city.centerIndex = cityCenterIndex;
				server.world.cities[city.uuid] = city;
				return city;
			}
		}
	}
	
	spawnBuilding(building,index, city){
		if (this.buildingUUIDs[index] == null){
			this.buildingUUIDs[index] = building.uuid;
			building.grounded = true;
            building.groundedBodyUUID = this.uuid;
			building.planetIndex = index;

            building.moveToIndexOnPlanet(index, this, 1);
			server.world.spawnEntity(building);
			
			if (city){
				city.registerBuilding(building,index);
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