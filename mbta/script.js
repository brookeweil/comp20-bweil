    var myLat = 0;
    var myLng = 0;
    var request = new XMLHttpRequest();
    var me = new google.maps.LatLng(myLat, myLng);
    var myOptions = {
                zoom: 13, // The larger the zoom number, the bigger the zoom
                center: me,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
    var map;
    var marker;
    var infowindow = new google.maps.InfoWindow();

    var stationMarkers = [];
    var branch1Coords  = [];
    var branch2Coords  = [];
    var branch1Path;
    var branch2Path;
    var trainStops;
    var trainData;
    var trainIcon = {
        url: "train.png",
        scaledSize: new google.maps.Size(22, 22),
        anchor: new google.maps.Point(11, 11)
    };

    // Hardcoding the station locations and names
    stationMarkers [1]  = {name: "Alewife",          lat:   42.395428,  lng:         -71.142483}
    stationMarkers [2]  = {name: "Davis",            lat:    42.39674,  lng:         -71.121815}
    stationMarkers [3]  = {name: "Porter Square",    lat:     42.3884,  lng: -71.11914899999999}
    stationMarkers [4]  = {name: "Harvard Square",   lat:   42.373362,  lng:         -71.118956}
    stationMarkers [5]  = {name: "Central Square",   lat:   42.365486,  lng:         -71.103802}
    stationMarkers [6]  = {name: "Kendall/MIT",      lat: 42.36249079,  lng:       -71.08617653}
    stationMarkers [7]  = {name: "Charles/MGH",      lat:   42.361166,  lng:         -71.070628}
    stationMarkers [8]  = {name: "Park Street",      lat: 42.35639457,  lng:        -71.0624242}
    stationMarkers [9]  = {name: "Downtown Crossing",lat:   42.355518,  lng:         -71.060225}
    stationMarkers [10] = {name: "South Station",    lat: 42.352271  ,  lng: -71.05524200000001}
    stationMarkers [11] = {name: "Broadway",         lat:   42.342622,  lng:         -71.056967}
    stationMarkers [12] = {name: "Andrew",           lat:  42.330154 ,  lng:         -71.057655}
    stationMarkers [13] = {name: "JFK/UMass",        lat:   42.320685,  lng:         -71.052391} 
    stationMarkers [14] = {name: "North Quincy",     lat:   42.275275,  lng:         -71.029583}
    stationMarkers [15] = {name: "Wollaston",        lat:  42.2665139,  lng:        -71.0203369}
    stationMarkers [16] = {name: "Quincy Center",    lat:   42.251809,  lng:         -71.005409}
    stationMarkers [17] = {name: "Quincy Adams",     lat:   42.233391,  lng:         -71.007153}
    stationMarkers [18] = {name: "Braintree",        lat:  42.2078543,  lng:        -71.0011385}
    stationMarkers [19] = {name: "Savin Hill",       lat:    42.31129,  lng:         -71.053331}
    stationMarkers [20] = {name: "Fields Corner",    lat:   42.300093,  lng:         -71.061667}
    stationMarkers [21] = {name: "Shawmut",          lat: 42.29312583,  lng: -71.06573796000001}
    stationMarkers [22] = {name: "Ashmont",          lat:   42.284652,  lng: -71.06448899999999}
        
    function init()
    {
        map = new google.maps.Map(document.getElementById("map"), myOptions);
        getMyLocation();
        renderStations();
    }
    
    function getMyLocation() {
        if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
            navigator.geolocation.getCurrentPosition(function(position) {
                myLat = position.coords.latitude;
                myLng = position.coords.longitude;
                renderMap();
            });
        }
        else {
            alert("Geolocation is not supported by your web browser.  What a shame!");
        }
    }

    // From StackOverflow user talkol, at 
    // http://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
    function toRad(num){
        return ((num * Math.PI) / 180);

    }

    // From StackOverflow user talkol, at 
    // http://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
    function haversine(lat1, lon1, lat2, lon2){

        var R    = 3959; // miles
        var x1   = lat2-lat1;
        var dLat = toRad(x1);  
        var x2   = lon2-lon1;
        var dLon = toRad(x2);  
        var a    = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                        Math.sin(dLon/2) * Math.sin(dLon/2);  
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; 

        return(d);
    }

    function findClosestStation() {
        // me = new google.maps.LatLng(myLat, myLng);  // Refresh location
        var shortestDist;
        var currentDist;
        var indexOfNearest;

        for (var i in stationMarkers){
            currentDist = haversine(myLat, myLng, stationMarkers[i].lat, 
                                    stationMarkers[i].lng);
            if ((shortestDist == undefined) || (currentDist < shortestDist)){
                shortestDist = currentDist;
                indexOfNearest = i;
            }
        }
        return {station: stationMarkers[indexOfNearest], dist: shortestDist};
    }

    function initStation(station, index){

        // Add station to map
            station.marker = new google.maps.Marker({
                position: {lat: station.lat, lng: station.lng},
                title: station.name,
                icon: trainIcon
            });
            station.marker.setMap(map);

            // Add info windows with listeners
            station.info = new google.maps.InfoWindow();
            station.marker.addListener('click', function() {

                station.info.open(map, station.marker);

                //Find predicted stops and sort by time
                var predictedStops = findPredictedStops(index);
                predictedStops.sort(function (a, b) {
                    return (a.time - b.time);
                });

                // Add predicted stops to info window
                var listOfStops = "";
                for (var i in predictedStops) {
                    listOfStops += "<p> Train to " + predictedStops[i].dest 
                    + " in " + predictedStops[i].time.toPrecision(3) +
                    " minutes </p>" 
                }
                station.info.setContent(
                    "<h4>" + station.name + "</h4>" + 
                    "<h5> Upcoming Trains: </h5>" + listOfStops )
            });
    }


    function loadTrainStops() {
        // Step 1: create an instance of XMLHttpRequest
        request = new XMLHttpRequest();
        // Step 2: Make request to remote resource
        request.open("get", "https://rocky-taiga-26352.herokuapp.com/redline.json");
        // Step 3: Create handler function to do something with data in response
        request.onreadystatechange = funex;
        // Step 4: Send the request
        request.send();
    }
    function funex() {
        // Step 5: When data is received, get it and do something with it

        if (request.readyState == 4 && request.status == 200) {
            // Step 5A: get the response text
            trainData = request.responseText;
            // Step 5B: parse the text into JSON
            trainStops = JSON.parse(trainData);
        }
        else if (request.status == 404) window.location.reload();
    }

    function findPredictedStops(stationIndex){

        var predictedStops = [];

        for  (var i in trainStops["TripList"]["Trips"]) {
            for (var j in trainStops["TripList"]["Trips"][i]["Predictions"]) {

                if (trainStops["TripList"]["Trips"][i]["Predictions"][j].Stop ==
                    stationMarkers[stationIndex].name)
                    predictedStops.push(
                        {dest: trainStops["TripList"]["Trips"][i].Destination,
                         time: (trainStops["TripList"]["Trips"][i]["Predictions"][j].Seconds) / 60 })
            }
        }
        return predictedStops;
    }


    function renderStations(){

        // Load train stop predictions from JSON
        loadTrainStops();

        // Add stations to map
        stationMarkers.forEach(initStation);

        // Create polyline for branch 1
        for (var j = 1; j < 19; j++){
            branch1Coords.push(
                {lat: stationMarkers[j].lat,
                 lng: stationMarkers[j].lng} );
        }
        branch1Path = new google.maps.Polyline({
          path: branch1Coords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });
        branch1Path.setMap(map);

        // Create polyline for branch 2
        branch2Coords.push({lat: stationMarkers[13].lat, lng: stationMarkers[13].lng});
        for (var k = 19; k < 23; k++){
            branch2Coords.push(
                {lat: stationMarkers[k].lat,
                 lng: stationMarkers[k].lng} );
        }        
        branch2Path = new google.maps.Polyline({
          path: branch2Coords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });
        branch2Path.setMap(map);
    }

    function renderMap() {
        
        var closestStation = findClosestStation();
        var pathToStation;
    
        me = new google.maps.LatLng(myLat, myLng);
        
        // Update map and go there...
        map.panTo(me);

        // Create a marker
        marker = new google.maps.Marker({
            position: me,
            title: "You are here"
        });
        marker.setMap(map);

        // Draw a path to the nearest station
        pathToStation = new google.maps.Polyline({
          path: [ {lat: myLat, lng: myLng}, 
                  {lat: closestStation.station.lat, lng:closestStation.station.lng} ],
          geodesic: true,
          strokeColor: '#428ff4',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });
       pathToStation.setMap(map);

        // Open info window on click of marker
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
            infowindow.setContent(
                "<h4> Closest station: </h4> " + closestStation.station.name +
                "<h4>Distance away: </h4>" + closestStation.dist.toPrecision(2)
                + " miles");
        });
    }







