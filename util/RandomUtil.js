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
		return this.hslToRgb( hsl[0], hsl[1], hsl[2] );
	}
	
	// From the source here on https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
	//
	
	static hslToRgb(h, s, l){
		var r, g, b;

		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			var hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
}