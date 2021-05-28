class Objective {
	
	// empty container object for objectives
	
	constructor(){
		this.text = "Objective";
		this.complete = false;
	}
	
}

class ObjectiveBringItemToPlace extends Objective {
	
	constructor( item, quantity, place ){
		
		super();
		
		//var dest = server.world.cities[ destinationUUID ];
		
		this.text = "Bring " + quantity + " " + item.name + " to " + place.name;
		
		this.item = item;
		this.quantity = quantity;
		//this.destinationUUID = destinationUUID;
		
	}

}