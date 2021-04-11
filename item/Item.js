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
	
	getRenderPoints(){
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
	
}

class ItemFood extends Item{
	
}