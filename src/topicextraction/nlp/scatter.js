require.undef('scatter');

define('scatter', ['d3'], function (d3) {
    function draw(container, data, width, height, type) {
      var margin ={top: (0.05*width), right: (0.1*width), bottom: (0.1*width), left: (0.05*width)};
      //width = 0.8*width;
      //height = 0.9*height;

      ///////// set up svg and clipping

      var svg = d3.select(container).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr('x', 0)
        .attr('y', 0)
        .attr("width", width)
        .attr("height", height);

      ///////// set up axes

      var x = d3.scaleLinear()
        .range([0, width]);

      var y = d3.scaleLinear()
          .range([height, 0]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);
      console.log(type)
      var accessor = (d, type, coord) => {return (type!=='scatter')?d.embpoint[coord]:d.mappoint[coord]};

      x.domain(d3.extent(data.project_data, function(d) { return accessor(d, type, 0); }));
      y.domain(d3.extent(data.project_data, function(d) { return accessor(d, type, 1); }));

      ///////// insert data points and contour plot
      var contours = d3.contours()
        .smooth([true])
        .size([width, height])
      (data.cluster_topography)

      var colorHeat = d3.scaleLinear()
        .domain(d3.extent(data.cluster_topography))
        .interpolate(d => d3.interpolateMagma)


      svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "none")
          .attr("stroke-linejoin", "round")
          .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data(contours)
        .enter().append("path")
          .attr("class", "isoline")
          .attr("fill", d => colorHeat(d.value))
          .attr("d", d3.geoPath());

      svg.selectAll(".dot")
        .data(data.project_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(accessor(d, type, 0)); })
        .attr("cy", function(d) { return y(accessor(d, type, 1)); })
        .style("fill", function(d) { return color(d.cluster); });

      ///////// set up legend

      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .style("color", "white")
          .text(function(d) { return d; });
          
    }
    return draw;
});