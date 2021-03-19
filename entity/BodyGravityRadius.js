class BodyGravityRadius extends EntityBody {
	constructor(x,y,dir,radius,dependentBody){
		super(x,y,dir,radius);
		this.dependentBody = dependentBody;
		this.rotSpeed = 0;
		this.filled = false;
		
	}
	
	getDependentBody() {
        return this.dependentBody;
    }
	
	update() {
        super.update();
        this.x = this.getDependentBody().getX();
        this.y = this.getDependentBody().getY();
    }
}