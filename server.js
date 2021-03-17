// internal server code goes here. Will try to be as close to multiplayer code as possible for easy porting to socket...

class Server {
	
	constructor(){
	
		this.map = new Map();
		
	}
	
	update(){
		client.onUpdate(this.map,"map");
	}
}