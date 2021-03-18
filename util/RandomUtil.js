class RandomUtil{
	static fromRangeF(min, max){
        if(min <= 0) {
            return this.nextFloat(max + (Math.abs(min))) + min;
        }else{
            return this.nextFloat(max - (Math.abs(min))) + min;
        }
    }
	
	static nextFloat(bound){
        return Math.random()*bound;
    }
	
	static fromRangeI(min, max){
		return Math.floor( this.fromRangeF(min,max) );
	}
}