class MathUtil {
	// https://www.vertexfragment.com/ramblings/cantor-szudzik-pairing-functions/
	// This is a Szudzik pair (no i will not be naming the function that, i cannot remember how to spell this)
	static pair(x, y)
	{
		return (x >= y ? (x * x) + x + y : (y * y) + x);
	}
	
	static signedPair(x, y) 
	{
		const a = (x >= 0.0 ? 2.0 * x : (-2.0 * x) - 1.0);
		const b = (y >= 0.0 ? 2.0 * y : (-2.0 * y) - 1.0);
		return this.pair(a, b) * 0.5;
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