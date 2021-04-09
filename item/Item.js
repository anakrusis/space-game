// Wrapper for the registry of all items
class Items {
	static items = [];
}

// Individual item types and their behaviors
class Item {
	constructor( name ){
		this.name = name;
		this.maxStackSize = 99;
		Items.items.push(this);
	}
}

class ItemIron extends Item {
	
}