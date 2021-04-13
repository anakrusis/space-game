
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
		
		for (var i = 0; i < this.size; i++){
            if (this.stacks[i] == null){
				// If no matching itemstacks exist, make a new one at the first blank spot
				this.stacks[i] = new ItemStack(itemstack.item, itemstack.amount);
				return;
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