export function latLongDistance(p1, p2) {
	const R = 6371;
	const lat1 = p1[0] * Math.PI/180;
	const lat2 = p2[0] * Math.PI/180;
	const lon1 = p1[1] * Math.PI/180;
	const lon2 = p2[1] * Math.PI/180;
	const dlat = (lat2-lat1);
	const dlon = (lon2-lon1);

	const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
						Math.cos(lat1) * Math.cos(lat2) *
						Math.sin(dlon/2) * Math.sin(dlon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return R * c;
}

export function decay(x) {
	return 1 / (1 + Math.pow(Math.E, 0.035 * (x - 180)))
}