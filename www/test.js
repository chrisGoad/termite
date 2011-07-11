
var lib = tu;

lib.copy = function (els) {
  return [].concat(els);
}
lib.concat = function () {
  var a = arguments;
  var rs = [];
  for (var i=0;i<a.length;i++) {
    rs = rs.concat(a[i]);
  }
  return rs;
  
}

// v need not be evaluated, but cnt must be
lib.repeat = function (v,cnt) {
  var rs = [];
  for (var i=0;i<cnt;i++) {
    rs = rs.concat(v);
  }
  return rs;
}


function test0() {
var c0 = new lib.Constant( [1,2]);
var c1 = new lib.Constant([4,5]);
var c00 = new lib.Constant(23);
var constant3 = new lib.Constant(3);
var a0 = new lib.Application(lib.concat,"concat",[c0,c1]);
var a1 = new lib.TDict({"a":c00,"b":a0});
var zz = a0.path();
var yy = c1.path();
var ss = a1.select(yy);
var ok = ss == c1;
//var a2 = new lib.Application(lib.repeat,"repeat",[a0, new lib.Constant(3)]);
//var a1 = new lib.Application(lib.repeat,"repeat",[c0, new lib.Constant(3)]);
return a1;
//return a0.evalStep();

}


function test1() {
var c0 = new lib.Constant( [1,2]);
var c1 = new lib.Constant([4,5]);
var vx = new lib.Variable("x");
var vy = new lib.Variable("y");

var a0 = new lib.Application(lib.concat,"concat",[vx,vy]);
var d1 = new lib.TDict({"x":c0,"y":c1});
var lt = new lib.Let(d1,a0);
return lt;


}



function test2() {
var c0 = new lib.TArray([new lib.Constant(11),new lib.Constant(22)]);
//var c0 = new lib.Constant( [1,2]);
var c1 = new lib.TArray([new lib.Constant(33),new lib.Constant(44)]);
//var c1 = new lib.Constant([4,5]);
var vx = new lib.Variable("x");
var vy = new lib.Variable("y");
var a0 = new lib.Application(lib.concat,"concat",[vx,vy]);
var d1 = new lib.TDict({"x":c0,"y":c1});
var lt = new lib.Let(d1,a0);
return lt;


}



function otest3() {
var c0 = new lib.TArray([new lib.Constant(11),new lib.Constant(22)]);
//var c0 = new lib.Constant( [1,2]);
var c1 = new lib.TArray([new lib.Constant(33),new lib.Constant(44)]);
var c2 = new lib.liftArray([101,202]);
var c3 = new lib.liftArray([303,404]);
var a0 = new lib.Application(lib.ops.concat,[c2,c3]);

//var c1 = new lib.Constant([4,5]);
var vx = new lib.Variable("x");
var vy = new lib.Variable("y");
var a1 = new lib.Application(lib.ops.concat,[vx,vy,a0]);
var d1 = new lib.TDict({"x":c0,"y":c1});
var lt = new lib.Let(d1,a1);
return lt;


}



function test3() {
//var c0 = new lib.Constant( [1,2]);
var c2 = new lib.lift([101,202]);
var c3 = new lib.lift([303,404]);
var a0 = lib.ops.concat(c2,c3);

//var c1 = new lib.Constant([4,5]);
var vx = new lib.Variable("x");
var vy = new lib.Variable("y");
var a1 = lib.ops.concat(vx,vy,a0);
var d1 = new lib.lift({"x":[44,55],"y":[66,77]});
var lt = new lib.Let(d1,a1);
return lt;


}


data.sample1 = geom.arrayToPWL([[310,100],[350,125],[400,110],[490,145]]);

data.sample2 = geom.arrayToPWL([[310,145],[340,135],[390,130],[450,140],[490,105]]);

data.sample3 = geom.arrayToPWL([[310,100],[400,100],[410,147],[490,142]]);


function test4() {
  var color = lib.types.color;
  var pwl = lib.types.pwl;
  var colorv = new lib.Variable("color");
  var o = lib.lift({"color":{"v":"red","t":color},linewidth:4,"data":{"v":"china","t":pwl}});
  //var caption = lib.op.Caption(o);
  //var chartv = new lib.Variable("chartOptions");
  //var xt = lib.ops.extend(chartv,lib.lift({"color":colorv,"data":"()"}));
  var cg = lib.op.mkCGraph(o);
  var rp = lib.op.repeat(cg,lib.quote(2));
  
  var ch = lib.op.Chart(lib.lift({graphs:rp}));
  return ch;
  var graph = lib.ops.graph(lib.extend(chartParams,{"color":"color","data":"sample1"}));
  var graphLet = lib.Let({"color":"color"},[caption,graph]);
  var graphs = lib.ops.repeat(graphLet,2);
  var graphsLet = lib.Let({"color":"red","linewidth":2},graphs);
  
}



