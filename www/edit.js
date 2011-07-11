(function () {
  var lib = tu;

lib.EditPanel = function () {
}

lib.deactivateEditPanel = function () {
  if (!lib.theEditPanel) return;
  if (!lib.theEditPanel.active) return;
  var trm = lib.theEditPanel.term;
  if (trm) trm.removeHighlight();

  lib.theEditPanel.containerJQ.remove();
  lib.theEditPanel.active = false;
  return;
  var jq = lib.theEditPanel.jq;
  var pjq = jq.parent();
  if (pjq.length == 0) lib.container.append(jq);
}


  lib.performReplace = function (trm,vl) {
    //var inputeE = this.inputElement;
   /* var dtr = this.dataRadios;
    var whichChecked = -1;
    for (var i=0;i<dtr.length;i++) {
      if (dtr[i].attr('checked')) whichChecked = i;
    }
    var nvl = this.inputElement.val();
    var numvl = parseFloat(nvl);
    if (isNaN(numvl)) {
      var vl = nvl;
    } else {
      vl = numvl;
    }
   */
    var mod = lib.replace(vl);
    var rt = trm.root();
    var stage = rt.stage;
    var path = trm.path();
    var op = new lib.Op(path,mod);
    lib.insertOp(stage,op);   
  }
  
  
  lib.EditPanel.prototype.performApply  = function () {
    var trm = this.term;
    var stage = this.stage;
    var aev = trm.evalStep();
    var path = trm.path();
    var op = new lib.Op(path,new lib.ApplyMod());
    lib.insertOp(stage,op);
  }


  
  lib.EditPanel.prototype.performEval  = function () {
    var trm = this.term;
    trm.stageEval();
    lib.redisplay();
  }
  
  
  
  lib.EditPanel.prototype.performExpand  = function () {
    var trm = this.term;
    var stage = this.stage;
    var aev = trm.evalStep();
    var path = trm.path();
    var op = new lib.Op(path,new lib.ExpandMod());
    lib.insertOp(stage,op);
  }

  lib.buildEditPanel = function (type) {
    var tname = type.name;
    var ecn =  $('<div class="editPanelContainer"> </div>');
    //lib.container.append(ecn);
    var edt = $('<span class="editPanel"></span>');

    var ein = $('<input type="text" size="10"></input>');
    var evalb = $('<input type="button" value="Eval"></input>');
    var apb = $('<input type="button" value="Apply"></input>');
    var exb = $('<input type="button" value="Expand"></input>');
    ecn.append(edt);
    edt.append(evalb);
    edt.append(apb);
    edt.append(exb);
    edt.append('<span> Replace with:</span>');
    var dataRadio = $('<span/>');
    var dataRs = [];
    function dtr(n) {
      var rs = $('<input type="radio" name = "data" value="sample'+n+'"></input>');
      var rcn = $('<span> sample'+n+'</span>');
      dataRadio.append(rcn);
      rcn.append(rs);
      dataRs.push(rs);
    }
    edt.append(dataRadio);
    
    dtr(1);dtr(2);dtr(3);
   
    edt.append(ein);
    var replaceBut = $('<input type="button" value="Replace"></input>');
    edt.append(replaceBut);
     var cancelBut = $('<input type="button" value="Cancel"></input>');
    edt.append(cancelBut);

    var rs = new lib.EditPanel();
    rs . inputElement = ein;
    rs.evalStepButton
    rs.jq = edt;
    rs.containerJQ = ecn;
    rs.applyButton = apb;
    rs.expandButton = exb;
    rs.evalButton = evalb;
    rs.replaceButton = replaceBut;
    rs.cancelButton = cancelBut;
    rs.dataRadios = dataRs;
    exb.hide();
    lib.editPanels[tname] = rs;
  }
  
  
  
  
  lib.buildEnumEditPanel = function (tp) {
    var ecn =  $('<div class="editPanelContainer"> </div>');
    var ks = [];
    for (var k in tp.values) {
      ks.push(k);
    }
    //lib.container.append(ecn);
    var edt = $('<span class="editPanel"></span>');
    ecn.append(edt);

    edt.append('<span> Replace with:</span>');
    var dataRadio = $('<span/>');
    var dataRs = [];
    function dtr(ch) {
      var rs = $('<input type="radio" name = "data" value="'+ch+'"></input>');
      var rcn = $('<span>'+ch+'</span>');
      dataRadio.append(rcn);
      rcn.append(rs);
      dataRs[ch] = rs;
    }
    edt.append(dataRadio);
    for (k in tp.values) {
      dtr(k);
    }
   
    var replaceBut = $('<input type="button" value="Replace"></input>');
    edt.append(replaceBut);
     var cancelBut = $('<input type="button" value="Cancel"></input>');
    edt.append(cancelBut);

    var rs = new lib.EditPanel();
    rs.jq = edt;
    rs.containerJQ = ecn;
    rs.replaceButton = replaceBut;
    rs.cancelButton = cancelBut;
    rs.dataRadios = dataRs;
    function nowChecked() {
      for (k in dataRs) {
        if (dataRs[k].attr("checked")) return k;
      }
    }
  
    rs.installCallbacks = function () {
      replaceBut.click(function () {
        var ch = nowChecked();
        var rr = rs; //debugging
        //var nvl = tp.values[ch];
        var ntrm = new lib.Constant(ch,tp);
        lib.performReplace(rs.term,ntrm);
        
      });
    }
    return rs;
    //lib.editPanels['color'] = rs;
  }


  
lib.popEditPanel = function (trm) {
  /*
  pop the panel just after the given stage */
  var ep = null;
  if (trm.kind == lib.Constant) {
    var tp = trm.type;
    if (tp) {
      var ep = lib.editPanels[tp.name];
    }
  }
  if (!ep) {
    ep = lib.editPanels["any"];
  }
  if (ep.active) {
    ep.term.removeHighlight();
  }
  /*
  var k = trm.kind;
  if (k == lib.Application) {
    if (trm.check()==true) {
      ep.applyButton.show();
    
      ep.applyButton.click(function () {
        ep.performApply();
      });
    } else {
      ep.applyButton.hide();
    }
  }
  if (trm.evalTarget()) {
    ep.evalButton.show();
    ep.evalButton.click(function () {
     ep.performEval();
    });
  }
  */
  /*
  if (k == lib.Let) {
    ep.expandButton.show();
    ep.expandButton.click(function () {
      ep.performExpand();
    });
  } else {
    ep.expandButton.hide();
  }
  */
  ep.cancelButton.click(lib.deactivateEditPanel);

  ep.term = trm;
  ep.active = true;
  trm.highlight(new lib.Highlight(null,{"color":"red"}));
  ep.active = true;
  var rt = trm.root();
  var stg = rt.stage;
  ep.stage = stg;
  var sjq = lib.stages[stg].containerJQ;
  sjq.after(ep.containerJQ);
 
 
  //lib.container.append(ep.containerJQ);
  ep.installCallbacks();
  var ps = trm.offset();
  var cps = lib.jqToPoint(lib.container.offset());
  var aps = ps.minus(cps);  
  //lib.theEditPanel.jq.css({'top':aps.y,'left':aps.x});
  ep.jq.css("left",aps.x);
  ep.x = aps.x;
  lib.theEditPanel = ep;
 // lib.positionLines(); // push down the lines below the editpanel
}

})();