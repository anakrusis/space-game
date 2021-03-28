class EntityBuilding extends Entity {
	constructor(x,y,dir){
		super(x,y,dir);
		this.name = "Building";
		this.filled = true;
		this.planetIndex = -1;
		this.planetUUID = null;
		this.cityUUID   = null;
	}
	
	getAbsolutePoints() {
        var relpoints = [
                -1, -1,
                1.5, -1,
                1.5, 1,
                -1, 1
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
		
		if (this.planetIndex > -1 && this.getGroundedBody() != null){
            this.moveToIndexOnPlanet(this.planetIndex, this.getGroundedBody());
        }
		this.ticksExisted++;
	}
}