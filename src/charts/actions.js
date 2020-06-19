import { select as d3Select, mouse as d3Mouse } from "d3-selection";
import { drag as d3Drag } from "d3-drag";
import { hsl as d3HSL } from "d3-color";
import { symbol as d3Symbol, symbolTriangle as d3SymbolTriangle, symbolCross as d3SymbolCross} from "d3-shape";


/**
 * actions - draws a sequence of SPADL actions
 * on a pitch.
 *
 */
export default function(pitch) {

  var scale = 4;
  var showTooltip = false;
  var draggable = false;
  var teamColors = {};
  var onUpdate = () => undefined;

  /**
   * chart - constructor function.
   * Appends the plot to the g selection.
   *
   * @param g - d3 selection of elements to which the plot will be appended.
   */ 
  function chart(g) {
    g.each(function (data) {
      // Create the soccer pitch
      var actionsLayer = d3Select(this).call(pitch).select("#above");

      // Create an arrow symbol
      actionsLayer.append("svg:defs").append("svg:marker")
        .attr("id", "triangle")
        .attr("refX", 11)
        .attr("refY", 6)
        .attr("dy", 6)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")

      var dragHandler = d3Drag()
        .on("start", function() {
          d3Select(this).classed("active", true);
        })
        .on("drag", function (d) {
          var [x, y] = d3Mouse(actionsLayer.node());
          var marker = d3Select(this).attr("marker");
          d3Select(this)
            .attr("transform", "translate(" + (x)  + "," + (y) + ")");
          var action = d3Select(`#action-${d.action_id}`)
          if (marker === "marker-start") {
            action.select('line')
              .attr("x1", x)
              .attr("y1", y);
            var prev_action = d3Select(`#action-${d.action_id-1}`)
            prev_action.select('line')
              .attr("x2", x)
              .attr("y2", y);
          } else {
            action.select('line')
              .attr("x2", x)
              .attr("y2", y);
          }
        })
        .on("end", function(d) {
          var [x, y] = d3Mouse(actionsLayer.node());
          var marker = d3Select(this).attr("marker");
          d3Select(this).classed("active", false);
          var newData = data.slice()
          if (marker === "marker-start") {
            newData.find(a => a.action_id === d.action_id)["start_x"] = x;
            newData.find(a => a.action_id === d.action_id)["start_y"] = 68 - y;
            var prevAction = newData.find(a => a.action_id === d.action_id - 1)
            if (prevAction) {
              prevAction["end_x"] = x;
              prevAction["end_y"] = 68 - y;
            }
          } else {
            newData.find(a => a.action_id === d.action_id)["end_x"] = x;
            newData.find(a => a.action_id === d.action_id)["end_y"] = 68 - y;
          }
          onUpdate(newData);
        })

        // Select a unique color for each team
        var defaultColors = ["#FDB913", "#87CEEB"];
        for (const action of data) {
          if (action.team_id in teamColors === false) {
            if (Object.keys(teamColors).length >= 2)
              throw "You specified ids of teams that do not occur in the data!"
            else
              teamColors[action.team_id] = defaultColors[Object.keys(teamColors).length]
          }
        }

        // Draw the actions
        var update = actionsLayer.selectAll('g.action')
          .data(data);

        update
          .each(function(d, i) {
            d3Select(this).selectAll("*").remove();
            var action = d3Select(this)
              .attr("class", "action")
              .attr('id', `action-${d.action_id}`)
              .call(actiontypePlotFn[d.type_id]["plot"], d, (i+1), teamColors[d.team_id], scale);
            action.selectAll('g.symbol')
              .on('mouseover', d => showTooltip && showTooltip.show(d))
              .on('mouseout', () => showTooltip && showTooltip.hide())
          })

        update.enter().append('g')
        .attr("class", "action")
        .each(function(d, i) {
          var action = d3Select(this)
            .attr("class", "action")
            .attr('id', `action-${d.action_id}`)
            .call(actiontypePlotFn[d.type_id]["plot"], d, (i+1), teamColors[d.team_id], scale);
          action.selectAll('g.symbol')
              .on('mouseover', d => showTooltip && showTooltip.show(d))
              .on('mouseout', () => showTooltip && showTooltip.hide())
        })

        var last_action = actionsLayer.selectAll(".action:last-of-type")

        var mend = last_action.selectAll("g.marker-end").data(d => [d]).enter().append('g')
            .attr('class', 'marker marker-end')
            .attr('marker', 'marker-end')
            .attr('transform', function(d) {
              return "translate("+(d.end_x)+","+(68 - d.end_y)+")";
            });

          mend.append('circle')
            .attr('stroke-width', 0)
            .attr('fill', "#000")
            .attr('opacity', 0)
            .attr('r', 2);


        update.exit().remove();

        if (draggable)
          dragHandler(actionsLayer.selectAll("g.marker"));

    });

  }

  chart.showTooltip = function (_) {
    if (!arguments.length) return showTooltip;
    showTooltip = _;
    return chart;
  };

  chart.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };

  chart.draggable = function (_) {
    if (!arguments.length) return draggable;
    draggable = Boolean(_);
    return chart;
  };

  chart.teamColors = function (_) {
    if (!arguments.length) return teamColors;
    teamColors = _;
    return chart;
  };

  chart.onUpdate = function (f) {
    if (!arguments.length) return onUpdate;
    onUpdate = f;
    return chart;
  };

  return chart;
}

