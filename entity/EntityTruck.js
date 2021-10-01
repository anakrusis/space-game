class EntityTruck extends EntityShip {
	
	constructor(x, y, dir){
		super(x,y,dir);
		this.name = "Truck";
		this.currentIndex = null;
		this.targetIndex = null; // Will go to this place
		
		this.flip = false; // horizontal flip rendering
	}
	
	getRelRenderPoints(){
	return [0.25,-1,0.5,-1,0.75,-0.75,0.75,-0.5,1.25,-0.5,1.25,1,0.25,1,0.5,0.75,0.25,0.5,0.25,-0.5,0.5,-0.75,0.25,-1,NaN,NaN,0.25,-1,0,-0.75,0.25,-0.5,0.25,-1,NaN,NaN,0.25,0.5,0,0.75,0.25,1,0.25,0.5,NaN,NaN,]};
	
	getAbsolutePoints(){
		var relpoints = [0,-1,1,-1,1,1,0,1,0,-1]
        var abspoints = [];
        for (var i = 0; i < relpoints.length; i += 2){
            abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
            abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
        }
        return abspoints;
	}
	
	getRenderPoints() {
		
		if (!buildingDrawEnabled){
			return this.getAbsolutePoints();
		}
		var relpoints = this.getRelRenderPoints();
		
		var abspoints = [];
        for (var i = 0; i < relpoints.length; i += 2){
			if (this.flip){
				abspoints.push(rot_x(this.dir,relpoints[i],-relpoints[ i + 1 ]) + this.x);
				abspoints.push(rot_y(this.dir,relpoints[i],-relpoints[ i + 1 ]) + this.y);
			}else{
				abspoints.push(rot_x(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.x);
				abspoints.push(rot_y(this.dir,relpoints[i],relpoints[ i + 1 ]) + this.y);
			} 
        }
        return abspoints;
	}
	
	update(){
		if (this.nationUUID){
			this.color = this.getNation().color;
		}
		//super.update();
		var gb = this.getGroundedBody();
		this.dir = Math.atan2(this.y-gb.y, this.x-gb.x);
		
		if (!this.currentIndex){
			this.currentIndex = CollisionUtil.messyIndexFromEntityAngle(this,gb);
		}
		var currentClean = Math.floor(this.currentIndex);
		this.left = gb.isIndexLeftOfIndex( currentClean, this.targetIndex ); 
		if ( this.left ){
			this.currentIndex += 0.025;
			this.flip = true;
		}else{
			this.currentIndex -= 0.025;
			this.flip = false;
		}
		
		var build = gb.tiles[currentClean].getBuilding();
		if (build){
			var city = build.getCity();
			if ( build instanceof BuildingSpaceport && currentClean == this.targetIndex){
				this.dead = true;
				city.resources.combine(this.inventory);
			}
		}
		
		this.moveToIndexOnPlanet(this.currentIndex, gb, 0);
	}
}