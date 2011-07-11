(function () {
  var lib = tu;
// op n connects stage n and stage n+1

lib.editPanels = {}; //indexed by type

lib.Highlight = function (cls,style) {
  this.cls = cls;
  this.style = style;
}


lib.Highlight.prototype.apply = function (jq) {
  if (!jq) return;
  if (this.cls) {
    jq.addClass(this.cls);
  }
  if (this.style) {
    jq.css(this.style);
  }
}

lib.Term.prototype.highlight = function (h) {
  var jq = this.jq;
  if (jq) {
    h.apply(jq);
    this.hl = h;
    h.term = this;
  }
}

lib.Op.prototype.highlight = function (h) {
 this.hl = h;
 h.apply(this.jq);
}



lib.Op.prototype.unhighlight = function () {
   var jq = this.jq;
   if (jq) {
    jq.css(lib.baseStyle);
    var h = this.hl;
    if (h  && h.cls) {
      jq.removeClass(h.cls);
    }
    this.hl = undefined;
  }
}


lib.removedHighlights = [];

lib.baseStyle = {"color":"black"};

lib.Term.prototype.removeHighlight = function () {
  if (this.hl) {
    var jq = this.jq;
    var h = this.hl;
    if (h.cls) jq.removeClass(h.cls);
    jq.css(lib.baseStyle);
    this.hl = undefined;
    lib.removedHighlights.push(this.hl);
    
  }
}

lib.Term.prototype.removeHighlights = function () { // recurse down a term removing all highlights
  var fn = function (trm) {
    trm.removeHighlight();
  }
  this.map(fn);
}

lib.removeAllHighlights = function () {
  var st = lib.stages;
  for (var i=0;i<st.length;i++) {
    st[i].removeHighlights();
  }
}


lib.highlightOps =function (stage,ops,color) {
  var trm = lib.stages[stage];
  for (var i=0;i<ops.length;i++) {
    var cop = ops[i];
    var pth = cop.path;
    var st = trm.select(pth);
    var h = new lib.Highlight(null,{"color":color})
    st.highlight(h);
  }
}

lib.Let.prototype.highlight = function (h) {
  lib.highlightedTerm = this;
  h.apply(this.letEl);
  this.hl = h;
  h.term = this;

  //this.letEl.css("color",color);
}
/*

lib.Let.prototype.removeHighlight = function () {
  this.l
}
*/

lib.Let.prototype.toJQ = function (parent,subterm,indent) {
 if (this.jq) return this.jq;
  var cl = "Let";
  var rs = $('<span class="LetSpan"></span>');
  parent.append(rs);
  var letEl = $('<span class="'+cl+'">let</span>');
  this.letEl = letEl;
  var thisHere = this;
  
  letEl.click(function () {
      lib.popEditPanel(thisHere);

    //  lib.guiEvalStep(thisHere,lib.ApplyMod);
  });

  rs.append(letEl);
  rs.append("(");
  var vrs = this.vars;
  vrs.toJQ(rs,subterm,true,indent);
  rs.append(")");
  var bd = this.body;
  bd.toJQ(rs,subterm);
  this.jq = rs;
  if (this==subterm) {
    this.highlight(new lib.Highlight(null,{"color":"red"}));
  }
  return rs;
  
 //rs.click(function (){alert("TDict");})
}


lib.Variable.prototype.toJQ = function (parent,subterm,indent) {
   if (this.jq) return this.jq;
   if (this == subterm) {
    var cl = "VariableOperand";
  } else {
    cl = "VariableSpan";
  }
  var rs = $('<span class="'+cl+'"></span>');
  var thisHere = this;
  rs.click(function (e){
    e.stopPropagation();
    var p = thisHere.path();
    console.log("Variable; PATH ",p);
    console.log("Variable POS ",thisHere.offset());
    alert("constant");
  })
  parent.append(rs);
  var vl = this.name;
  //var st = JSON.stringify(vl);
  rs.html(vl);
  this.jq = rs;
  return rs;

}

lib.jqToPoint = function (jqp) {
  return new geom.Point(jqp.left,jqp.top);
}

lib.Term.prototype.offset = function () {
  var jq = this.jq;
  if (jq) {
    var rs = lib.jqToPoint(jq.offset());
    this.cOffset = rs;
    return rs;
  }
}

/*
lib.Constant.prototype.highlight = function (h) {
  lib.highlightedTerm = this;
  h.apply(this)
  this.jq.css("color",color);
}


lib.Constant.prototype.removeHighlight = function () {
  this.jq.css("color","black");
}
*/


lib.Constant.prototype.copy = function () {
  return new lib.Constant(this.value);
}

lib.Constant.prototype.toJQ = function (parent,subterm,indent) {
   if (this.jq) return this.jq;
  
  var cl = "ConstantSpan";
  var rs = $('<span class="'+cl+'"></span>');
  var thisHere = this;
  rs.click(function (e){
    e.stopPropagation();
    var p = thisHere.path();
    console.log("CONSTANT; PATH ",p);
    var ps = thisHere.offset();
    console.log("Constant POS ",ps.x,ps.y);
    lib.popEditPanel(thisHere);

  })
  parent.append(rs);
 
  var vl = this.value;
  var st = JSON.stringify(vl);
  rs.html(st);
  this.jq = rs;
  if (this==subterm) {
    this.highlight(new lib.Highlight(null,{"color":"red"}));
  }
  return rs;
}

//
// term dictionary; some descendants might be terms


lib.TDict.prototype.toJQ = function (parent,subterm,inLet,indent) {
 if (this.jq) return this.jq;
 if (this == subterm) {
    var cl = "TDictOperand";
  } else {
    cl = "TDictSpan";
  }
  var rs = $('<span class="'+cl+'"></span>');
  parent.append(rs);
  var nvl = {}
  var vl = this.dict;
  rs.append(" { ");
  var pairs = [];
  for (k in vl) {
   pairs.push([k,vl[k]]);
  }
  var ln = pairs.length;
  for (var i=0;i<ln;i++) {
    var cp = pairs[i];
    var ck = cp[0];
    var cv = cp[1];
    if (inLet) {
      rs.append(ck+'=');
    } else {
      rs.append('"'+ck+'":');
    }
    var tp = typeof cv;
    if ((tp == "object") && (cv.constructor == lib.Term)) {
      cv.toJQ(rs,subterm,indent+1);
    } else {
      rs.append(JSON.stringify(cv))
    }
    if (i<ln-1) {
      rs.append(",");
    }
  }
  rs.append(" } ");
  this.jq = rs;
  return rs;
 //rs.click(function (){alert("TDict");})
}



lib.TArray.prototype.toJQ = function (parent,subterm,inLet,indent) {
 if (this.jq) return this.jq;
 var wd = 0;
 if (this == subterm) {
    var cl = "TArrayOperand";
  } else {
    cl = "TArraySpan";
  }
  var rs = $('<span class="'+cl+'"></span>');
  parent.append(rs);
  var vl = this.array;
  rs.append($('<span> [ </span>'));
  var ln = vl.length;
  var jqs = [];
  for (var i=0;i<ln;i++) {
    var cv = vl[i];
    var tp = typeof cv;
    if ((tp == "object") && (cv.constructor == lib.Term)) {
      var cjq = cv.toJQ(rs,subterm);
      if (i<ln-1) {
        cjq.append(",");
      }
      jqs.push(cjq);
      wd = wd + cjq.width();
      console.log("width",cjq.width());
    } else {
      rs.append(JSON.stringify(cv))
    }
  
  }
  if (wd > 10) {
    for (var i=0;i<ln;i++) {
      cjq  = jqs[i];
      var wjq = cjq.wrap($('<div class="tline"/>'));
      wjq.css("margin-left",40);
    }
  }
  rs.append(" ] ");
  this.jq = rs;
  return rs;
 //rs.click(function (){alert("TDict");})
}


lib.Application.prototype.highlight= function (h) {
  lib.highlightedTerm = this;
  var opjq = this.opjq;
  h.apply(opjq);
}

lib.Application.prototype.removeHighlight = function () {
  if (this.opjq) {
    this.opjq.css(lib.baseStyle);
    var h = this.hl;
    if (h) {
      if (h.cls) this.opjq.removeClass(h.cls);
      this.hl = undefined;
    }
  }
}



lib.Application.prototype.toJQ = function (parent,subterm) {
  if (this.jq) return this.jq;
  var cl = "term";
  var rs = $('<span class="'+cl+'"></span>');
  parent.append(rs);
  var opel = $('<span class="operator"></span>');
  this.opjq = opel;
  rs.append(opel);
  opel.html(this.op.name);
  var thisHere = this;
  opel.click(function () {
    lib.popEditPanel(thisHere);
    return;
  })
  rs.append("(");
  var args = this.args;
  var ln = args.length;
  for (var i=0;i<ln;i++) {
    var a = args[i];
    var el = a.toJQ(rs,subterm);
    rs.append(el);
    if (i < ln-1) rs.append(",");
  }
  
  rs.append(")");
  this.jq = rs;
  if (this==subterm) {
    this.highlight(new lib.Highlight(null,{"color":"red"}));
  }
  return rs;

}





lib.Modification.prototype.toJQ = function (parent) {
  if (this.kind == "replace") {
    var nv = this.newValue;
    if (nv.constructor == lib.Term) {
      
    } else {
      var rs = $('<span class="modification"><= '+nv+'</span>');
      parent.append(rs);
      this.jq = rs;
    }
  }
  if (this.kind == "apply") {
    rs = $('<span class="modification">Apply</span>')
    parent.append(rs);
    this.jq  = rs;
  }
  if (this.kind == "expand") {
    rs = $('<span class="modification">Expand Let</span>')
    parent.append(rs);
    this.jq  = rs;
  }
  return rs;
}

/*
lib.Constant.prototype.applyModification = function (mod) {
  if (mod.kind == "replace") {
    var nc = new lib.Constant(mod.newValue);
    var rs =  this.replaceToRoot(nc);
    rs.findBinders();
    return rs;
  }
}
*/



lib.Op.prototype.toJQ = function (parent) {
  var mod = this.modification;
  if (this.failed) {
    var fjq = $('<span class="failedOp">Failed: </span>')
    parent.append(fjq);
    mod.toJQ(fjq);
    this.jq = fjq;
  } else {
    mod.toJQ(parent);
    this.jq = mod.jq;
  }
  return this.jq;
}

lib.Op.prototype.clearJQ = function () {
  this.jq = undefined;
  this.containerJQ = undefined;
}
/*
lib.ApplyMod = function (path) {
  this.path = path;
}
*/

lib.Term.prototype.applyOp = function (op) {
  var subterm = this.select(op.path);
  if (typeof subterm == "string") return "Term no longer present";
  return subterm.applyModification(op.modification,op);

}


// subterm is the term to which 

lib.addLineForStage = function (trm) {
  var tdpy = lib.container;
  var cjq = trm.containerJQ;
  if (cjq) {
    if (cjq.parent().length == 0) tdpy.append(cjq);
    //tdpy.append(cjq);
    cjq.show();
    return;
  }
  var ntrm = $("<div class='stage'></div>");
  
  trm.containerJQ = ntrm;
  var stg = trm.stage;
  var ops = lib.ops;
  var ln = ops.length;
  if (stg < ln) {
    // select the subterm to which the next operation applies
    var subterm = trm.select(ops[stg].path);
  }
  tdpy.append(ntrm);
  trm.toJQ(ntrm,subterm,0);
  trm.activeSubterm = subterm; // term to which the next operation applies
  console.log("height ",trm.jq.height());
}


lib.addLineForOp = function (e) {
  var tdpy = lib.container;
  var ejq = e.containerJQ;
  if (ejq) {
    ejq.show();
    return;
  }
  var ned = $("<div class='op'></div>");
  tdpy.append(ned);
  e.toJQ(ned,0);
  e.containerJQ = ned;
}


lib.hideStages = function (fromStage,remove) {
  var ln = lib.stages.length;
  for (var i =fromStage;i<ln;i++) {
    var stg = lib.stages[i];
    var cjq = stg.containerJQ;
    if (cjq) {
      if (remove) cjq.remove(); else cjq.hide();
    }
    var opi = i-1; // the op that led to the stage just hidden
    if (opi<0) continue;
    if (opi < ln-1) {
      cjq = lib.ops[opi].containerJQ;
      if (cjq) {
        if (remove) cjq.remove(); else cjq.hide();
      }
    }
  }
}


lib.removeStages = function (fromStage) {
  lib.hideStages(fromStage,true);
}

lib.displayStages = function () {
  lib.hideStages(0);
 
  lib.deactivateEditPanel();
  var ln = lib.ops.length;
  var replaceStage = -1; // stage at which a sequence of replacements begins
  var replaceOps = []; // sequence of adjacent replace ops NOT TAKEN INTO ACCOUNT: replaces within replaces
  var lastWasReplace = false;
  for (var i=0;i<ln;i++) {
    var isReplaceFinalStage = false;
    var nop = lib.ops[i];
    var isReplace = nop.modification.kind == "replace"; // consolidate replaces; if the next stage is the 
    if ((!lastWasReplace) || (!isReplace)) {
      if (replaceOps.length > 0) {
        lib.highlightOps(replaceStage,replaceOps,"red");
        isReplaceFinalStage = true;
      }
      lib.addLineForStage(lib.stages[i]);
      if (isReplaceFinalStage) lib.highlightOps(i,replaceOps,"green");

      replaceStage = i; // candidate, anyway
      replaceOps = [];
    }
    lib.addLineForOp(nop);
    if (isReplace) replaceOps.push(nop);
    lastWasReplace = isReplace;
  }
  lib.addLineForStage(lib.stages[ln]);
  //lib.positionLines();
}

  lib.clearTermJQ = function (trm) {
    trm.jq = undefined;
    trm.containerJQ = undefined;
    
  }
  
  lib.Term.prototype.clearJQ  = function () {
    this.map(lib.clearTermJQ);
  }
  
  lib.clearJQ = function () {
    for (var i=0;i<lib.ops.length;i++) {
      var cs = lib.stages[i];
      cs.clearJQ();
      var op = lib.ops[i];
      op.clearJQ();
    }    
     lib.stages[lib.stages.length-1].clearJQ();
  }
  
  lib.afterRedisplay = null;
  
  lib.redisplay = function () {
    lib.container.empty();
    lib.clearJQ();
    lib.displayStages();
    if (lib.afterRedisplay) {
      lib.afterRedisplay();
    }
  }
  
  
  lib.back = function (toFirst) {
    var ln = lib.stages.length;
    if (ln <= 1) return;
    if (toFirst) {
      ln = 2;
    }
    lib.removeStages(ln-1);
    lib.stages.length = ln-1;
    lib.ops.length = ln-2;
    lib.redisplay();
    
  }
  
  
  lib.insertOp = function (stage,op) {
    lib.ops.splice(stage,0,op);
    lib.deactivateEditPanel();
    lib.execOpsFromStage(stage);
    lib.redisplay();   // lib.displayStages had problems ; @todo slightly more efficient; check on this    
  }
  
  lib.lastTerm = function () {
    return lib.stages[lib.stages.length-1];
  }
  
  lib.topEvalStep = function () {
    var trm = lib.lastTerm();
    trm.stageEvalStep();
    lib.redisplay();
  }
  
  
  lib.topEval = function () {
    var trm = lib.lastTerm();
    trm.stageEval();
    lib.redisplay();
  }
  

  
  lib.init = function (container) {
    lib.container = container;
    var buttons = $('.topButtons');
    var b = $('<input  type="button" value="<<"/>');
    buttons.append(b);
    b.click(function () {lib.back(true);});
    b = $('<input type="button" value="<"/>');
    buttons.append(b);
    b.click(function () {lib.back(false);});
    b = $('<input type="button" value=">"/>');
    buttons.append(b);
    b.click(lib.topEvalStep);
    b = $('<input type="button" value=">>"/>');
    buttons.append(b);
    b.click(lib.topEval);
   
    lib.buildEditPanel(lib.types.any);
    lib.editPanels["color"] = lib.buildEnumEditPanel(lib.types.color);
    lib.editPanels["pwl"] = lib.buildEnumEditPanel(lib.types.pwl);
  }


lib.Term.prototype.displayTrace = function (color) {
  var tr = this.trace();
 
  for (var i=0;i<tr.length;i++) {
    var ct = tr[i];
    var h = new lib.Highlight("trace",{"color":color});
    ct.highlight(h);
   
  }
}


lib.displayProps = function (td) {
  lib.removeAllHighlights();
  var pv = $('.propViewer');
  var d = td.dict;
  var tcolors = ["magenta"];
  var tcln = tcolors.length;
  var cnt = 0;
  for (var k in d) {
    var vt = d[k];
    vt.displayTrace(tcolors[cnt%tcln]);
    cnt++;
    continue;
    var p = vt.path();
    rt.hi
    var v = vt.constantValue();
    var ddv = $('<div class="propLine"></div>');
    pv.append(ddv);
    var psp = $('<span class="propName"></span>');
    ddv.append(psp);
    psp.html(k);
    ddv.append(":");
    var pvsp = $('<span class="propValue"></span>');
    ddv.append(pvsp);
    pvsp.html(v);
  }
}


})();


