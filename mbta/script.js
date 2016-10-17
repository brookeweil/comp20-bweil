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
    var trainIcon = {
        url: "train.png",
        size: new google.maps.Size(75, 75),
        scaledSize: new google.maps.Size(22, 22)
    };

    stationMarkers [0]  = {name: "South Station    ",  lat: 42.352271  ,  lng: -71.05524200000001}
    stationMarkers [1]  = {name: "Andrew           ",  lat:  42.330154 ,  lng:         -71.057655}
    stationMarkers [2]  = {name: "Porter Square    ",  lat:     42.3884,  lng: -71.11914899999999}
    stationMarkers [3]  = {name: "Harvard Square   ",  lat:   42.373362,  lng:         -71.118956}
    stationMarkers [4]  = {name: "JFK/UMass        ",  lat:   42.320685,  lng:         -71.052391}
    stationMarkers [5]  = {name: "Savin Hill       ",  lat:    42.31129,  lng:         -71.053331}
    stationMarkers [6]  = {name: "Park Street      ",  lat: 42.35639457,  lng:        -71.0624242}
    stationMarkers [7]  = {name: "Broadway         ",  lat:   42.342622,  lng:         -71.056967}
    stationMarkers [8]  = {name: "North Quincy     ",  lat:   42.275275,  lng:         -71.029583}
    stationMarkers [9]  = {name: "Shawmut          ",  lat: 42.29312583,  lng: -71.06573796000001}
    stationMarkers [10] = {name: "Davis            ",  lat:    42.39674,  lng:         -71.121815}
    stationMarkers [11] = {name: "Alewife          ",  lat:   42.395428,  lng:         -71.142483}
    stationMarkers [12] = {name: "Kendall/MIT      ",  lat: 42.36249079,  lng:       -71.08617653}
    stationMarkers [13] = {name: "Charles/MGH      ",  lat:   42.361166,  lng:         -71.070628}
    stationMarkers [14] = {name: "Downtown Crossing",  lat:   42.355518,  lng:         -71.060225}
    stationMarkers [15] = {name: "Quincy Center    ",  lat:   42.251809,  lng:         -71.005409}
    stationMarkers [16] = {name: "Quincy Adams     ",  lat:   42.233391,  lng:         -71.007153}
    stationMarkers [17] = {name: "Ashmont          ",  lat:   42.284652,  lng: -71.06448899999999}
    stationMarkers [18] = {name: "Wollaston        ",  lat:  42.2665139,  lng:        -71.0203369}
    stationMarkers [19] = {name: "Fields Corner    ",  lat:   42.300093,  lng:         -71.061667}
    stationMarkers [20] = {name: "Central Square   ",  lat:   42.365486,  lng:         -71.103802}
    stationMarkers [21] = {name: "Braintree        ",  lat:  42.2078543,  lng:        -71.0011385}
        
    function init()
    {
        map = new google.maps.Map(document.getElementById("map"), myOptions);
        getMyLocation();
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

    function renderMap()
    {
        me = new google.maps.LatLng(myLat, myLng);
        
        // Update map and go there...
        map.panTo(me);

        // Create a marker
        marker = new google.maps.Marker({
            position: me,
            title: "Here I Am!"
        });
        marker.setMap(map);

        // Add stations to map
        for (var i in stationMarkers){
            stationMarkers[i].marker = new google.maps.Marker({
                position: {lat: stationMarkers[i].lat, lng: stationMarkers[i].lng},
                title: stationMarkers[i].name,
                icon: trainIcon
            });
            stationMarkers[i].marker.setMap(map);
        }
            
            
        // Open info window on click of marker
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(marker.title);
            infowindow.open(map, marker);
        });
    }
