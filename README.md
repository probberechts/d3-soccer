# d3-soccer

A D3 plugin for visualizing event stream soccer data.

<div align="center">
  <img src="img/header-readme.png">
</div>

## Installing

If you use NPM, `npm install d3-soccer`. Otherwise, download the [latest release](https://github.com/probberechts/d3-soccer/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, a d3 global is exported:

```html
<script src="https://d3js.org/d3.v5.min.js"></script>
<script type="text/javascript" src="./dist/d3-soccer.js"></script>
<script type="text/javascript">
var h = 500;
var pitch = d3.pitch().height(h);
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", h);
  .append("svg:g")
  .call(pitch);
</script>
```

## Usage

See the examples directory.


