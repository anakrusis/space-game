class BodyPlanet extends EntityBody {
	constructor(x,y,dir,radius,orbitDistance,starUUID){
		super(x, y, dir, radius);
		
		// Core properties
		this.name = Nymgen.newName();
		this.descriptor = "planet";
		this.icon = "🪐"
		//this.color = [192,192,192];
		
		var dirthue = RandomUtil.fromRangeF(0,0.1);
		var dirtsat = RandomUtil.fromRangeF(-0.3,0.5);
		var dirtlig = RandomUtil.fromRangeF(0.2,0.5);
		
		this.color = RandomUtil.hslToRgb(dirthue, dirtsat, dirtlig);
		this.hasDynamicScale = true;
		
		//var v = Math.pow(this.radius, 2)
		//this.terrainSize = Math.round(v * (1/192));
		this.terrainSize = Math.round(this.radius * (40/16));
		//console.log(this.terrainSize);
		this.terrainSize -= (this.terrainSize % 64);
		//this.radius = this.terrainSize / (40/16)
		this.tiles = [];
		this.roads = [];
		this.densities = [];
		this.generateTerrain();
		this.hasOcean  = false;
		this.initLOD();
		
		// Physics properties
		this.canEntitiesCollide = true;
		this.rotSpeed = RandomUtil.fromRangeF(0.00004,0.00010);
		this.orbitDistance = orbitDistance;
        this.orbitPeriod = 300 * orbitDistance; //RandomUtil.fromRangeI(7000000, 20000000);
		this.orbitStart =  RandomUtil.fromRangeF(0, Math.PI * 2);
        this.orbitAngle = this.orbitStart;
		
		// Referential properties
		this.starUUID = starUUID;
		this.oceanUUID = null;
		this.gravUUID = null;
		
		this.temperature = ( 10000000000000000 / ( Math.pow( (this.orbitDistance * 90), 2 ) ) ) ;
		this.calculateHumidity();
		
		//this.populateOreVeins();
	}
	
	initLOD(){
		this.forms = [[]];
		
		for (var i = 0; i < this.terrainSize; i++){
			var angle = 0 + (i * (2 * Math.PI) / this.terrainSize);

			var pointx = rot_x(angle, this.radius + this.terrain[i], 0.0);
			var pointy = rot_y(angle, this.radius + this.terrain[i], 0.0);
			
			this.forms[0].push(pointx); this.forms[0].push(pointy);
		}
		
		for (var j = 1; j <= 8; j++){
			this.forms[j] = this.LODPass( this.forms[j-1] );
		}
	}
	
	calculateHumidity(){
		var wetTiles = 0; var dryTiles = 0;
		
		for (i = 0; i < this.terrainSize; i++){
			
			if (this.tiles[i].height > 0){
				dryTiles++;
			}else{
				wetTiles++;
			}
		}
		this.waterratio = wetTiles / this.terrainSize;
		if (!this.hasOcean){ this.humidity = 0; return; }
		this.humidity = this.waterratio;
	}
	
	makeLush(){
		
		this.hasOcean  = true;
		var ocean = new BodyOcean(this.x,this.y,0,this.radius,this.uuid);
		this.oceanUUID = ocean.uuid;
		this.getChunk().spawnBody(ocean);
		
		this.calculateHumidity();
		
		var hue = 0.15 + (this.humidity * 0.40);
		
		var grassPrevalence = 1 - (Math.abs( this.temperature - 288 ) / 40);
		grassPrevalence = Math.max(0,grassPrevalence);
		
		this.grassColor = RandomUtil.hslToRgb( hue, 0.9, 0.4 );
		
		var r = (this.grassColor[0] * grassPrevalence) + (this.color[0] * (1 - grassPrevalence));
		var g = (this.grassColor[1] * grassPrevalence) + (this.color[1] * (1 - grassPrevalence));
		var b = (this.grassColor[2] * grassPrevalence) + (this.color[2] * (1 - grassPrevalence));
		
		this.color = [r,g,b];
		
		//this.populateOreVeins();
		
		//var r = (grassColor[0] + this.color[0]) / 2;
		//var g = (grassColor[0] + this.color[0]) / 2;
		//var b = (grassColor[0] + this.color[0]) / 2;
	}
	
	render(){
		
		if ( cam_zoom < MAX_INTERPLANETARY_ZOOM ){
			var orbitbody = new EntityBody(this.getStar().x, this.getStar().y, 0, this.getOrbitDistance());
			orbitbody.color = [0, 128, 0]; orbitbody.filled = false;
			orbitbody.render();
		}
		
		super.render();
		if (cam_zoom > MAX_INTERPLANETARY_ZOOM){
			this.drawRoads();
		}
	}
	
	drawRoads(){
		stroke(128);
		strokeWeight(0.5 * cam_zoom);
		for (var i = 0; i < this.terrainSize; i++){
			if (this.tiles[ i ].hasRoad){
				beginShape();
				var slice = this.getAbsPointsSlice( i, i );
				vertex(tra_rot_x(slice[0],slice[1]), tra_rot_y(slice[0],slice[1])); 
				
				vertex(tra_rot_x(slice[2],slice[3]), tra_rot_y(slice[2],slice[3]));
				endShape(CLOSE);
			}
		}
		strokeWeight(1);
	}
	
	LODPass( points ){
		
		var points2 = [];
		
		for (var i = 0; i < points.length; i++){
			points2[i] = points[i];
		}
		points = points2;
		
		// This prevents small bodies from ending up with a 2-point or 3-point LOD form.
		if (points.length <= 16){ return points; }
		
		var amt = 4
		for (var i = 2; i < points.length; i += amt){
			
			points[i] = 0;
			points[i+1] = 0;
			//points.splice(i, amt);
			
			for (var j = 0; j < amt; j++){
				
				//points[i + j] = 0;
				//points[i + j + 1] = 0;
			}
			
			//console.log(i);
		}
		for (var i = 2; i < points.length; i++){
			
			if ( points[i] == 0 ){
				
				points.splice(i, 2);
			}
		}
		return points;
	}
	
	getRenderPoints(){
		var index = server.world.getPlayer().terrainIndex;
		
		var fov = Math.round ( 500 / cam_zoom ); var half = Math.floor(this.terrainSize / 2);
		//fov = Math.min(fov, half);
		
		if ( fov > this.terrainSize / 2 ) { 
		
			var points = this.getLODPoints();
		
		}else{
			
			// This removes the remainder from the start and end indices of the "pizza slice" of terrain to draw
			// If the remainder is left on, then the terrain appears to "tremble" or "bubble" due to the resampling caused by the LOD function immediately afterwards
			
			var exp = Math.pow(2, lod);
			var start = ( index - fov ) - ((index - fov) % exp);
			var finsh = ( index + fov ) - ((index + fov) % exp);
			
			var points = this.getLODSlice( start, finsh, 0 );
			points.unshift( this.y ); points.unshift( this.x ); 
		
		}
		
		return points;
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
			this.roads.push[false];
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
			var pos = RandomUtil.fromRangeI(0,this.terrainSize); var end = pos + RandomUtil.fromRangeI(1,5);
			var ent = new EntityOreVein(this.x, this.y, this.uuid, pos, end);
			server.world.spawnEntity( ent );
			
			for (var j = ent.startindex; j <= end; j++){
				
				var index = loopyMod(j, this.terrainSize);
				
				this.tiles[index].oreVeinUUID = ent.uuid;
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
			
			// The radius starts at a high value and goes down as more city placing attempts are made until it reaches a low value.
			// This way there can be almost always found a place to put a city between sizes of 8 and 24
			
			var attemptratio = 1.0 - (a / cityPlaceAttempts);
			cityRadius = Math.round(16 * (attemptratio) + 8);
			
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
		var newbuilding = new BuildingSpaceport( this.x, this.y, this.uuid, city.uuid, cityCenterIndex, this.terrainSize);
		this.spawnBuilding( newbuilding, city );
		
		for (var i = -cityRadius; i <= cityRadius; i++){
			
			var relIndex = loopyMod((cityCenterIndex + i), this.terrainSize);
			this.densities[relIndex] = RandomUtil.fromRangeI(1,10);
			
			var newbuilding;
			if (i == 0){
				
				// Spaceport already done above
				
			}else if (i == 1){
				var ei = loopyMod(relIndex + 1, this.terrainSize);
				newbuilding = new BuildingBigTest( this.x, this.y, this.uuid, city.uuid, relIndex, this.terrainSize);
				
			}else{
				
				if (this.tiles[relIndex].oreVeinUUID != null){
					newbuilding = new BuildingMine( this.x, this.y, this.uuid, city.uuid, relIndex, this.terrainSize);
				}else{
					
					var dist = this.terrainIndexDistance( relIndex, cityCenterIndex + 2 );
					var probability = 4 / dist;
					
					if ( random() < probability ){
						
						newbuilding = new BuildingHouse( this.x, this.y, this.uuid, city.uuid, relIndex, this.terrainSize, "housesmall1");
						this.densities[relIndex] += RandomUtil.fromRangeI(5,20);
						
					}else{
						
						newbuilding = new BuildingFarm( this.x, this.y, this.uuid, city.uuid, relIndex, this.terrainSize);
						
					}
				}					
			}
			if (this.terrainIndexDistance(relIndex,cityCenterIndex + 2) < 5){
				this.densities[relIndex] += RandomUtil.fromRangeI(20,100);
			}
			
			this.spawnBuilding( newbuilding, city );
			
			this.tiles[relIndex].hasRoad = true;
			this.roads[relIndex] = true;
		}
		
		city.centerIndex = (cityCenterIndex + 2) % this.terrainSize; // the spaceport is 5 tiles wide so this centers it
		server.world.cities[city.uuid] = city;
		
		//city.addPopulation( RandomUtil.fromRangeI(10,100) );
		
/* 		var age = RandomUtil.fromRangeI(100,1000);
		for (var i = 0; i < age; i++){
			var lastfood = city.resources.totalAmount("food");
			
			city.updateTime = 0;
			city.update();
			
			var currentfood = city.resources.totalAmount("food");
			var diff = Math.abs(lastfood - currentfood);
			
			city.resources.add( new ItemStack( "food", diff ) );
		} */
		
		return city;
	}
	
	removeBuilding(building){
		if (building instanceof BuildingSpaceport){ return false; }
		
		var ende = building.endindex;
		if (building.endindex < building.startindex){
			ende += this.terrainSize;
		}
		
		for (var i = building.startindex; i <= ende; i++){
			
			var index = loopyMod(i, this.terrainSize);
			
			this.tiles[index].buildingUUID = null;
		}
		building.dead = true;
		
		var city = building.getCity(); //console.log(building.uuid);
		var uuidIndex = city.buildingUUIDs.indexOf(building.uuid); 
		city.buildingUUIDs.splice(uuidIndex,1);
	}
	
	spawnBuilding(building, city){
		if (building.endindex >= this.terrainSize){
			building.endindex -= this.terrainSize;
		}
		
		if (this.tiles[building.startindex].buildingUUID){ return false; }
			
		var ende = building.endindex;
		if (building.endindex < building.startindex){
			ende += this.terrainSize;
		}
		
		for (var i = building.startindex; i <= ende; i++){
			
			var index = loopyMod(i, this.terrainSize);
			
			this.tiles[index].buildingUUID = building.uuid;
			this.tiles[index].hasRoad = true;
			this.roads[index] = true;
			
			if (city){
				this.tiles[index].cityUUID = city.uuid;
			}
		}
		building.grounded = true;
		building.groundedBodyUUID = this.uuid;

		building.moveToIndexOnPlanet(building.startindex, this, 1);
		server.world.spawnEntity(building);
		
		if (city){
			city.registerBuilding(building);
			var nation = server.world.nations[city.nationUUID];
			building.color = nation.color;
		}
		return true;
	}
	
	isIndexLeftOfIndex(index1, index2){
		var rightDiff = loopyMod(index2 - index1, this.terrainSize);
		var leftDiff  = loopyMod(index1 - index2, this.terrainSize);
		
		return (leftDiff > rightDiff);
	}
	
	terrainIndexDistance(index1, index2) {		
		var rightDiff = loopyMod(index2 - index1, this.terrainSize);
		var leftDiff  = loopyMod(index1 - index2, this.terrainSize);
		
        return Math.min( Math.abs(leftDiff), Math.abs(rightDiff));
		
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