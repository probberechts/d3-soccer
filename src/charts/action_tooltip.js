import { select as d3Select, event as d3Event } from "d3-selection";
import { spadlActionTypes, spadlBodyparts, spadlResults } from '../config';
import actionTooltipFn from '../templates/action_tooltip.pug';
import css from '../styles/styles.css';

export default function() {

  var tooltip = d3Select("#tooltip");

  function chart(g) {
      if (!tooltip.size()) {
        tooltip = g
          .append("div")
          .attr("class", css.tooltip)
          .attr("id", "tooltip");
      }
  }

  chart.show = function (d) {
      tooltip
        .html(actionTooltipFn({
          type: spadlActionTypes[d.type_id].label,
          player: d.player_name || d.player_id,
          team: d.team_name || d.team_id,
          result: spadlResults[d.result_id].label,
          bodypart: spadlBodyparts[d.bodypart_id].label,
          time: d.time_seconds,
          start: {x: d.start_x, y: d.start_y},
          end: {x: d.end_x, y: d.end_y}
        }))
      tooltip
        .style("opacity", .95)
        .style("left", d3Event.pageX + "px")
        .style("top", d3Event.pageY + "px");
    return chart;
  };

  chart.hide = function () {
    tooltip
      .style("opacity", 0)
    return chart;
  };

  return chart;
}
