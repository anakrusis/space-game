// Building template contains information regarding the structure of the building, the mid range of which a given tile density could most likely lead to its being built...
// These can be seen as like differing " species " of buildings, in the cases where the buildings have mostly the same behavior
class BuildingTemplate {
	constructor(){
		this.density = 50;
		this.size    = 1;
	}
}

class TemplateNone extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "none";
		this.density = 0.001;
		this.size = 1;
	}
}

// short 1 size house
class TemplateHouseSmall1 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 50;
		this.size = 1;
	}
	getRelRenderPoints(){
	return [-1,-1,0.5,-1,1.5,-0.5,0.5,0,-1,0,-1,-1,NaN,NaN,0.5,0,0.5,1,1.5,0.5,1.5,-0.5,0.5,0,NaN,NaN,-1,0,-1,0,0.5,0,0.5,1,-1,1,-1,0,NaN,NaN,-1,0.25,-0.25,0.25,-0.25,0.75,-1,0.75,NaN,NaN,-0.5,-0.75,-0.25,-0.75,-0.25,-0.25,-0.5,-0.25,-0.5,-0.75,NaN,NaN,0,-0.75,0.25,-0.75,0.25,-0.25,0,-0.25,0,-0.75,NaN,NaN,0.5,-0.75,1,-0.5,0.5,-0.25,0.5,-0.75,NaN,NaN,0,0.25,0.25,0.25,0.25,0.75,0,0.75,0,0.25,NaN,NaN,-1,-1,-1,1,-2.5,1,-2.5,-1,-1,-1,NaN,NaN,]};
}

// tall 1 size house
class TemplateHouseSmall2 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 150;
		this.size = 1;
	}
	getRelRenderPoints(){
	return [-1,-1,-1,1,-2.5,1,-2.5,-1,-1,-1,NaN,NaN,-1,1,2.5,1,3,0.25,2.5,-0.5,-1,-0.5,-1,1,NaN,NaN,2.5,-0.5,2.5,-1.25,3,-0.5,3,0.25,2.5,-0.5,NaN,NaN,3,0.25,3,0.5,2.5,1.25,2.5,1,3,0.25,NaN,NaN,-1,-1,-1,-0.5,2.5,-0.5,2.5,-1,-1,-1,NaN,NaN,-1,0,-0.25,0,-0.25,0.5,-1,0.5,-1,0,NaN,NaN,0,-0.25,0.5,-0.25,0.5,0,0,0,0,-0.25,NaN,NaN,0.5,0.5,0,0.5,0,0.75,0.5,0.75,0.5,0.5,NaN,NaN,0.75,-0.5,0.75,1,NaN,NaN,0.75,-0.5,0.75,-1,NaN,NaN,0,-0.75,0.5,-0.75,NaN,NaN,-0.25,-0.75,-0.75,-0.75,NaN,NaN,1,-0.25,1.5,-0.25,1.5,0,1,0,1,0,1,-0.25,NaN,NaN,1.5,0.5,1,0.5,1,0.75,1.5,0.75,1.5,0.5,NaN,NaN,1.75,-0.25,2.25,-0.25,2.25,0,1.75,0,1.75,-0.25,NaN,NaN,2.25,0.5,1.75,0.5,1.75,0.75,2.25,0.75,2.25,0.5,NaN,NaN,2.5,0,2.75,0.25,2.5,0.5,2.5,0,NaN,NaN,1,-0.75,1.5,-0.75,NaN,NaN,1.75,-0.75,2.25,-0.75,NaN,NaN,]};
	
	//getRelRenderPoints(){
	//return [-1,-1,0.75,-1,0.75,1,-1,1,-1,-1,NaN,NaN,0.75,-1,2.5,-1,2.5,1,0.75,1,NaN,NaN,2.25,-1.25,3,-0.5,3.25,0,3,0.5,2.25,1.25,3,0.5,3.25,0,3,-0.5,NaN,NaN,2.75,-0.25,3,0,2.75,0.25,3,0,2.75,-0.25,NaN,NaN,2.25,-0.75,1.75,-0.75,1.75,-0.75,1.75,-0.5,2.25,-0.5,2.25,-0.75,NaN,NaN,2.25,0.5,1.75,0.5,1.75,0.5,1.75,0.75,2.25,0.75,2.25,0.5,NaN,NaN,2.25,-0.25,1.75,-0.25,1.75,0.25,2.25,0.25,2.25,-0.25,NaN,NaN,1.5,-0.75,1,-0.75,1,-0.5,1.5,-0.5,1.5,-0.75,NaN,NaN,1.5,-0.25,1,-0.25,1,0.25,1.5,0.25,1.5,-0.25,NaN,NaN,1.5,0.5,1,0.5,1,0.5,1,0.75,1.5,0.75,1.5,0.5,NaN,NaN,0.5,-0.75,0,-0.75,-0,-0.5,0.5,-0.5,0.5,-0.75,NaN,NaN,0.5,-0.25,-0,-0.25,-0,0.25,0.5,0.25,0.5,-0.25,NaN,NaN,0.5,0.5,-0,0.5,-0,0.5,-0,0.75,0.5,0.75,0.5,0.5,NaN,NaN,-1,-0.25,-0.5,-0.25,-0.5,0.25,-1,0.25,NaN,NaN,-0.25,0.5,-0.75,0.5,-0.75,0.75,-0.25,0.75,-0.25,0.5,NaN,NaN,-0.25,-0.75,-0.75,-0.75,-0.75,-0.5,-0.25,-0.5,-0.25,-0.75,NaN,NaN,]};
}

