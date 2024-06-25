/* Map of GeoJSON data from crocs.geojson */
//declare map var in global scope
var map;
var minValue
//Step 1 function to initiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [-12, 142],
        zoom: 10
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    //call getData function
    getData(map)

};

function calculateMinValue(data){
    var allValues = [];     //create empty array to store all data values
 
    for(var size of data.features){     //loop through each row
        var value = size.properties["total length (cm)"];  //get population for current year


        if (typeof value === 'number') {
            allValues.push(value);   //add value to array
        } else {
            console.log('Invalid value:', value, 'in object:', size);
        }
    }
        
        //get minimum value of our array
        var minValue = Math.min(...allValues);
        console.log("minValue2:",minValue); //checking the values

        return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1;
    //Flannery Apperance Compensation formula
    var radius = 2.5 * Math.pow(attValue/minValue,6) * minRadius

    return radius;
};



//NEW

//function to convert markers to circle markers

//function to assign colors to each name
function getColor(crocName) {
    var colors = {
        "Aristotle": "#ff0000",
        "Hamish": "#FFFF00",
        "Ryan": "#33FF33",
        "Tarlisha": "#660066",    
        // Add more croc names and colors here
    };
    return colors[crocName] || "#00ff00";
}

function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "total length (cm)";

   
    //create marker options
    var options = {
        fillColor: getColor(feature.properties['croc name']),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = feature.properties[attribute];


    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    //build popup content string
    var popupContentsize = "<p><b>Size (cm):</b>,  " + feature.properties["total length (cm)"] + "<p><b>Croc Name:</b> " + feature.properties["croc name"]
    
    //bind the popup to the circle marker
    layer.bindPopup(popupContentsize);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};



/// Add circle markers for point features to the map
function createPropSymbols(data, map) {
    // Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            // Check if lat and lng are not undefined and are numbers
            if (latlng.lat !== undefined && !isNaN(latlng.lat) && latlng.lng !== undefined && !isNaN(latlng.lng)) {
                // If valid, use your pointToLayer function
                return pointToLayer(feature, latlng);
            } else {
                console.error(`Invalid latitude or longitude: ${latlng.lat}, ${latlng.lng}`);
                return null; // Return null if latlng is invalid
            }
        }
    }).addTo(map);
};



// Create new sequence controls
function createSequenceControls(){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

      //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
};


//Above Example 3.10...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    
    var properties = data.features[0].properties['croc name']
   
    
    attributes.push(properties)
    

    //check result
    console.log(attributes);

    return attributes;
};

//function to retrieve the data and place it on the map
function getData(map){
    fetch("data/crocs2.geojson")
        .then(function(response){
            return response.json();
        })
        //add circles to the markers
        .then(function(json){
           
            minValue = calculateMinValue(json)

            console.log("minValuue:",minValue);


            //call function to create propertional symbols
            createPropSymbols(json, map);
            createSequenceControls()
            processData(json)

        })
};



document.addEventListener('DOMContentLoaded',createMap)