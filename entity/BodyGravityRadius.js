class BodyGravityRadius extends EntityBody {
	constructor(x,y,dir,radius,dependentBodyUUID){
		super(x,y,dir,radius);
		this.dependentBodyUUID = dependentBodyUUID;
		this.rotSpeed = 0;
		this.filled = false;
		this.name = "GravityRadius";
		//this.color = [20, 10, 20];
		
		this.renderPriority = 0;
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