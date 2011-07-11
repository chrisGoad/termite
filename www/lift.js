(function () {
var lib = tu;


//idempotent
//{"v":v,"t":t} represents a value of type t

lib.typedConstant = function (x) {
  if (x && (typeof x == "object") && (x["v"] !== undefined) && x["t"]) {
    return new lib.Constant(x["v"],x["t"]);
  }
}

lib.quote = function (v,typ) {
  if (lib.isTerm(v)) return v;
  if (!v) return new lib.Constant(v,tp);
  var vtp = typeof v;
  if (!typ) {
    var rs = lib.typedConstant(v);
    if (rs) return rs;
  }
  if (vtp == "object") {
    lib.error("Can only quote literals")
  }
  return new lib.Constant(v,typ);
  
}

lib.Term.prototype.unquote = function () {
  return this.constantValue();
} 

/*
lib.Constant.prototype.unquote = function () {
  return this.value;
}

*/
lib.lift = function (v) {
  if (lib.isTerm(v)) return v;
  if ($.isArray(v)) {
    return lib.liftArray(v);
  }
  var tp = typeof v;
  if (tp == "string" || tp=="number" || tp=="boolean") {
    return lib.quote(v);
  }
  if (!v) {
    return lib.quote(v);
  }
  if (tp == "object") {
    var rs = lib.typedConstant(v);
    if (rs) return rs;
    return lib.liftDict(v);
  }
  lib.error("Unexpected");
}

/*
lib.TArray.prototype.unquote = function () {
  if (this.isConstant) {
    var a = this.array;
    rs = [];
    for (var i=0;i<a.length;i++) {
      var ae = a[i];
      rs.push(ae.unquote());
    }
    return rs;
  }
}



lib.Application.prototype.unquote = function () {
  if (this.isConstant) { //only for constructors
    var op = this.op;
    var a = this.arguments;
    rsa = [];
    for (var i=0;i<a.length;i++) {
      var ae = a[i];
      rsa.push(ae.unquote());
    }
    return new lib.Constructor(op,rsa);
  }
}
*/

// lift an array into the term  world; mk a TArray of constants 
lib.liftArray = function (a) {
  var rs = [];
  for (var i=0;i<a.length;i++) {
    rs.push(lib.lift(a[i]));
  }
  return new lib.TArray(rs);
}


/*
lib.TDict.prototype.unquote = function () {
  if (this.isConstant) {
    var d = d.dict;
    rs = {};
    for (var k in d) {
      var dv = d[k];
      rs[k] = dv.unquote();
    }
    return rs;
  }
}
*/

lib.liftDict = function (d) {
  var rs = {};
  for (var k in d) {
    rs[k] = lib.lift(d[k]);
  }
  return new lib.TDict(rs);
}


lib.elementsAreConstants = function (args) { // variables with constnt values also permitted
  var rs = true;
  for (var i=0;i<args.length;i++) {
    var ai = args[i];
    // grab values of bound variables, but that is all
    var k = ai.kind;
    if (k == lib.Variable) {
      var val = ai.value();
      if (!val.isConstant) return false;
    }
    if (!ai.isConstant) return false;
  }
  return true;
}


lib.arrayValues = function (args) {
  var ln = args.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    var pushDone = false;
    var ca = args[i];
    if (ca.isConstant) {
      rs.push(ca.constantValue());
      pushDone = true;
    } else {
      var k = ca.kind;
      if (k == lib.Variable) {
        var val = ca.value();
        if (val.isConstant) {
          rs.push(val.constantValue());
          pushDone = true;
        }
      }
    }
    if (!pushDone) rs.push(ca); // evaluate the args that we can, but pass on the ones that cannot be evaluated
  }
  return rs;
}


})();
