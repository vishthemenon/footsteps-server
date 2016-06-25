var MAPS_API_KEY = "AIzaSyDwYPmtMIVgQZZXZPiQZXJmHUztjtQbuh0"
var SINGAPORE = {"lat" : 1.359, "lng": 103.918, "zoom": 12};
var LOCATIONS = [
	{"name": "KEMBANGAN MRT", "location" : {"lat": 1.320964, "lng": 103.912840}},
	{"name": "SIGLAP PARK CONNECTOR 1", "location" : {"lat": 1.304323, "lng": 103.919280}},
	{"name": "FORT ROAD", "location" : {"lat": 1.294578, "lng": 103.885371}},
	{"name": "MARINA BAY GOLF COURSE", "location" : {"lat": 1.293770, "lng": 103.868444}},	
	{"name": "MARINA BARRAGE", "location" : {"lat": 1.280502, "lng": 103.871394}},	
	{"name": "TANJONG PAGAR", "location" : {"lat": 1.276914, "lng": 103.846890}},
	{"name": "ESPLANADE", "location" : {"lat": 1.290245, "lng": 103.854699}},
	{"name": "CONCOURSE", "location" : {"lat": 1.300830, "lng": 103.862962}},
	{"name": "KEMBANGAN MRT", "location" : {"lat": 1.320964, "lng": 103.912840}},
	{"name": "KALLANG MRT", "location" : {"lat": 1.310168, "lng": 103.870674}},
	{"name": "BEDOK MRT", "location" : {"lat": 1.333970, "lng": 103.918392}},
	{"name": "TAMPINES PARK CONNECTOR 1", "location" : {"lat": 1.360487, "lng": 103.944566}},
	{"name": "TAMPINES PARK CONNECTOR 2", "location" : {"lat": 1.370471, "lng": 103.953891}},
	{"name": "DOWNTOWN EAST", "location" : {"lat": 1.380512, "lng": 103.954350}},
	{"name": "PASIR RIS", "location" : {"lat": 1.384338, "lng": 103.943534}},
	{"name": "IKEA TAMPINES", "location" : {"lat": 1.374368, "lng": 103.931392}},
	{"name": "SERANGOON PARK CONNECTOR 1", "location" : {"lat": 1.386208, "lng": 103.913706}},
	{"name": "PUNGGOL PARK", "location" : {"lat": 1.378225, "lng": 103.897916}},
	{"name": "HOUGANG MALL", "location" : {"lat": 1.372384, "lng": 103.893673}},
	{"name": "DEFU", "location" : {"lat": 1.343039, "lng": 103.892578}}
];
var MAPS_DOMAIN = "https://maps.googleapis.com/maps/api/directions/json?";
var SERVER_DOMAIN = "http://footsteps-server.herokuapp.com/"

var map;
var TOTAL_RUNNERS = 50;
var runners = new Array();
var users = [
];

var routeOverlays = new Array();


$(document).ready(function(){
	setInterval(poll, 2000);
});

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), 
		{	center: {lat: SINGAPORE.lat, lng: SINGAPORE.lng},
			zoom: SINGAPORE.zoom
		});
	for(var i = 0; i < TOTAL_RUNNERS; i++){
		users.push({
			"name": "User",
			"profile": "images/profile-" + (i+1) + ".jpg"
		})
	}
	createFakeRunners();
}

function createFakeRunners(){
	var directionsService = new google.maps.DirectionsService();
	var addRunnerInterval = setInterval(function(){
		var startIndex = Math.floor(Math.random() * LOCATIONS.length);
		var stopIndex = (startIndex + Math.floor(Math.random() * 3 +1)) % LOCATIONS.length;
		var start = LOCATIONS[startIndex].location;
		var stop = LOCATIONS[stopIndex].location;
		directionsService.route({
			"origin" : start,
			"destination" : stop,
			"travelMode" : google.maps.TravelMode.DRIVING,
			"region" : "sg"
		}, addFakeRunner);
		if(runners.length == TOTAL_RUNNERS) clearInterval(addRunnerInterval);
	}, 1000);
}

function addFakeRunner(result, status){
	var polyline = "";

	for(var i = 0; i < result.routes.length; i++) polyline = polyline + result.routes[i].overview_polyline;

	var runner = {
		"userId" : (runners.length%users.length),
		"wait" : Math.round(Math.random() * 10),
		"route" : decodePolyline(polyline),
		"position" : 0,
		"routeOverlay" : null,
		"marker" : null
	};

	runners.push(runner)
}


function poll(){
	for(var i = 0; i < runners.length; i++){
		if(runners.length < TOTAL_RUNNERS/3) break;
		var r = runners[i]; //shorthand
		r.position++;
		if(r.position < r.wait) continue;
		if(r.position >= r.wait * 2  + r.route.length){
			r.position = 0;
			r.routeOverlay.setMap(null);
			continue;
		}
		if(r.routeOverlay) r.routeOverlay.setMap(null);
		if(r.marker) {
			r.marker.setPosition(r.route[r.position - r.wait - 1]);
		}else{
			r.marker = drawMarker(r.route[r.position - r.wait - 1], users[r.userId]);
		}
		r.routeOverlay = drawRun(r.route, r.position - r.wait)
		// shiftMarker(r.marker, r.route[r.position - r.wait - 1]);
	}
}

function drawRun(polyline, index){
	var route = new google.maps.Polyline({
	    path: polyline.slice(0,index),
	    geodesic: false,
	    strokeColor: '#00AA22',
	    strokeOpacity: 0.7,
	    strokeWeight: 3
 	 });
	route.setMap(map);
	return route;
}

function drawMarker(position, user){
	// console.log(user);
	var marker = new google.maps.Marker({
	    position: position,
	    icon: {
	    	"url": user.profile,
       		"scaledSize": new google.maps.Size(40, 40)
	    },
	    optimized: false,
  	});
	marker.setMap(map);
	return marker;
}

// utils
function decodePolyline(encoded) {
        if (!encoded) {
            return [];
        }
        var poly = [];
        var index = 0, len = encoded.length;
        var lat = 0, lng = 0;

        while (index < len) {
            var b, shift = 0, result = 0;

            do {
                b = encoded.charCodeAt(index++) - 63;
                result = result | ((b & 0x1f) << shift);
                shift += 5;
            } while (b >= 0x20);

            var dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
            lat += dlat;

            shift = 0;
            result = 0;

            do {
                b = encoded.charCodeAt(index++) - 63;
                result = result | ((b & 0x1f) << shift);
                shift += 5;
            } while (b >= 0x20);

            var dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
            lng += dlng;

            var p = {
                lat: lat / 1e5,
                lng: lng / 1e5,
            };
            poly.push(p);
        }
        return poly;
    }