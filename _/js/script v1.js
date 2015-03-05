function init() {

  var canvas = document.getElementById("easel"),
  centerX = canvas.width/2,
  centerY = canvas.height/2;

  var gridSize = 6;
  var gridSpacing = 125;
  var gridHeight = 896;
  var turn = "IF CIRCLES ARE";
  var currentRule = null;
  var prevRule;
  var rule = null;
  var rules = [];
  var operators = [];
  var selection = [];

  var gameObjects = [];

  var buttons = {
    row: {type: "axis", label: "IN ROW", property: "y", func: function(x, r) { return x == r }},
    col: {type: "axis", label: "IN COLUMN", property: "x", func: function(x, c) { return x == c }},
    bigger: {type: "comparison", label: "BIGGER THAN", property: "scaleX", func: function(a, b) { return a > b }},
    smaller: {type: "comparison", label: "SMALLER THAN", property: "scaleX", func: function(a, b) { return a < b }},
    eq: {type: "comparison", label: "EQUAL TO SIZE", property: "scaleX", func: function(a, b) { return a == b }},
    notEq: {type: "comparison", label: "NOT EQUAL TO SIZE", property: "scaleX", func: function(a, b) { return a != b }},
    s: {type: "size", label: "S", val: 1, func: getVal},
    m: {type: "size", label: "M", val: 2, func: getVal},
    l: {type: "size", label: "L", val: 3, func: getVal},
    xl: {type: "size", label: "XL", val: 4, func: getVal},
    and: {type: "operator", label: "AND", func: function(ruleFunc1, ruleFunc2) { return ruleFunc1 && ruleFunc2 }},
    or: {type: "operator", label: "OR", func: function(ruleFunc1, ruleFunc2) { return ruleFunc1 || ruleFunc2 }},
    scaleUp: {type: "action", label: "SCALE UP", val: 2},
    scaleDown: {type: "action", label: "SCALE DOWN", val: .5}
  }

  for (var i = 0; i < gridSize; i++) {
    var num = "p" + i;
    buttons[num] = {type: "position", label: i, val: i, func: getVal};
  }

  var stage = new createjs.Stage(canvas);
  createjs.Touch.enable(stage);

// BACKGROUND

  var bg = new createjs.Shape();
    bg.graphics.beginRadialGradientFill(["#EDC41D","#F6D034"],[0,.8],centerX,gridHeight/2,0,centerX,gridHeight/2,gridHeight);
    bg.graphics.rect(0,0,canvas.width,gridHeight);
    bg.cache(0,0,canvas.width,gridHeight);

// BUILD GRID

  var grid = new createjs.Shape();

    var gridLeft = ((canvas.width - ((gridSize-1) * gridSpacing))/2);
    var gridTop = ((gridHeight - ((gridSize-1) * gridSpacing))/2);

    grid.graphics.beginStroke("white");
    grid.graphics.setStrokeStyle(2);
    grid.alpha = .2;
    
    for (var i = 0; i < gridSize; i++) {
      grid.graphics.moveTo(gridLeft+(i*gridSpacing),0);
      grid.graphics.lineTo(gridLeft+(i*gridSpacing),gridHeight);
      grid.graphics.moveTo(0,(gridTop+(i*gridSpacing)));
      grid.graphics.lineTo(canvas.width,(gridTop+(i*gridSpacing)));
    }

  stage.addChild(bg);
  stage.addChild(grid);
  stage.update();

// CIRCLE OBJECT

  function Circle(id, color, scale, x, y) {
    this.id = id;
    this.color = color;
    this.scale = scale;
    this.x = x;
    this.y = y;
  }

// CONSTRUCT CIRCLES

  var row = 0;
  var column = 0;
  var sizeUnit = 15;

  function rowVal (r) {return (gridTop-gridSpacing)+((r+1)*gridSpacing)}
  function colVal (c) {return (gridLeft+(c*gridSpacing))}

  for (var i = 0; i < (gridSize*gridSize); i++) {

    var sizeMultiplier = getRandomInt(1,3);

    if (i/(row+1) == gridSize) {

      row++;
      column = 0;

    }

    if (i % 2 && row % 2) {
      var circleData = new Circle(i,"#fff",sizeMultiplier,colVal(column),rowVal(row));
    } else if (!(i % 2) && (row % 2)) {
      var circleData = new Circle(i,"#333",sizeMultiplier,colVal(column),rowVal(row));
    } else if (!(i % 2) && !(row % 2)) {
      var circleData = new Circle(i,"#fff",sizeMultiplier,colVal(column),rowVal(row));
    } else {
      var circleData = new Circle(i,"#333",sizeMultiplier,colVal(column),rowVal(row));
    }

    column++;

    var circle = new createjs.Shape();
      circle.graphics.beginStroke(circleData.color);
      circle.graphics.setStrokeStyle(4, null, null, null, true);
      circle.graphics.drawCircle(0,0,sizeUnit);
      circle.id = i;
      circle.originalColor = circleData.color;
      circle.x = circleData.x;
      circle.y = circleData.y;
      circle.scaleX = circleData.scale;
      circle.scaleY = circleData.scale;
      circle.cleared = false;

    gameObjects.push(circle);
    stage.addChild(circle);
    stage.update();

  }

// USER INPUT

    var tray = new createjs.Text(turn, "50px Arial", "BLACK");
          tray.lineWidth = 800;
          tray.lineHeight = 50;
          tray.x = (canvas.width - tray.lineWidth)/2;
          tray.y = gridHeight + 50;
          tray.textAlign = "left";
          tray.lineWidth = 800;
          tray.lineHeight = 50;

    stage.addChild(tray);
    stage.update();

// BUTTONS

    var buttonX1 = 0;
    var buttonX2 = 0;
    var buttonY = 0;

    var conditions = new createjs.Container();
    var positions = new createjs.Container();
    var sizes = new createjs.Container();
    var ops = new createjs.Container();
    var actions = new createjs.Container();

    for (var i in buttons) {
      
      if (buttons[i].type == "axis" || buttons[i].type == "comparison") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#4BCAFF");
          label.x = canvas.width/2;
          label.y = gridHeight + 300 + (buttonY * 50);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("eee");
          button.graphics.rect((canvas.width/2)-300, label.y, 600, 50);
          button.id = buttons[i];

          conditions.addChild(button,label);
          buttonY++;
      }

      if (buttons[i].type == "size") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#00CA9D");
          label.x = 617 + (buttonX1 * 100);
          label.y = gridHeight + 400;
          label.textAlign = "center";
          label.lineWidth = 100;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("eee");
          button.graphics.rect(label.x-50, label.y-25, 100, 100);
          button.id = buttons[i];

          sizes.addChild(button,label);
          buttonX1++;

      }

      if (buttons[i].type == "position") {

        buttonX = 0;

        var label = new createjs.Text(buttons[i].label, "50px Arial", "#00CA9D");
          label.x = 517 + (buttonX2 * 100);
          label.y = gridHeight + 400;
          label.textAlign = "center";
          label.lineWidth = 100;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("eee");
          button.graphics.rect(label.x-50, label.y-25, 100, 100);
          button.id = buttons[i];

          positions.addChild(button,label);
          buttonX2++;

      }

      if (buttons[i].type == "operator") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "black");
          label.x = canvas.width/2;
          label.y = gridHeight + 50 + (buttonY * 50);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("eee");
          button.graphics.rect((canvas.width/2)-300, label.y, 600, 50);
          button.id = buttons[i];

          ops.addChild(button,label);
          buttonY++;
      }

      if (buttons[i].type == "action") {
 
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#E01062");
          label.x = canvas.width/2;
          label.y = gridHeight + 100 + (buttonY * 50);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("eee");
          button.graphics.rect((canvas.width/2)-300, label.y, 600, 50);
          button.id = buttons[i];

          actions.addChild(button,label);
          buttonY++;
      }

      button.addEventListener("click", buttonClick);

      stage.addChild(conditions);
      stage.addChild(positions);
        positions.visible = false;
      stage.addChild(sizes);
        sizes.visible = false;
      stage.addChild(ops);
        ops.visible = false;
      stage.addChild(actions);
        actions.visible = false;
      stage.update();

    }