export const actiontypePlotFn = [
  { "label": "Pass", "plot": plotPass, "symbol": symbolPass},
  { "label": "Cross", "plot": plotPass, "symbol": symbolPass},
  { "label": "Throw in", "plot": plotPass, "symbol": symbolPass},
  { "label": "Freekick (cross)", "plot": plotPass, "symbol": symbolPass},
  { "label": "Freekick (short)", "plot": plotPass, "symbol": symbolPass},
  { "label": "Corner (cross)", "plot": plotPass, "symbol": symbolPass},
  { "label": "Corner (short)", "plot": plotPass, "symbol": symbolPass},
  { "label": "Dribble", "plot": plotDribble, "symbol": symbolDribble},
  { "label": "Foul", "plot": plotFoulWon, "symbol": symbolFoulWon},
  { "label": "Tackle", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "Interception", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "Shot", "plot": plotShot, "symbol": symbolShot},
  { "label": "Penalty", "plot": plotShot, "symbol": symbolShot},
  { "label": "Freekick (shot)", "plot": plotShot, "symbol": symbolShot},
  { "label": "Save", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "Claim", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "Punch", "plot": plotClearance, "symbol": symbolClearance},
  { "label": "Pick up", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "Clearance", "plot": plotClearance, "symbol": symbolClearance},
  { "label": "Bad touch", "plot": plotBlock, "symbol": symbolBlock},
  { "label": "-", "plot": () => null, "symbol": () => null},
  { "label": "Carry", "plot": plotCarry, "symbol": () => null},
  { "label": "Goal kick", "plot": plotPass, "symbol": symbolPass},
]


function plotShot(g, d, i, color, scale) {
  let strokeWidth = .1 * scale;
  let shot = g.classed('shot', true)
  // .on('mouseover', showDetail)
  // .on('mouseout', hideDetail)

    // line
  shot.append("line")
    .attr("x1", function (d) { return d.start_x })
    .attr("y1", function (d) { return 68 - d.start_y })
    .attr("x2", function (d) { return d.end_x })
    .attr("y2", function (d) { return 68 - d.end_y })
    .attr("stroke-width", strokeWidth)
    .attr("stroke", "black")
    .attr("marker-end", "url(#triangle)");

  var mstart = shot.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });
  
  mstart.call(symbolShot, d, i, color, scale);
}

function symbolShot(g, d, i, color, scale) {
  let radius = 1 * scale;
  let strokeWidth = .1 * scale;
  let shot = g.append('g')
    .attr('class', 'symbol shot')

  shot.append('circle')
    .attr('r', radius)
    .attr('stroke-width', strokeWidth)
    .attr('stroke', "grey")
    .attr('fill', color)

  shot.append("text")
    .attr('text-anchor', 'middle')
    .attr("dominant-baseline", "central")
    .style('font-size', (radius * .8) + 'px')
    .attr('fill', d3HSL(color).l >= 0.6 ? "#000" : "#fff")
    .text(i)
}

function plotPass(g, d, i, color, scale) {
  let strokeWidth = .1 * scale;
  let pass = g.classed('pass', true)
    // .on('mouseover', showDetail)
    // .on('mouseout', hideDetail)

  // line
  pass.append("line")
    .attr("x1", function (d) { return d.start_x })
    .attr("y1", function (d) { return 68 - d.start_y })
    .attr("x2", function (d) { return d.end_x })
    .attr("y2", function (d) { return 68 - d.end_y })
    .attr("stroke-width", strokeWidth)
    .attr("stroke", "#000")
    .attr("marker-end", "url(#triangle)");

  // start point
  var mstart = pass.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.call(symbolPass, d, i, color, scale);
}

function symbolPass(g, d, i, color, scale) {
  let radius = 1 * scale;
  let strokeWidth = .1 * scale;
  let pass = g.append('g')
    .attr('class', 'symbol pass')

  pass.append('circle')
    .attr('r', radius)
    .attr('stroke-width', strokeWidth)
    .attr('stroke', color)
    .attr('fill', "#fff")

  pass.append("text")
    .attr('text-anchor', 'middle')
    .attr("dominant-baseline", "central")
    .style('font-size', (radius * .8) + 'px')
    .attr('fill', "#000")
    .text(i)
}

