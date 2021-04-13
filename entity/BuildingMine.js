class BuildingMine extends EntityBuilding {
	
	constructor(x,y,planetuuid, cityuuid, startindex, endindex){
		super(x,y,planetuuid, cityuuid, startindex, endindex);
		this.name = "Mine";
		this.productionItem = Items.ITEM_IRON;
	}
	
	getRelRenderPoints(){
	return [1.5,-1,1.5,-0.25,-1,-0.25,-1,-1,-0.5,-0.25,0,-1,0.5,-0.25,1,-1,1.5,-0.25,1.5,-1,-1,-1,-1,1,-1,0.25,1.5,0.25,1.5,1,-1,1,-0.5,0.25,0,1,0.5,0.25,1,1,1.5,0.25,-1,0.25,-1,-1,]};
}