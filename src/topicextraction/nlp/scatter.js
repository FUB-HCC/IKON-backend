require.undef('circles');

define('circles', ['d3'], function (d3) {

    function draw(container, data, width, height) {
      var margin ={top: (0.05*width), right: (0.1*width), bottom: (0.1*width), left: (0.05*width)};
      width = 0.8*width;
      height = 0.9*height;

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

      function zoomed() {
      // create new scale ojects based on event
          var new_x = d3.event.transform.rescaleX(x);
          var new_y = d3.event.transform.rescaleY(y);
      // update axes
          gX.call(xAxis.scale(new_x));
          gY.call(yAxis.scale(new_y));
          console.log(points)
          svg.selectAll(".dot")
           .data(data.project_data)
           .attr('cx', function(d) {return new_x(d.embpoint[0])})
           .attr('cy', function(d) {return new_y(d.embpoint[1])});
      }

      // Pan and zoom
      var zoom = d3.zoom()
          .scaleExtent([.5, 20])
          .extent([[0, 0], [width, height]])
          .on("zoom", zoomed);

      svg.append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .call(zoom);

      ///////// set up axes

      var x = d3.scaleLinear()
        .range([0, width]);

      var y = d3.scaleLinear()
          .range([height, 0]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var xAxis = d3.axisBottom(x);

      var yAxis = d3.axisLeft(y);

      x.domain(d3.extent(data.project_data, function(d) { return d.embpoint[0]; })).nice();
      y.domain(d3.extent(data.project_data, function(d) { return d.embpoint[1]; })).nice();

      var gX = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      var gY = svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)

      ///////// insert data points and contour plot

      var contours = d3.contourDensity()
        .x(d => x(d.embpoint[0]))
        .y(d => y(d.embpoint[1]))
        .size([width, height])
        .bandwidth(40)
      (data.project_data)

      svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data(contours)
        .enter().append("path")
          .attr("class", "isoline")
          .attr("d", d3.geoPath());

      svg.selectAll(".dot")
        .data(data.project_data);
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.embpoint[0]); })
        .attr("cy", function(d) { return y(d.embpoint[1]); })
        .style("fill", function(d) { return color(d.cluster); })
        .attr("clip-path", "url(#clip)");

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
          .text(function(d) { return d; });
    }
    return draw;
});