// TEMP METHOD OF CLEARING INPUT

    document.onkeypress = function(e) {
      var e = window.event;

      resetTurn();
      returnColors();

      conditions.visible = true;
      positions.visible = false;
      sizes.visible = false;
      ops.visible = false;
      actions.visible = false;
      stage.update();

    }

// SELECTION LOGIC

    function scaleVal(s) {
      return s;
    }

    function getVal(rule) {
        if (rule.property == "y") {
          return rowVal;
          } else if (rule.property == "x") {
          return colVal;
          } else {
          return scaleVal;
          }
        }

    function buttonClick(event) {

        turn = turn + " " + event.target.id.label;
        tray.text = turn;
        if (event.target.id.type == "axis") {
          rule = event.target.id;
          conditions.visible = false;
          positions.visible = true;
        }

        if (event.target.id.type == "comparison") {
          rule = event.target.id;
          conditions.visible = false;
          sizes.visible = true;
        }

        stage.update();

        if (currentRule != null) {
          prevRule = currentRule;
          //console.log("Prev Rule " + prevRule.label);
        }

        currentRule = event.target.id;
        //console.log("Current Rule " + currentRule.label);

        if (currentRule.type == "size" || currentRule.type == "position") {

          currentRule.func = getVal(rule);

          function buildRule(rFunc,rProp,tFunc,tVal) {
            return rules.push(function(i) {
              var r = rFunc(i[rProp],tFunc(tVal));
            return r;
            });
          }

          buildRule(rule.func,rule.property,currentRule.func,currentRule.val);

          selectCircles(null,rules[0],operators[0],rules[1],operators[1],rules[2]);

          positions.visible = false;
          sizes.visible = false;
          if (rules.length < 3) { ops.visible = true; }
          actions.visible = true;
          stage.update();

        }

        if (currentRule.type == "operator") {
          operators.push(currentRule.func);
          ops.visible = false;
          actions.visible = false;
          conditions.visible = true;
          stage.update();
        }

        if (currentRule.type == "action") {
          selectCircles(currentRule,rules[0],operators[0],rules[1],operators[1],rules[2]);
          actions.visible = false;
          ops.visible = false;
          conditions.visible = true;
          stage.update();
        } 
    }


    function selectCircles(action,r1,op1,r2,op2,r3) {

      if (action == null) {

        selection = [];
        returnColors();

        for (i in gameObjects) {

          if (gameObjects[i].cleared == false) {

            if (rules.length == 1) {

              if (r1(gameObjects[i])) {

              selection.push(gameObjects[i].id);

              var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#E01062")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            } else if (rules.length == 2) {

              if (op1(r1(gameObjects[i]),r2(gameObjects[i]))) {
                
                selection.push(gameObjects[i].id);

                var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#E01062")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            } else if (rules.length == 3) {

              if (op2(op1(r1(gameObjects[i]),r2(gameObjects[i]))),r3(gameObjects[i])) {
                
                selection.push(gameObjects[i].id);

                var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#E01062")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            }
          }
        }

      } else {

        for (i in selection) {

        var obj = gameObjects[selection[i]];
            obj.graphics
            .clear()
            .beginStroke("#E01062")
            .setStrokeStyle(4, null, null, null, true)
            .drawCircle(0,0,sizeUnit);
            obj.scaleX = (obj.scaleX*action.val);
            obj.scaleY = (obj.scaleY*action.val);
            stage.update();
          }

            checkCollision();
            checkShrunk();
            winTest();
            resetTurn();
            returnColors();
      }
    }

  // UTILITIES

    function collisionTest(id1,id2,x1,x2,y1,y2,r1,r2) {

      var xDist = x1 - x2;
      var yDist = y1 - y2;

      var distance = Math.sqrt( xDist*xDist + yDist*yDist );

      if ((r1+r2) >= distance) {
        //console.log("collision between " + id1 + " and " + id2);
        return true;
      } 
    }

    function checkCollision() {

      var collided = [];

        for (i in gameObjects) {

          var target = gameObjects[i];
          var targetRadius = (target.scaleX * sizeUnit);

          for (c in gameObjects) {

            var comparison = gameObjects[c];
            var comparisonRadius = (comparison.scaleX * sizeUnit);

            if (target != comparison) {

              if (collisionTest(target.id,comparison.id,target.x,comparison.x,target.y,comparison.y,targetRadius,comparisonRadius)) {

                if (collided.indexOf(target.id) == -1) {
                    collided.push(target.id);
                    // gameObjects[target.id].cleared = true;
                  }

              }
            }
          }
        }
        popCollided(collided);
      }

  function popCollided(arrayOfCollided) {

      for (i in arrayOfCollided) {

        gameObjects[arrayOfCollided[i]].graphics
          .clear()
          //.beginStroke(gameObjects[arrayOfCollided[i]].originalColor)
          .beginStroke("#E01062")
          .setStrokeStyle(4, null, null, null, true)
          .drawCircle(0,0,sizeUnit);
          gameObjects[arrayOfCollided[i]].scaleX = .2;
          gameObjects[arrayOfCollided[i]].scaleY = .2;
          gameObjects[arrayOfCollided[i]].alpha = .9;
          gameObjects[arrayOfCollided[i]].cleared = true;
          stage.update();

        }
  }

  function checkShrunk() {

    for (i in gameObjects) {

        var target = gameObjects[i];

        if (target.cleared == false && (target.scaleX * sizeUnit) < 5) {
            
            target.graphics
            .beginStroke("#E01062")
            .setStrokeStyle(4, null, null, null, true)
            .drawCircle(0,0,sizeUnit);
            target.scaleX = .2;
            target.scaleY = .2;
            target.alpha = .9;
            target.cleared = true;
            stage.update();

          }
      }
  }

  function winTest() {

    var wCount = 0;
    var bCount = 0;
    
    for (i in gameObjects) {

      var target = gameObjects[i];

      if (target.originalColor == "#fff" && target.cleared == false) {
        wCount++;
      }

      if (target.originalColor == "#333" && target.cleared == false) {
        bCount++;
      }
    }

    if (wCount == 0 && bCount == 0) {
      alert("DRAW");
    } else if (wCount == 0) {
      alert("WHITE WINS"); 
    } else if (bCount == 0) {
      alert("BLACK WINS");
    }

      console.log(wCount);
      console.log(bCount);

  }


  function returnColors() {

    for (i in gameObjects) {

        if (gameObjects[i].cleared == false) {

          var obj = gameObjects[i];
              obj.graphics
              .clear()
              .beginStroke(obj.originalColor)
              .setStrokeStyle(4, null, null, null, true)
              .drawCircle(0,0,sizeUnit);
              stage.update();
         } 
      }
  }

  function resetTurn() {

      currentRule = null;
      prevRule = null;
      rule = null;
      rules = [];
      operators = [];
      turn = "IF CIRCLES ARE";
      tray.text = turn;
      selection = [];
      collided = [];
      stage.update();

  }
 
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}