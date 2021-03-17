class Client {
	
	constructor(){
		
	}
	
	onUpdate(data, key1, key2, key3, key4){
		
/* 		if (key1 && this[key1]){
			if (key2 && this[key2]){
				if (key3 && this[key3]){
					if (key4 && this[key4]){
						this[key1][key2][key3][key4] = data; return;
					}
					this[key1][key2][key3] = data; return;
				}
				this[key1][key2] = data; return;
			}
			this[key1] = data; return;
		} */
		
		if (key2 && this[key1]){
			this[key1][key2] = data;
		}else{
			this[key1] = data;
		}
	}
}