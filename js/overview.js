/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

generateOverviewMap();
var ranOverviewBefore = false;

function generateOverviewMap() {
    if (ranOverviewBefore) {
        return;
    } else {
        ranOverviewBefore = true;
    }
    //Width and height of map
    var width = 960;
    var height = 500;

    // D3 Projection
    var projection = d3.geo.albersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([1000]); // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection
    let divTarget = "#overview-map"

    // Define linear scale for output
    var color = d3.scale.linear().
    range(["rgb(0,51,102)", "rgb(68, 138, 255)", "violet", "green"]);

    var legendText = ["Low Part. State With Low Scores", "Low Part. State With High Scores", "High Part. State With Low Scores", "High Part. State With High Scores"];

    //Create SVG element and append map to the SVG
    var svg = d3.select(divTarget)
        .append("div")
        .attr("id", "svg")
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin");

    // Append Div for tooltip to SVG
    var div = d3.select(divTarget)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Load in ap scores data
    d3.csv("https://ronakshah.net/collegeboard-stats/csv/apscoresbystate.csv", function (scoredata) {
        color.domain([0, 1, 2, 3]); // setting the range of the input data
        // Load in drug death data
        d3.csv("https://raw.githubusercontent.com/ronakdev/data-analysis/master/json/drugdeaths.csv", function (drugData) {
            console.log(drugData)
            // Load GeoJSON data and merge with states data
            d3.json("https://ronakshah.net/collegeboard-stats/json/us-states.json", function (json) {


                json.features.forEach((element, index) => {
                  // element.properties.name == "South Dakota"
                  // drugData[some element]['State Name'] == "South Dakota"
                  let state = element.properties.name
                  let drugStateIndex = drugData.findIndex( item => item['State Name'] == state )
                  if (drugStateIndex != -1) {
                    let drugState = drugData[drugStateIndex]
                    element.properties['deaths'] = drugState['Data Value']
                    console.log(drugState)
                    element.properties['population'] = drugState['population']
                  }
                });


                // // Look through each state's participation data value in the .csv file
                // for (var i = 0; i < partdata.length; i++) {

                //     // Grab State Name
                //     var dataState = partdata[i].state;

                //     // Grab data value 
                //     var dataValue = partdata[i].participation;

                //     // Find the corresponding state inside the GeoJSON
                //     for (var j = 0; j < json.features.length; j++) {
                //         var jsonState = json.features[j].properties.name;

                //         if (dataState == jsonState) {

                //             // Copy the data value into the JSON
                //             json.features[j].properties.participation = dataValue;

                //             // Stop looking through the JSON
                //             break;
                //         }
                //     }
                // }

                // Bind the data to the SVG and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .style("fill", function (d) {
                        console.log(d.properties)
                        // Get data value
                        let population = d.properties.population
                        let deaths = d.properties.deaths
                        
                        if (population && deaths) {
                            // code here
                            return "#000"
                        } else {
                            //If value is undefined…
                            return "rgb(213,222,217)";
                        }
                    })
                    .on("mouseover", function (d) {
                        let text = `${d.properties.population} has ${d.properties.deaths} deaths, the ratio is ${d.properties.deaths / 1000000}`

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.text(text)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })

                    // fade out tooltip on mouse out               
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
                var legend = d3.select(divTarget).append("svg")
                    .attr("class", "legend")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(color.domain().slice())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                        return "translate(10," + i * 25 + ")";
                    });

                legend.append("rect")
                    .attr("width", 28)
                    .attr("height", 28)
                    .style("fill", color);

                legend.append("text")
                    .data(legendText)
                    .attr("class", "legend-text")
                    .attr("x", 40)
                    .attr("y", 9)
                    .attr("dy", ".65em")
                    .text(function (d) {
                        return d;
                    });
            });
        });
    });
}
