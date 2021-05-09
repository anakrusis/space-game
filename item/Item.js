// Wrapper for the registry of all items
class Items {
	static items = [];
}

// Individual item types and their behaviors
class Item {
	constructor( name ){
		this.name = name;
		this.maxStackSize = 99;
		this.color = [255, 255, 255];
		Items.items.push(this);
	}
	
	getRelRenderPoints(){
		return [
				-1, -1,
				1.5, -1,
				1.5, 1,
				-1, 1
		]
	}
}

class ItemStack {
	
	constructor(item,amount){
		this.item = item;
		this.amount = amount;
	}
}

class ItemIron extends Item {
	constructor( name ){
		super(name);
		this.color = [192,192,255];
	}
	
	getRelRenderPoints(){
	return [-0.75,-1,-0.75,0,-0.25,0,-0.25,-1,-0.75,-1,-0.75,0,0.75,1,1.25,1,1.25,0,0.75,0,0.75,1,0.75,0,1.25,0,-0.25,-1,-0.75,-1,0.75,0,0.75,1,1.25,1,-0.25,0,-0.75,0,]};
}

class ItemFood extends Item{
	constructor( name ){
		super(name);
		this.color = [255,255,0];
	}
	
	getRelRenderPoints(){
	return [-0.5,-1,-0.25,-0.75,-0,-1,0.25,-0.75,0.25,0,-0,0.25,-0.25,0,-0.25,0,-0.5,0.25,-1,0,-1,-0.75,-0.5,-1,-1,-0.75,-1,0,-0.5,0.25,-1,0,0.25,0.75,0.75,1,1,0.75,1.25,1,1.5,0.75,1.5,0,0.25,-0.75,1.5,0,1.25,-0.25,-0,-1,-0.25,-0.75,-0.5,-1,]};
}

class ItemPassengers extends Item{
	constructor( name ){
		super(name);
		this.color = [255,192,128];
	}
}