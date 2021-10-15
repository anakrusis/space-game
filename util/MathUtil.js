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
}