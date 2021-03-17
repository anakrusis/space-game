// internal server code goes here. Will try to be as close to multiplayer code as possible for easy porting to socket...

class Server {
	
	constructor(){
	
		this.world = new World();
		
	}
	
	update(){
		this.world.update();
		
		client.onUpdate(this.world,"world");
	}
	
	onUpdateRequest( data, key1, key2, key3, key4 ){
		if (key1 && this){
			if (key2 && this[key1]){
				if (key3 && this[key1][key2]){
					if (key4 && this[key1][key2][key3]){
						this[key1][key2][key3][key4] = data; return;
					}
					this[key1][key2][key3] = data; return;
				}
				this[key1][key2] = data; return;
			}
			this[key1] = data; return;
		}
	}
}