function plotDribble(g, d, i, color, scale) {
  let strokeWidth = .1 * scale;
  let dribble = g.classed('dribble', true)
    // .on('mouseover', showDetail)
    // .on('mouseout', hideDetail)

    // line
    dribble.append("line")
      .attr("x1", function (d) { return d.start_x })
      .attr("y1", function (d) { return 68 - d.start_y })
      .attr("x2", function (d) { return d.end_x })
      .attr("y2", function (d) { return 68 - d.end_y })
      .attr("stroke-width", strokeWidth)
      .style("stroke-dasharray", "1,1")
      .attr("stroke", "black")
      .attr("marker-end", "url(#triangle)");

  var mstart = dribble.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.call(symbolDribble, d, i, color, scale);

}

function symbolDribble(g, d, i, color, scale) {
  let radius = 1 * scale;
  let strokeWidth = .1 * scale;
  let dribble = g.append('g')
    .attr('class', 'symbol dribble')

  dribble.append('circle')
    .attr('r', radius)
    .attr('stroke-width', strokeWidth)
    .attr('stroke', color)
    .attr('fill', "#fff")

  dribble.append("text")
    .attr('text-anchor', 'middle')
    .attr("dominant-baseline", "central")
    .style('font-size', (radius * .8) + 'px')
    .attr('fill', "#000")
    .text(i)
}

function plotCarry(g, d, i, color, scale) {
  let strokeWidth = .05;
  let radius = 1 * scale;
  let carry = g.classed('carry', true)
  // line
  carry.append("line")
    .attr("x1", function (d) { return d.start_x })
    .attr("y1", function (d) { return 68 - d.start_y })
    .attr("x2", function (d) { return d.end_x })
    .attr("y2", function (d) { return 68 - d.end_y })
    .attr("stroke-width", strokeWidth)
    .style("stroke-dasharray", "0.4,0.4")
    .attr("stroke", "grey");

  var mstart = carry.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.append('circle')
    .attr('stroke-width', 0)
    .attr('fill', "#000")
    .attr('opacity', 0)
    .attr('r', radius);
}

function plotClearance(g, d, i, color, scale) {
  let clearance = g.classed('clearance', true)

  // start point
  var mstart = clearance.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.call(symbolClearance, d, i, color, scale);
}

function symbolClearance(g, d, i, color, scale) {
  var size = 2*scale*scale;
  let strokeWidth = .1 * scale;
  let clearance = g.append('g')
    .attr('class', 'symbol clearance')

  var triangle = d3Symbol().size(size).type(d3SymbolTriangle)

  clearance.append("path")
    .attr('fill', color)
    .attr('stroke', 'grey')
    .attr('stroke-width', strokeWidth)
    .attr("d", triangle);

  clearance.append("text")
    .attr("dominant-baseline", "central")
    .style("text-anchor", "middle")
    .style('font-size', (scale * .8) + 'px')
    .attr('fill', d3HSL(color).l >= 0.6 ? "#000" : "#fff")
    .text(i)
}

function plotBlock(g, d, i, color, scale) {
  let block = g.classed('block', true)

  // start point
  var mstart = block.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.call(symbolBlock, d, i, color, scale);
}

function symbolBlock(g, d, i, color, scale) {
  var size = 2*scale;
  let strokeWidth = .1 * scale;
  let block = g.append('g')
    .attr('class', 'symbol block')

  block.append('rect')
    .attr('x', -size/2)
    .attr('y', -size/2)
    .attr('width', size)
    .attr('height', size)
    .attr('stroke-width', strokeWidth)
    .attr('stroke', "grey")
    .attr('fill', color)

  block.append("text")
    .attr('text-anchor', 'middle')
    .attr("dominant-baseline", "central")
    .style("text-anchor", "middle")
    .style('font-size', (size * .4) + 'px')
    .attr('fill', d3HSL(color).l >= 0.6 ? "#000" : "#fff")
    .text(i)
}

function plotFoulWon(g, d, i, color, scale) {
  let foul = g.classed('foul', true)

  // start point
  var mstart = foul.append('g')
    .attr('class', 'marker')
    .attr('marker', 'marker-start')
    .attr('transform', function(d) {
      return "translate("+(d.start_x)+","+(68 - d.start_y)+")";
    });

  mstart.call(symbolFoulWon, d, i, color, scale);
}

function symbolFoulWon(g, d, i, color, scale) {
  var size = 2*scale*scale;
  let strokeWidth = .1 * scale;

  let foul = g.append('g')
    .attr('class', 'symbol foul')

  var symbol = d3Symbol().size(size).type(d3SymbolCross)

  foul.append("path")
    .attr('fill', color)
    .attr('stroke', 'grey')
    .attr('stroke-width', strokeWidth)
    .attr("d", symbol)

  foul.append("text")
    .attr("dominant-baseline", "central")
    .style("text-anchor", "middle")
    .style('font-size', (scale * .8) + 'px')
    .attr('fill', d3HSL(color).l >= 0.6 ? "#000" : "#fff")
    .text(i)
}
