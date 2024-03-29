class Random {
	constructor( seed ){
		this.seed = seed; // initial state
		this.state = this.seed; // used to seed the next random each time it gets invoked
		this.type = this.constructor.name;
		this.count = 0; // number of times invoked
	}
	
	// Mulberry32 (originally written by Tommy Ettinger)
/* 	next(){
	  var t = (this.state) + 0x6D2B79F5;
	  t = Math.imul(t ^ t >>> 15, t | 1);
	  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
	  this.state = ((t ^ t >>> 14) >>> 0) / 4294967296;
	  return this.state;
	} */
/* 	next(){
		var x = this.state;
		x ^= x << 13;
		x ^= x >> 7;
		x ^= x << 17;
		this.state = x;
		return this.state;
	} */
	next(){
		var s = 1013904223;
		var r = 1664525;
		var q = 4294967296;
		
		this.state = ( r * this.state + s ) % q ;
		this.count++;
		
		//console.log(this.state / q);
		return Math.abs(this.state / q);
	}
	
	nextFloat(min, max){
		var out;
        if ( min <= 0 ) {
            out = (this.next() * (max + Math.abs(min))) + min;
        }else{
            out = (this.next() * (max - Math.abs(min))) + min;
        }
		return out;
    }

	nextInt(min, max){
		var out = Math.floor(this.nextFloat( min, max ));
		return out;
	}
}