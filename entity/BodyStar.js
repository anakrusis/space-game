class BodyStar extends EntityBody {
	
	constructor(x,y,dir){
		super(x,y,dir,1500);
		
		this.rotSpeed = 0.01;
		this.canEntitiesCollide = true;
		this.name = Nymgen.newName();
	}
}