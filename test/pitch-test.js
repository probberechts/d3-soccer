// svg-test.js
var tape = require('tape-catch'),
    d3 = Object.assign({}, require("../"), require("d3-selection")),
    jsdom = require('./jsdom');

tape('call(pitch) creates an svg element', function(test) {
  var document = jsdom("<div></div>");
  var pitch = d3.pitch();
  let div = d3.select(document).select('div').call(pitch);
  var svg = div.select('svg');
  test.equal(svg.size(), 1, 'svg element exists');
  var g_pitch = div.select('g#pitch');
  test.equal(g_pitch.size(), 1, 'g#pitch element exists');
  var g_below = g_pitch.select('g#below');
  test.equal(g_below.size(), 1, 'g#below element exists');
  var g_lines = g_pitch.select('g#lines');
  test.equal(g_lines.size(), 1, 'g#lines element exists');
  var g_above = g_pitch.select('g#above');
  test.equal(g_above.size(), 1, 'g#above element exists');
  test.end();
});

tape('pitch can set height and width on svg element', function(test) {
  var document = jsdom("<div></div>");
  let div = d3.select(document).select('div');
  var pitch = d3.pitch().height(50);
  div.call(pitch);
  var svg = div.select('svg');
  test.equal(svg.attr('height'), '50', 'svg element has correct height');
  test.equal(svg.attr('width'), String(105/68*50), 'svg element has correct width');
  test.end();
});
