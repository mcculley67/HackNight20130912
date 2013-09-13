function MapsController(){
    // Coordonnées par défaut sans géo loc (paris dezoomé)
    this.coordonnees = {
	lat: 48.856614,
	lng: 2.3522219000000177,
	alt: 0,
	zoom: 6
    };
    
    // Option de la map
    this.mapOptions = {
	center: new google.maps.LatLng(this.coordonnees.lat, this.coordonnees.lng),
	zoom: this.coordonnees.zoom,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    // Deux type de marker différent pour différencier ville naissance/ville actuelle
    this.markerImageBorn = new google.maps.MarkerImage('Images/maps-marker-bleu.png');
    this.markerImageNow = new google.maps.MarkerImage('Images/maps-marker-rose.png');
    
    // Marker de la vrai ville de naissance
    this.currentMarker = {};
    // Map
    this.map = {};
    // Pour futur gestion du nombre d'essai
    this.nbEssai = 1;
}

MapsController.prototype.initialyze = function (friend) {
    // Si la position geoloc a été récupéré on la set dans les propriété de l'objet
    if ($('#position').attr('data-lat') != "") {
	this.coordonnees.lat = $('#position').attr('data-lat');
	this.coordonnees.lng = $('#position').attr('data-lng');
	this.coordonnees.alt = $('#position').attr('data-alt');
	this.coordonnees.zoom = 14;
    }
    // On créée la map
    this.map = new google.maps.Map(document.getElementById("map-canvas"), this.mapOptions);
    var $this = this;
    // On ajoute le listener pour la pose de marqueur au click
    google.maps.event.addListener(this.map, 'click', function (event) {
	$this.putMarker(event);
    });
    
    // Et on pose le marker sur la ville actuelle de l'ami tiré au sort
    $this.createMarkerFriend(friend);
}

MapsController.prototype.getGeolocalisation = function(){
    var $this = this;
    // Si le navigateur possède la géoloc on récupère sa position. Sinon on prends Paris par défaut
    if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
	    // ON inscrit la position dans le DOM
	    $('#position').attr('data-lat', position.coords.latitude);
	    $('#position').attr('data-lng', position.coords.longitude);
	    $('#position').attr('data-alt', position.coords.altitude);
	    
	    $this.coordonnees.lat = position.coords.latitude;
	    $this.coordonnees.lng = position.coords.longitude;
	    $this.coordonnees.alt = position.coords.altitude;
	});
    }
    return this.coordonnees;
}

MapsController.prototype.putMarker = function (event) {
    // Pour title du marqueur d'essai
    var $this = this;
    var title = "Essai numéro " + this.nbEssai;
    this.nbEssai++;
    
    // Création du Marker d'essai
    var myMarker = new google.maps.Marker({
	// Coordonnées
	position: event.latLng,
	map: this.map,
	title: title,
	icon: this.markerImageNow
    });
    
    // Création du Marker réel de naissance
    var GeocoderOptions = {
	'address' : Facebook.response[cptFriends-1].hometown,
	'region' : 'France'
    }
    var myGeocoder = new google.maps.Geocoder();
    myGeocoder.geocode(GeocoderOptions, function(results, status){
	// Si la recher à fonctionné
	if(status == google.maps.GeocoderStatus.OK) {
	    // Création du Marker
	    var marker = new google.maps.Marker({
		// Coordonnées
		position: results[0].geometry.location,
		map: $this.map,
		title: 'The title',
		icon: $this.markerImageBorn
	    });
	    View.appendResult($this.getDistance(event.latLng, marker.position));
	}
    });
}

MapsController.prototype.createMarkerFriend = function (friend) {
    var $this = this;
    var adresse = friend.location;
    
    // Création du geocoder pour récupérer lat et lng via nom de ville
    var GeocoderOptions = {
	'address' : adresse.split(',').first().trim(),
	'region' : adresse.split(',').last().trim()
    }

    var myGeocoder = new google.maps.Geocoder();
    myGeocoder.geocode(GeocoderOptions, function(results, status){
	// Si la recherche à fonctionné
	if(status == google.maps.GeocoderStatus.OK) {
	    // Création du Marker
	    var myMarker = new google.maps.Marker({
		// Coordonnées
		position: results[0].geometry.location,
		map: $this.map,
		title: 'The title',
		icon: $this.markerImageBorn
	    });
	}
    });
}

MapsController.prototype.getDistance = function(p1, p2){
    var R = 6371; // rayon en km de la terre
    var dLat  = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    
    return d.toFixed(3);
}