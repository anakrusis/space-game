class RandomUtil{
	static fromRangeF(min, max){
        if(min <= 0) {
            return this.nextFloat(max + (Math.abs(min))) + min;
        }else{
            return this.nextFloat(max - (Math.abs(min))) + min;
        }
    }
	
	static nextFloat(bound){
		var rand = p5.prototype.random(); //console.log(rand);
        return ( rand ) * bound;
    }
	
	static fromRangeI(min, max){
		return Math.floor( this.fromRangeF(min,max) );
	}
	
	static randomNationColor(){
		
		var hsl = [ RandomUtil.fromRangeF(0.0,1.0), 1.0, 0.6 ];
		return MathUtil.hslToRgb( hsl[0], hsl[1], hsl[2] );
	}
}