class TemplateHouseMedium1 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 50;
		this.size = 2;
	}
	getRelRenderPoints(){
	return [-1,-1.5,0.75,-1.5,1.5,-0.75,0.75,0,0.75,1.5,-1,1.5,-1,-1.5,NaN,NaN,1.5,-0.75,1.5,1,0.75,1.75,0.75,1.5,0.75,0,1.5,-0.75,NaN,NaN,0.75,0,-1,0,0.75,0,NaN,NaN,-1,-1,-0.5,-1,-0.5,-0.5,-1,-0.5,NaN,NaN,0.5,-1.25,0,-1.25,0,-1.25,0,-1,0.5,-1,0.5,-1.25,NaN,NaN,0.5,-0.5,0,-0.5,0,-0.5,0,-0.25,0.5,-0.25,0.5,-0.5,NaN,NaN,0.5,0.25,0,0.25,0,0.5,0.5,0.5,0.5,0.25,NaN,NaN,0.5,1,0,1,0,1.25,0.5,1.25,0.5,1,NaN,NaN,-0.25,0.25,-0.75,0.25,-0.75,0.5,-0.25,0.5,-0.25,0.25,NaN,NaN,-0.25,1,-0.75,1,-0.75,1.25,-0.25,1.25,-0.25,1,NaN,NaN,-1,-1.5,-1,1.5,-3,1.5,-3,-1.5,-1,-1.5,]};
}
class TemplateHouseMedium2 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "house";
		this.density = 300;
		this.size = 2;
	}
	getRelRenderPoints(){
	return [-0.75,-2,-0.75,2,-2.5,2,-2.5,-2,-0.75,-2,NaN,NaN,-0.75,-2,2.75,-2,3.25,-1,2.75,0,-0.75,0,NaN,NaN,2.75,0,2.75,2,-0.75,2,-0.75,0,2.75,0,NaN,NaN,2.75,2,3.25,1,3.25,-1,2.75,0,2.75,2,NaN,NaN,-1,-1.25,-0.25,-1.25,-0.25,-0.75,-1,-0.75,-1,-1.25,NaN,NaN,-1,0.75,-0.25,0.75,-0.25,1.25,-1,1.25,-1,0.75,NaN,NaN,-0.25,0.25,0.25,0.25,0.25,0.5,-0.25,0.5,-0.25,0.25,NaN,NaN,0.75,0.25,1.25,0.25,1.25,0.5,0.75,0.5,0.75,0.25,NaN,NaN,1.75,0.25,2.25,0.25,2.25,0.5,1.75,0.5,1.75,0.25,NaN,NaN,2.25,1.5,1.75,1.5,1.75,1.75,2.25,1.75,2.25,1.5,NaN,NaN,1.25,1.5,0.75,1.5,0.75,1.75,1.25,1.75,1.25,1.5,NaN,NaN,0.25,1.5,-0.25,1.5,-0.25,1.75,0.25,1.75,0.25,1.5,NaN,NaN,0.25,-0.5,0.25,-0.25,-0.25,-0.25,-0.25,-0.5,0.25,-0.5,NaN,NaN,0.25,-1.75,0.25,-1.5,-0.25,-1.5,-0.25,-1.75,0.25,-1.75,NaN,NaN,1.25,-0.5,1.25,-0.25,0.75,-0.25,0.75,-0.5,1.25,-0.5,NaN,NaN,1.25,-1.75,1.25,-1.5,0.75,-1.5,0.75,-1.75,1.25,-1.75,NaN,NaN,2.25,-0.25,2.25,-0.5,1.75,-0.5,1.75,-0.25,2.25,-0.25,NaN,NaN,2.25,-1.5,1.75,-1.5,1.75,-1.75,2.25,-1.75,2.25,-1.5,NaN,NaN,2.75,-1.5,3,-1,2.75,-0.5,2.75,-1.5,NaN,NaN,]};
}

class TemplateFarm2 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "farm";
		this.density = 10;
		this.size = 2;
	}
}

class TemplateMine1 extends BuildingTemplate {
	constructor(){
		super();
		this.buildingtype = "mine";
		this.density = 0;
		this.size = 1;
	}
}

// Wrapper for the registry of all building templates
class Buildings {
	static buildings = {
		
		housesmall1: new TemplateHouseSmall1(),
		housesmall2: new TemplateHouseSmall2(),
		housemed1:   new TemplateHouseMedium1(),
		housemed2:   new TemplateHouseMedium2(),
		farm2:       new TemplateFarm2(),
		mine1:       new TemplateMine1(),
		none:        new TemplateNone(),
	};
}