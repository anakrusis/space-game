class BuildingBigTest extends EntityBuilding {
	constructor(x,y,planetuuid, cityuuid, startindex, teresize){
		super(x,y,planetuuid, cityuuid, startindex, teresize);
		this.name = "Big Building";
		this.size = 2;
	}
	
	getRelRenderPoints(){
	return [1.5,-2,1.5,2,-1,2,-1,-2]};
}