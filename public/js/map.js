
    mapboxgl.accessToken = mapToken;

    // let mapToken = "<%= process.env.MAP_TOKEN %>";
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style:"mapbox://styles/mapbox/streets-v12",
        center: [77.4126, 23.2599 ], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });


    map.on('load', function() {
    const marker = new mapboxgl.Marker({color: 'red'})
        .setLngLat([77.4126, 23.2599 ])
        .setPopup(
            new mapboxgl.Popup({offset: 25})
            .setHTML("<h4>Exact Location provided after booking!</h4>")
        )
        .addTo(map);
});

// Error handling for map loading
map.on('error', function(e) {
    console.error('Map error:', e);
});
