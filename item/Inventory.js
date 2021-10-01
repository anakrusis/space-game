
// An inventory is a collection of ItemStacks with functionality to determine its size, its stuff, and yeah...
class Inventory {
	
	constructor(size){
		this.size = size; // amount of slots in the inventory
		this.stacks = [];
		
		// index of a selected slot, which can be used for whatever operations
		this.selection = -1;
		
		this.type = this.constructor.name;
	}
	
	add(itemstack){
		// First, look for matching itemstacks and ensuring that the stack size is not too large.
        for (var i = 0; i < this.size; i++){
			var cs = this.stacks[i]; // current stack
            if (!cs){ continue; }
			if (cs.item != itemstack.item){ continue; }
			
			// will distribute item among several stacks if stack one fills up partly while adding...
			var oldamt = cs.amount;
			cs.amount += itemstack.amount; cs.amount = Math.min(cs.amount, cs.getItem().maxStackSize);
			itemstack.amount -= ( cs.amount - oldamt );
			
			if (itemstack.amount <= 0){ return; }
        }
		
		// If no matching itemstacks exist, make as many new itemstacks as needed
		for (var i = 0; i < this.size; i++){
            if (this.stacks[i] == null){
				var newamt = Math.min(itemstack.amount, itemstack.getItem().maxStackSize)
				this.stacks[i] = new ItemStack(itemstack.item, newamt);
				itemstack.amount -= newamt;
				
				if (itemstack.amount <= 0){ return; }
			}
		}
	}
	
	combine(inventory){
		for (var q = 0; q < inventory.size; q++){
			if (inventory.get(q)){
				this.add( inventory.get(q) );
			}
		}
	}
	
	shrink(itemtype, amount){
		
		var remainingAmount = amount;
		
		for (var i = this.size; i >= 0; i--){
            if (this.stacks[i] != null){
				
				if (this.stacks[i].item == itemtype){
					
					var amountToSubtract = Math.min( this.stacks[i].amount, remainingAmount );
					this.stacks[i].amount -= amountToSubtract;
					remainingAmount -= amountToSubtract;
					
					if (this.stacks[i].amount <= 0){
						this.stacks[i] = null;
					}
				}
				
            }
        }
	}
	
	totalAmount(itemtype){
		var sum = 0;
		for (var i = 0; i < this.stacks.length; i++){
            if (this.stacks[i] != null){
                if ((this.stacks[i].item == itemtype)){
					sum += this.stacks[i].amount;
				}
            }
        }
		return sum;
	}
	
	get(index){
		return this.stacks[index];
	}
	
}