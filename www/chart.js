var chartlib = {};
var chartc = {}; // chart constructors
var data = {};

chartc.Caption = function (o) {
  this.options = o;
}




chartc.Graph= function (o) {
  this.options = o;
}


chartc.CGraph= function (o) {
  this.options = o;
}


chartc.Chart = function (o) {
  this.options = o;
};

//alert(11);

//var jjj = 22;

(function () {


//(function () {})();
  
  var lib = chartlib;

lib.Chart = function (graphs) {
  this.graphs = graphs;
}


// extent is pixels of canvas extent; xbounds are in domain space


lib.Chart.prototype.getExtent = function () {
  var cnv = this.canvas;
  this.extent = new geom.Point(cnv.width(),cnv.height());
}

lib.Chart.prototype.init = function (args) {
  lib.xferProps(this,args,["canvas","captionDiv","xbounds"]);
  var cnv = args.canvas;
  this.context = cnv[0].getContext('2d');
  this.getExtent();
  var thisHere = this;
  cnv.unbind('click');
  cnv.click(function (e) {
    thisHere.handleClick(e);
    });
}



lib.Chart.prototype.clear = function () {
  var ctx = this.context;
  var xt = this.extent;
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,xt.x,xt.y);
  this.captionDiv.empty();
}

lib.Chart.prototype.handleClick = function (e) {
  var gs = this.graphs;
  for (var i=0;i<gs.length;i++) {
    var g = gs[i];
    g.handleClick(e);
  }
}

lib.Chart.prototype.drawLine = function (pwl,xf,style,width) {
  var  points = pwl.points;
  var yxt = this.extent.y;  // need to flip these fellows
  var ln = points.length;
  if (ln < 2) return;
  var ctx = this.context;
  if (style) {
    ctx.strokeStyle=style;
  }
  if (width) {
    ctx.lineWidth = width;
  }
  ctx.beginPath();
  var p0 = xf(points[0]);
  ctx.moveTo(p0.x,yxt - p0.y);
  for (var i=1;i<ln;i++) {
    var p = xf(points[i]);
    ctx.lineTo(p.x,yxt- p.y);
  }
  ctx.stroke();
}

lib.xferProps = function (dst,src,props) {
  for (var i=0;i<props.length;i++) {
    var p = props[i];
    var v = src[p];
    if (v !== undefined) {
      dst[p] = v;
      
    }
  }
}

lib.Caption = function (args) {
  lib.xferProps(this,args,["text","color","graph"]);
}

lib.Caption.prototype.draw = function () {
  var g = this.graph;
  var ch = g.chart;
  var capspan = $('<span class="caption"></span>');
  var c = this.color;
  if (c) {
    capspan.css("color",c);
  }
  ch.captionDiv.append(capspan);
  capspan.html(this.text);
}


lib.Graph = function (args) {
  lib.xferProps(this,args,["chart","caption","ybounds","style","lineWidth"]);
  var yb = args.ybounds;
  var xb = args.chart.xbounds;
  var xt = args.chart.extent;
  var rxb = new geom.Bounds(0,xt.x);
  var ryb = new geom.Bounds(0,xt.y);
  var lx = new geom.LinearFromBoundsPair(xb,rxb);
  var ly = new  geom.LinearFromBoundsPair(yb,ryb);
  this.pointMap = new geom.Linear2(lx,ly);
  this.inversePointMap = this.pointMap.inverse();
  var cnv =  args.chart.canvas;
 
}


lib.Graph.prototype.toGraphCoords = function (p) {
  var yxt = this.chart.extent.y;  // need to flip these fellows
  p.y = yxt - p.y;
  var rs = this.inversePointMap.apply(p);
  
  return rs;
}


lib.Graph.prototype.handleClick = function (e) {
  var gc = this.toGraphCoords(new geom.Point(e.offsetX,e.offsetY));
  var rx = gc.x;
  var fv = this.curve.value(rx);
  var clicked = (Math.abs(fv-gc.y) <= 3);
  if (clicked) {
    var pp = this.predecessor.predecessor; // go back to the chartc, then to the term that produced it
    var d = pp.args[0];
    lib.displayProps(d);
  }
}

lib.Graph.prototype.draw = function () {
  var pm  = this.pointMap;
  var xf = function (p) {
    return pm.apply(p);
  }
  var cap = this.caption;
  if (cap) cap.draw();
  this.chart.drawLine(this.curve,xf,this.style,this.lineWidth);

}


lib.Chart.prototype.draw = function () {
  this.clear();
  var g = this.graphs;
  for (var i=0;i<g.length;i++) {
    var cg = g[i];
    cg.draw();
  }
}


chartc.Caption.prototype.toChart = function (gr) {
  var rs = new lib.Caption(this.options);
  rs.text = this.options.caption;
  rs.graph = gr;
  return rs;  
}

chartc.Graph.prototype.toChart = function (ch) {
  var o = this.options;
  var color = o.color;
  var lw = o.linewidth;
  var dt = o.data;
  var dtv = data[dt];
  var yb = new geom.Bounds(95,150);
  var gr = new chartlib.Graph({chart:ch,ybounds:yb,style:color,lineWidth:lw});
  gr.curve = dtv;
  gr . predecessor = this;
  return gr;
}


chartc.CGraph.prototype.toChart = function (ch) {
  var o = this.options;
  var g  = o.graph;
  var c = o.caption;
  var rs = g.toChart(ch);
  rs.caption = c.toChart(rs);
  return rs;
}


chartc.Chart.prototype.toChart = function (chartargs) {
  var a = this.options;
  var g = a.graphs;
  var rg = [];
  var rs = new lib.Chart(rg);
  rs.init(chartargs);
  for (var i=0;i<g.length;i++) {
    var cg = g[i];
    rg.push(cg.toChart(rs));
  }
  return rs;
}



})();


