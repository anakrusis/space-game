class BodyOcean extends EntityBody {
	constructor(x,y,dir,radius,dependentBodyUUID){
		super(x,y,dir,radius);
		this.dependentBodyUUID = dependentBodyUUID;
		this.rotSpeed = 0.01;
		this.filled = true;
		this.name = "Ocean";
		this.color = [0, 30, 80];
		
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
    }
}