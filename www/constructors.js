var tu = {};
(function () {


var lib = tu;

lib.stages = [];
lib.ops = [];
lib.container = null; // set to the jquery container that contains the stages

lib.params = {};

lib.params.lineSpacing = 20;
lib.params.panelOffset = 10;


lib.error = function (){
  a = arguments;
  console.log(a);
}
// A term function TFun maps term args to a term output, and determines wheterh the input terms are suitable for the computation

lib.TFun = function (name,func,checkInputs,constructor) {
  this.name = name;
  this.func = func;
  this.checkInputs = checkInputs;
  this.theConstructor = constructor;
}



lib.Term = function (kind) {
  this.kind = kind;
 
}



/* a path is a path into a term.  members of the path are {"appArg":n} or {"dictElement":n} or {selList":n} */

lib.Path = function (selectors) {
  this.selectors = selectors;
}



/* variables and references. Vars introduced by let 

let(x = 2,y=3) x+y
x:22,y:44}, plus(x,y))
*/

lib.Let = function (vars,body) {
  this.vars = vars; // vars is a TDict
  this.body = body;
  vars.parent = this;
  body.parent = this;
  this.isConstant = false;
}

lib.Let.prototype = new lib.Term(lib.Let);



lib.Variable = function (name) {
  this.name = name;
  this.isConstant = false;
}

lib.Variable.prototype = new lib.Term(lib.Variable);




lib.Constant = function (v) {
  this.value = v;
  this.isConstant = true;
}

lib.Constant.prototype = new lib.Term(lib.Constant);


lib.TDict = function (vl) {
  this.dict = vl;
  var nvl = {}
  var isConstant = true;
  for (k in vl) {
    var cc = vl[k];
    var tp = typeof cc;
    if (cc && (tp == "object")) {
      if (cc.constructor == lib.Term) {
        cc.parent = this;
      } else {
        lib.error("objects must be terms in TDict")
      }
      nvl[k] = cc;
      if (!cc.isConstant) isConstant = false;
    } else {
      nvl[k] = new lib.Constant(cc);
    }
    
  }
  this.dict = nvl;
  this.isConstant = isConstant;
  
}
lib.TDict.prototype = new lib.Term(lib.TDict);




lib.TArray = function (vl) {
  this.array  = vl;
  var nvl = [];
  var isConstant = true;
  for (var i=0;i<vl.length;i++) {
    var cc = vl[i];
    var tp = typeof cc;
    if (tp == "object") {
      if (cc.constructor == lib.Term) {
        cc.parent = this;
      } else {
        lib.error("tarray constructor expects terms or literals")
      }
      if (!cc.isConstant) isConstant = false;
      nvl[i] = cc;
    } else {
      nvl[i] = new lib.Constant(cc);
    }
    
  }
  this.array = nvl;
  this.isConstant = isConstant;
}

lib.TArray.prototype = new lib.Term(lib.TArray);



lib.Application = function (op,args) {
  this.op = op;
  var constructor = op.theConstructor;
  this.args = args;
  var ac = true;
  for (var i=0;i<args.length;i++) {
    var a = args[i];
    if (!a.isConstant) ac = false;
    a.parent = this;
  }
  if (constructor) {
    this.isConstant = ac;
  } else {
    this.isConstant = false;
  }
}

lib.Application.prototype = new lib.Term(lib.Application);

lib.Modification = function () {}



lib.Op = function (path,mod) {
  this.modification = mod;
  this.path = path;
}

lib.Constructor = function (op,args) {
  this.op = op;
  this.args = args;
}



})();

