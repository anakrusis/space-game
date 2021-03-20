// internal server code goes here. Will try to be as close to multiplayer code as possible for easy porting to socket...

var path_to_data; var newfunc;

class Server {
	
	constructor(){
		this.world = new World();
	}
	
	update(){
		this.world.update();
		
		client.onUpdate(this.world,"world");
	}
	
	onUpdateRequest(){
		var data = arguments[0]; // first argument is the data sented..
		path_to_data = this;
		parent   = this;
		
		for (var i = 1; i < arguments.length - 1; i++){ // subsequent arguments are as follows..
			var key = arguments[i];
			
			if (typeof path_to_data === "function"){
				newfunc = path_to_data.bind( parent );
				path_to_data = newfunc()[key];
			}else{
				parent       = path_to_data;
				path_to_data = path_to_data[key];
			}
			
		}
		// final argument is the one which is being modified..
		if (typeof path_to_data === "function"){
			newfunc = path_to_data.bind( parent );
			newfunc()[ arguments[arguments.length - 1] ] = data;
		}else{
			path_to_data[ arguments[arguments.length - 1] ] = data;
		}
	}
	
/* 	onUpdateRequest( data, key1, key2, key3, key4 ){
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
	} */
	
}