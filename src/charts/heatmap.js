import { select as d3Select } from "d3-selection";
import { rgb as d3Rgb } from "d3-color";
import { scaleSequential as d3ScaleSequential } from "d3-scale";
import * as colorScale from 'd3-scale-chromatic';
import { createGridInterpolator } from 'bicubic-interpolate';


function position(el, parent) {
    var elPos = el.node().getBoundingClientRect();
    var vpPos = parent.node().getBoundingClientRect();

    return {
        top: elPos.top - vpPos.top,
        left: elPos.left - vpPos.left,
        width: elPos.width,
        bottom: elPos.bottom - vpPos.top,
        height: elPos.height,
        right: elPos.right - vpPos.left
    };
}


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
  return [data, max_v, gx, gy];
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
    interpolated = false,
    parent_el = 'body',
    selStrokewidth = 0.5;

  function chart(g) {
    g.each(function (data) {
      var selx = selected[0];
      var sely = selected[1];

      const [dataObj, max_v, gx, gy] = gridData(data);
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
        .style("fill", function(d) { return interpolated ? 'transparent' : color(+d.value); })
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

        if (interpolated) {
            var canvas  = d3Select(parent_el)
              .style('position', 'relative')
              .append("canvas")
              .style("z-index", -1)
              .style("position", 'absolute')
              .style("pointer-events", 'none')
            var bbox = position(g.select('#below'), d3Select(parent_el));
            var n = parseInt(bbox.height);
            var m = parseInt(bbox.width);
            var scaleX = (pitch.clip()[1][0] - pitch.clip()[0][0]) / 105;
            var scaleY = (pitch.clip()[1][1] - pitch.clip()[0][1]) / 68;
            if (pitch.rotate()) {
              scaleY = (pitch.clip()[1][1] - pitch.clip()[0][1]) / 105;
              scaleX = (pitch.clip()[1][0] - pitch.clip()[0][0]) / 68;
            }
            canvas
              .attr("width", m * scaleX)
              .attr("height", n * scaleY)
              .style("left", bbox.left + "px")
              .style("top", bbox.top + "px");

            const gridInterpolator = createGridInterpolator(
              data, { extrapolate: true });

            var context = canvas.node().getContext("2d"),
              image = context.createImageData(m, n);

            var l = 0;
            var halfGridSizeM = m / gy / 2;
            var halfGridSizeN = n / gx / 2;
            for (var j = 0; j < n; ++j) {
              for (var i = 0; i < m; ++i) {
                var v;
                if (pitch.rotate())
                  v = gridInterpolator(((n-j-halfGridSizeN)/n)*gx, ((i-halfGridSizeM)/m)*gy);
                else
                  v = gridInterpolator(((i-halfGridSizeM)/m)*gx, ((j-halfGridSizeN)/n)*gy);
                var c = d3Rgb(color(v || 0));
                image.data[l + 0] = c.r;
                image.data[l + 1] = c.g;
                image.data[l + 2] = c.b;
                image.data[l + 3] = 255;
                l += 4;
              }
            }
            context.putImageData(image, 0, 0);
        }
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


  chart.enableInteraction = function (_) {
    if (!arguments.length) return enableInteraction;
    enableInteraction = Boolean(_);
    return chart;
  };

  chart.interpolate = function (_) {
    if (!arguments.length) return interpolated;
    interpolated = Boolean(_);
    return chart;
  };

  chart.parent_el = function (_) {
    if (!arguments.length) return parent_el;
    parent_el = _;
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
