class EntityBuilding extends Entity {
	constructor(x,y,planetuuid, cityuuid, startindex, terrsize, bldgsize){
		super(x,y,0);
		this.name = "Building";
		this.template = null; // Many buildings, like the spaceport, have only a single form and accept no template
		
		this.filled = false;
		this.renderPriority = 2;
		this.size = bldgsize; if (!this.size){ this.size = 1; }
		
		this.startindex = startindex;
		this.endindex   = loopyMod(startindex + this.size - 1, terrsize);
		this.planetUUID = planetuuid;
		this.cityUUID   = null;
		
		this.productionTime = -1;
		this.productionProgress = -1;
		this.productionItem = null;
	}
	
	getChunk(){
		return this.getCity().getChunk();
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
		
		if (!buildingDrawEnabled){
			return this.getAbsolutePoints();
		}
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
                -1 * this.getSize(), -1 * this.getSize(),
                1.5 * this.getSize(), -1 * this.getSize(),
                1.5 *  this.getSize(), 1 * this.getSize(),
                -1 *  this.getSize(), 1 * this.getSize()
        ]
        var abspoints = [];
        for (var i = 0; i < relpoints.length; i += 2){
            abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
            abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
        }
        return abspoints;
    }
	
	update(){
		
		if (this.productionTime == -1 && this.productionItem){
			this.productionTime = Math.round((2*Math.PI) / this.getPlanet().rotSpeed / 10);
			this.productionProgress = Math.round(random() * this.productionTime);
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
		
		if (this.productionItem){
			this.productionProgress++;
			
			if (this.productionProgress == this.productionTime){
				
				var itemstack = new ItemStack(this.productionItem, 1);
				this.getCity().resources.add( itemstack );
				this.getCity().updateMissions();
				
				this.productionProgress = 0;
			}
			
		}
	}
	
	isIndexInBuilding(index){
		
		var terrsize = this.getPlanet().terrainSize;
		var ende = this.endindex;
		if (this.endindex < this.startindex){
			ende += terrsize;
		}
		for (var i = this.startindex; i <= ende; i++){
			
			var ind = loopyMod(i,terrsize);
			if (ind == index){
				return true;
			}
		}
		return false;
		
	}
	
	isOnScreen(){
		// && buildingDrawEnabled
		return super.isOnScreen() && cam_zoom > MAX_INTERPLANETARY_ZOOM;
	}
}