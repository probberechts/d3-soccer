import { select as d3Select } from "d3-selection";
import { max as d3Max, extent as d3Extent } from "d3-array";
import { rgb as d3Rgb } from "d3-color";
import { scaleSequential as d3ScaleSequential } from "d3-scale";
import * as colorScale from 'd3-scale-chromatic';
import { pitchLenght, pitchWidth } from "../config";
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


export const grid = function() {

  function grid(d) {
    var data = [];
    var gx = d.length;
    var gy = d[0].length;
    var incx = pitchLenght / gx;
    var incy = pitchWidth / gy;

    var max_v = 0.;
    for (var x = 0; x < gx; x++) {
      for (var y = 0; y < gy; y++) {
        if (d[x][y] > max_v) {
          max_v = d[x][y];
        }
        data.push({
          i: x,
          j: y,
          x: x*incx,
          y: y*incy,
          width: incx,
          height: incy,
          value: d[x][y]
        })
      }
    }
    return data;
  }

  return grid;
}

export const rectbin = function() {
  var dx = 0.1,
      dy = 0.1,
      x = d => d[0],
      y = d => d[1];

  function trunc(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  }

  function rectbin(points) {
    var binsById = {};
    var xExtent = [0, 105];
    var yExtent = [0, 68];
    //var xExtent = d3.extent(points, function(d, i){ return x.call(rectbin, d, i) ;});
    //var yExtent = d3.extent(points, function(d, i){ return y.call(rectbin, d, i) ;});

    for (var Y = yExtent[0], pj = 0; Y < yExtent[1] - 0.0001; Y += dy, pj++) {
      for (var X = xExtent[0], pi = 0; X < xExtent[1] - 0.0001; X += dx, pi++) {
        var id = pi + '-' + pj;
        var bin = binsById[id] = [];
        bin.i = pi;
        bin.j = pj;
        bin.x = X;
        bin.y = Y;
        bin.width = dx;
        bin.height = dy;
        bin.value = 0;
      }
    }
    points.forEach(function(point, i) {
      var py = y.call(rectbin, point, i) / dy;
      var pj = trunc(py);
      var px = x.call(rectbin, point, i) / dx;
      var pi = trunc(px);

      var id = pi + '-' + pj;
      var bin = binsById[id];
      if (bin) {
        bin.push(point);
        bin.value += 1;
      }
    });
    return Object.values(binsById);
  }

  rectbin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return rectbin;
  };

  rectbin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return rectbin;
  };

  rectbin.dx = function(_) {
    if (!arguments.length) return dx;
    dx = _;
    return rectbin;
  };

  rectbin.dy = function(_) {
    if (!arguments.length) return dy;
    dy = _;
    return rectbin;
  };


  return rectbin;
};


export default function(pitch) {

  var enableInteraction = false,
      selected = [undefined, undefined],
      onSelect = function() {return;},
      onDeselect = function() {return;},
      color = d3ScaleSequential(colorScale.interpolateGreens).domain([undefined, undefined]),
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

      if (color.domain().some(isNaN)) {
        color.domain(d3Extent(data, d => d.value));
      }

      var draw = g.call(pitch).select("#below");

      var join = draw
        .selectAll("rect.cell") // these
        .data(data)

      var enterSel = join.enter()
        .append("rect")
        .attr("id", (d) => `cell(${d.i},${d.j})`)
        .attr("class", "cell")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("data", d => d.value)
        .style("stroke", function(d) { return (selx === d.x && sely === d.y) ? selStroke : stroke; })
        .style("stroke-width", function(d) { return (selx === d.x && sely === d.y) ? selStrokewidth : strokewidth; })
        .style("fill", function(d) { return interpolated ? 'transparent' : color(+d.value); })
        .style("cursor", enableInteraction ? "crosshair" : "default")
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

      join
        .merge(enterSel)
        .transition()
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("data", d => d.value)
        .style("fill", function(d) { return interpolated ? 'transparent' : color(+d.value); });

      join.exit()
        .transition()
        .attr('width', 0)
        .attr('height', 0)
        .remove();

      if (interpolated) {
          var gx = d3Max(data, d => d.i) + 1;
          var gy = d3Max(data, d => d.j) + 1;
          var grid = []
          for (var x = 0; x < gx; x++) {
            grid.push([]);
            for (var y = 0; y < gy; y++) {
              grid[x].push(data.find(d => d.i === x && d.j === y).value);
            }
          }

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
            grid, { 
              extrapolate: true,
              scaleX: pitch.rotate() ? gx / n : gx / m,
              scaleY: pitch.rotate() ? gy / m : gy / n,
              translateX: -.5,
              translateY: -.5
            });

          var context = canvas.node().getContext("2d"),
            image = context.createImageData(m, n);

          var l = 0;
          for (var j = 0; j < n; ++j) {
            for (var i = 0; i < m; ++i) {
              var v;
              if (pitch.rotate())
                v = gridInterpolator(n-j, i);
              else
                v = gridInterpolator(i, j);
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

  chart.colorScale = function (_) {
    if (!arguments.length) return color;
    color = _;
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
