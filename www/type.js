

/*
 
termite types  */
(function () {
  var lib = tu;
lib.types  = {};
var types = lib.types;
types.color = new lib.Type("color");
types.color.values = {"red":"red","green":"green","magenta":"magenta"};
types.any = new lib.Type("any");

types.pwl = new lib.Type("pwl"); // piecewise linear
types.pwl.values =
  {"china":geom.arrayToPWL([[310,100],[350,125],[400,110],[490,145]]),
   "india":geom.arrayToPWL([[310,145],[340,135],[390,130],[450,140],[490,105]]),
   "usa":geom.arrayToPWL([[310,100],[400,100],[410,147],[490,142]])
  }
})();


