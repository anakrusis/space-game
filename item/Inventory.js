
// An inventory is a collection of ItemStacks with functionality to determine its size, its stuff, and yeah...
class Inventory {
	
	constructor(size){
		this.size = size; // amount of slots in the inventory
		this.stacks = [];
	}
	
	add(itemstack){
		// First, look for matching itemstacks and ensuring that the stack size is not too large.
        for (var i = 0; i < this.size; i++){
            if (this.stacks[i] != null){
                if ((this.stacks[i].item == itemstack.item) && this.stacks[i].amount < this.stacks[i].item.maxStackSize){

                    // Adding the item
                    this.stacks[i].amount += itemstack.amount;
                    return;
                }
            }
        }
        // If no matching itemstacks exist, make a new one at the first blank spot
		this.stacks.push( new ItemStack(itemstack.item, itemstack.amount) );
	}
	
	get(index){
		return this.stacks[index];
	}
	
}