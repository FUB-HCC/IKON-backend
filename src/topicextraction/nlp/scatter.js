require.undef('circles');

define('circles', ['d3'], function (d3) {
    function draw(container, data) {
      var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var x = d3.scaleLinear()
          .range([0, width]);

      var y = d3.scaleLinear()
          .range([height, 0]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var xAxis = d3.axisBottom(x);

      var yAxis = d3.axisLeft(y);

      var svg = d3.select(container).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(d3.extent(data.project_data, function(d) { return d.embpoint[0]; })).nice();
      y.domain(d3.extent(data.project_data, function(d) { return d.embpoint[1]; })).nice();

      var contours = d3.contourDensity()
        .x(d => x(d.embpoint[0]))
        .y(d => y(d.embpoint[1]))
        .size([width, height])
        .bandwidth(40)
      (data.project_data)

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Sepal Width (cm)");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Sepal Length (cm)")

        svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data(contours)
        .enter().append("path")
          .attr("d", d3.geoPath());

      svg.selectAll(".dot")
          .data(data.project_data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", function(d) { return x(d.embpoint[0]); })
          .attr("cy", function(d) { return y(d.embpoint[1]); })
          .style("fill", function(d) { return color(d.cluster); });

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