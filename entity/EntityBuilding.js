class EntityBuilding extends Entity {
	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,0);
		this.name = "Building";
		this.filled = false;
		this.startindex = startindex;
		this.endindex   = endindex;
		this.planetUUID = planetuuid;
		this.cityUUID   = null;
	}
	
	// Number of tiles between start and end tile indexes (accounts for wrap-around)
	getSize(){
		var ende = this.endindex;
		if (this.endindex < this.startindex){
			ende += this.getPlanet().terrainSize;
		}
		return 1 + (ende - this.startindex);
	}
	
	getPlanet(){
		return this.getChunk().getBody(this.planetUUID);
	}
	
	getCity(){
		return server.world.cities[this.cityUUID];
	}
	
	getRelRenderPoints(){
		return [
				-1, -1,
				1.5, -1,
				1.5, 1,
				-1, 1
		]
	}
	
	getRenderPoints() {
		var relpoints = this.getRelRenderPoints();
		
		var abspoints = [];
        for (var i = 0; i < relpoints.length; i += 2){
            abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
            abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
        }
        return abspoints;
	}
	
	getAbsolutePoints() {
		
        var relpoints = [
                -1, -1 * this.getSize(),
                1.5, -1 * this.getSize(),
                1.5, 1 * this.getSize(),
                -1, 1 * this.getSize()
        ]
        var abspoints = [];
        for (var i = 0; i < relpoints.length; i += 2){
            abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
            abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
        }
        return abspoints;
    }
	
	update(){
		if (this.cityUUID){
			var city = server.world.cities[this.cityUUID];
			var nation = server.world.nations[city.nationUUID];
			this.color = nation.color;
		}
		
		var ende = this.endindex;
		if (this.endindex < this.startindex){
			ende += this.getPlanet().terrainSize;
		}
		var middleindex = ( (ende + this.startindex) / 2 ); 
		middleindex = loopyMod(middleindex, this.getPlanet().terrainSize);
		
		if (this.startindex > -1 && this.getGroundedBody() != null){
            this.moveToIndexOnPlanet(middleindex, this.getGroundedBody(), 1);
        }
		this.ticksExisted++;
	}
	
	isOnScreen(){
		return super.isOnScreen() && cam_zoom > MAX_INTERPLANETARY_ZOOM;
	}
}