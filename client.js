class Client {
	
	constructor(){
		
	}
	
	onUpdate(data, key1, key2){
		if (key2 && this[key1]){
			this[key1][key2] = data;
		}else{
			this[key1] = data;
		}
	}
}