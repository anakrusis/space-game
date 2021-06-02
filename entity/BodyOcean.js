class BodyOcean extends EntityBody {
	constructor(x,y,dir,radius,dependentBodyUUID){
		super(x,y,dir,radius);
		this.dependentBodyUUID = dependentBodyUUID;
		this.filled = true;
		this.name = "Ocean";
		this.renderPriority = 1;
		
		this.terrainSize = 64;
		this.terrain = [];
		for (var i = 0; i < this.terrainSize; i++){
			this.terrain.push(0);
		}
	}
	
	getDependentBody() {
        return this.getChunk().bodies[this.dependentBodyUUID];
    }
	
	update() {
        super.update();
        this.x = this.getDependentBody().getX();
        this.y = this.getDependentBody().getY();
		
		if (this.getDependentBody().temperature > 273.15){
			// liquid ocean
			this.canEntitiesCollide = false;
			this.rotSpeed = 0.001;
			this.color = [0, 30, 80];
		}else{
			// frozen ocean
			this.canEntitiesCollide = true;
			this.rotSpeed = 0;
			this.color = [192, 192, 255];
		}
    }
}