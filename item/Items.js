// Items are registered here, they are added to a thing

/* Items.ITEM_IRON 	  = new ItemIron("Iron","iron");
Items.ITEM_FOOD 	  = new ItemFood("Food","food");
Items.ITEM_PASSENGERS = new ItemPassengers("Passengers","passengers"); */

// Wrapper for the registry of all items
class Items {
	static items = {
		
		iron: new ItemIron("Iron"),
		food: new ItemFood("Food"),
		passengers: new ItemPassengers("Passengers"),
		spaceport: new ItemSpaceport("Spaceport Hangar")
	};
}

