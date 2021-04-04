class BuildingBigTest extends EntityBuilding {
	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,planetuuid, cityuuid, startindex, endindex);
		this.name = "Big Building";
	}
	
	getRelRenderPoints(){
	return [1.5,-2,1.5,2,-1,2,-1,-2]};
}