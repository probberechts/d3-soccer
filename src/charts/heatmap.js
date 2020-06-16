import { select as d3Select } from "d3-selection";
import { scaleSequential as d3ScaleSequential } from "d3-scale";
import * as colorScale from 'd3-scale-chromatic';


function gridData(d) {
  var data = [];
  var gx = d.length;
  var gy = d[0].length;
  var incx = 105.0 / gx;
  var incy = 68.0 / gy;

  var max_v = 0.;
  for (var x = 0; x < gx; x++) {
    data.push([]);
    for (var y = 0; y < gy; y++) {
      if (d[x][y] > max_v) {
        max_v = d[x][y];
      }
      data[x].push({
        x: x,
        y: y,
        px: x*incx,
        py: y*incy,
        width: incx,
        height: incy,
        value: d[x][y]
      })
    }
  }
  return [data, max_v];
}


export default function(pitch) {

  var enableInteraction = false,
    selected = [undefined, undefined],
    onSelect = function() {return;},
    onDeselect = function() {return;},
    fill = colorScale.interpolateGreens,
    stroke = '#00000011',
    selStroke = '#FF6600',
    strokewidth = 0.0,
    selStrokewidth = 0.5;

  function chart(g) {
    g.each(function (data) {
      var selx = selected[0];
      var sely = selected[1];

      const [dataObj, max_v] = gridData(data);
      const color = d3ScaleSequential(fill).domain([0, max_v]);

      var draw = g.call(pitch).select("#below");

      var cell = draw
        .selectAll("g")
        .data(dataObj)
        .enter().append("g") //removing
        .selectAll("rect") // these
        .data( function(d) { return d; } );

      cell.enter()
        .append("rect")
        .attr("id", function(d, i) { return "cell" + i; })
        .attr("class", "cell")
        .style("stroke", function(d) { return (selx === d.x && sely === d.y) ? selStroke : stroke; })
        .style("stroke-width", function(d) { return (selx === d.x && sely === d.y) ? selStrokewidth : strokewidth; })
        // .style("stroke", stroke)
        // .style("stroke-width", strokewidth)
        .style("fill", function(d) { return color(+d.value); })
        .attr("data", function(d) { return d.value; })
        .style("opacity", 0.75)
        .style("cursor", enableInteraction ? "crosshair" : "default")
        .attr("x", function(d) { return d.px; })
        .attr("y", function(d) { return d.py; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .on('mouseover', function (d) {
          if (enableInteraction)
            d3Select(this)
              .style('stroke', selStroke)
              .style('stroke-width', selStrokewidth)
          onSelect(d.x, d.y, d.value);
        })
        .on('mouseout', function (d) {
          if (enableInteraction)
            d3Select(this)
              .style('stroke', stroke)
              .style('stroke-width', strokewidth)
          onDeselect(d.x, d.y, d.value);
        })
    })
  }

  chart.fill = function (_) {
    if (!arguments.length) return fill;
    fill = _;
    return chart;
  };

  chart.selected = function (_) {
    if (!arguments.length) return selected;
    selected = _;
    return chart;
  };

  chart.onSelect = function (f) {
    onSelect = f;
    return chart;
  };

  chart.onDeselect = function (f) {
    onDeselect = f;
    return chart;
  };

  return chart;
}
