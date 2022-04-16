export function latLongDistance(p1, p2) {
	const R = 6371e3; // metres
	const lat1 = p1[0] * Math.PI/180; // φ, λ in radians
	const lat2 = p2[0] * Math.PI/180;
	const lon1 = p1[1] * Math.PI/180; // φ, λ in radians
	const lon2 = p2[1] * Math.PI/180;
	const dlat = (lat2-lat1) * Math.PI/180;
	const dlon = (lon2-lon1) * Math.PI/180;

	const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
						Math.cos(lat2) * Math.cos(lat2) *
						Math.sin(dlon/2) * Math.sin(dlon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return R * c; // in metres
}

// TODO: function to generate lat long coords in circles around point