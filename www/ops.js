

/*
 
termite operators  */
(function () {
  var lib = tu;
lib.op = {}

lib.opdef = {}

lib.opdef.concat = new lib.TFun(
    "concat",
    function () {
      var vls = lib.arrayValues(arguments);
      var rsa = [];
      for (var i=0;i<vls.length;i++) {
        rsa = rsa.concat(vls[i]);
      }
      return lib.liftArray(rsa);
    }, function () {
      var rs = lib.elementsAreConstants(arguments);
      if (rs) {
        return true;
      } else {
        return "Arguments must be constants";
      }
    }
  );

lib.op.concat = function () {
  return new lib.Application(lib.opdef.concat,arguments);
}


// a constructor




lib.opdef.Caption = new lib.TFun("Caption",null, function (o) {return false;},chartc.Caption);


lib.op.Caption = function () {
  return new lib.Application(lib.opdef.Caption,arguments,chartc.Caption);
}

lib.opdef.Graph = new lib.TFun("Graph",null, function (o) {return false;},chartc.Graph);



lib.op.Graph = function () {
  return new lib.Application(lib.opdef.Graph,arguments);
}




lib.opdef.CGraph = new lib.TFun("CGraph",null, function (o) {return false;},chartc.CGraph);

lib.op.CGraph = function () {
  return new lib.Application(lib.opdef.CGraph,arguments,true);
} 



lib.opdef.Chart = new lib.TFun("Chart",null, function (o) {return false;},chartc.Chart);

lib.op.Chart = function () {
  return new lib.Application(lib.opdef.Chart,arguments);
} 






lib.TDict.prototype.extend = function (x) {
  var rsd = {};
  for (var k in x) {
    if (a.hasOwnProperty(k)) {
      var kv = x[k];
      rsd[k] = kv.deepCopy();
    }
  }
  return new lib.TDict(rsd);
}

lib.opdef.extend = new lib.TFun(
    "extend",
    function (a,b) {
      return  a.extend(b);
    },
    function (a,b) {
      var rs = (a.kind == lib.TDict) && (b.kind == lib.TDict);
      if (rs) {
        return true;
      } else {
        return "Arguments must be TDicts";
      }
    }
  );


 

lib.op.extend = function () {
  return new lib.Application(lib.opdef.extend,arguments);
}
/* constructor = non evaluable term. assembler usually evaluates to a let(  const() */

lib.arrayToDict = function (a) {
  var rs = {};
  for (var i=0;i<a.length;i++) {
    rs[a[i]] = true;
  }
  return rs;
}
lib.TDict.prototype.filter  = function (props) {
  var pd = lib.arrayToDict(props);
  var d = this.dict;
  var rs = {};
  for (var k in d) {
    if (pd[k]) {
      var dk = d[k];      
      var dkc= dk.deepCopy();      
      rs[k] = dkc;
    }
  }
  var frs = new lib.TDict(rs);
  frs.deepSetPredecessor(this);
  return frs;
  
}

lib.opdef.mkCGraph = new lib.TFun(
  "mkCGraph",
  function (o) {
    var cop = o.filter(["color"]);
    var d = o.dict;
    var dt = d.data; // assumption; this is a constant = may be violated later - todo (don't allow execution if not constant)
    var cpc = new lib.Constant(dt.value);
    cpc.predecessor = dt;
    cop.setProperty("text",cpc);
    var cap = lib.op.Caption(cop);
    var g = lib.op.Graph(o.filter(["linewidth","color","data"]))
    return lib.op.CGraph(lib.lift({caption:cap,graph:g}));
  },
  function (o) {return true;} 
);


lib.op.mkCGraph = function () {
  return new lib.Application(lib.opdef.mkCGraph,arguments);
}

lib.opdef.repeat = new lib.TFun(
  "repeat",
  function (trm,nt) {
    var n = nt.unquote();
    var rs = [];
    for (var i=0;i<n;i++) {
      var cp = trm.deepCopy();
      cp.deepSetPredecessor(trm);
      rs.push(cp);
    }
    return new lib.TArray(rs);
  },
  function (trm,nt) {
    if (nt.isConstant) return true;
    else return "repeat count must be a constant"
  }
);


lib.op.repeat = function () {
  return new lib.Application(lib.opdef.repeat,arguments);
}

})();



