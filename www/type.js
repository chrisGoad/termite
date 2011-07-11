

/*
 
termite types  */
(function () {
  var lib = tu;
lib.types  = {};
var types = lib.types;
types.color = new lib.Type("color");
types.color.values = {"red":"red","green":"green","magenta":"magenta"};
types.any = new lib.Type("any");

})();


