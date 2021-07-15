class BuildingSpaceport extends EntityBuilding {

	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,planetuuid, cityuuid, startindex, endindex);
		this.name = "Spaceport Hangar";
		this.size = 5;
	}

getRelRenderPoints(){
return [-2.5,-5.75,-1,-5.75,-1,5.75,-2.5,5.75,-2.5,-5.75,2.5,-5.75,2.5,5.75,-1,5.75,-2.5,5.75,-2.5,-5.75,2.5,-5.75,3.75,-2.75,4.25,-0.25,4.25,0.25,3.75,3.25,2.75,5.75,-2.5,5.75,]};
}