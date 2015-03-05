function init() {

  var canvas = document.getElementById("easel"),
  centerX = canvas.width/2,
  centerY = canvas.height/2;

  var stage = new createjs.Stage(canvas);
  createjs.Touch.enable(stage);

  var gridSize = 6; // rows and columns count
  var gridSpacing = 125; // space between grid lines
  var gridHeight = 896; // height of grid
  var turn = "IF CIRCLES ARE"; // text for player's turn
  var currentRule = null; // last logic added to turn
  var prevRule; // prior logic added to turn
  var rule = null; // holder for turn function
  var rules = []; // array for rules 
  var operators = []; // array for operators
  var selection = []; // circles selected by user

  var gameObjects = []; // array for circles

// BUTTON OBJECTS

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
    scaleUp: {type: "action", label: "SCALE UP", val: 1},
    scaleDown: {type: "action", label: "SCALE DOWN", val: -1}
  }

  // get position buttons based on grid size

  for (var i = 0; i < gridSize; i++) {
    var num = "p" + i;
    buttons[num] = {type: "position", label: i, val: i, func: getVal};
  }

// BACKGROUND

  var bg = new createjs.Shape();
    bg.graphics.beginRadialGradientFill(["#EDC41D","#F6D034"],[0,.8],centerX,gridHeight/2,0,centerX,gridHeight/2,gridHeight);
    bg.graphics.rect(0,0,canvas.width,gridHeight);
    bg.cache(0,0,canvas.width,gridHeight);
    stage.addChild(bg);

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

  stage.addChild(grid);

  for (var i = 0; i < gridSize; i++) {
        var hLabel = new createjs.Text(i, "20px Arial", "#E01062");
        hLabel.x = (gridLeft-5) + (i*gridSpacing);
        hLabel.y = gridTop - 110;
        hLabel.alpha = .5;
      var vLabel = new createjs.Text(i, "20px Arial", "#E01062");
        vLabel.x = gridLeft - 110;
        vLabel.y = (gridTop-10) + (i*gridSpacing);
        vLabel.alpha = .5;
      stage.addChild(hLabel);
      stage.addChild(vLabel);
    }

  stage.update();

// CIRCLE OBJECT CONSTRUCTOR

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
  var sizeUnit = 14; // base circle size

  function rowVal (r) {return (gridTop-gridSpacing)+((r+1)*gridSpacing)} // calcs row
  function colVal (c) {return (gridLeft+(c*gridSpacing))} // calcs col
  function scaleVal(s) { return s; } // needed for consistency in getVal() func

  for (var i = 0; i < (gridSize*gridSize); i++) {

    var sizeMultiplier = getRandomInt(1,3); // random sizing for circles (S,M,L)

    if (i/(row+1) == gridSize) {

      row++;
      column = 0;

    }

    // generates alternating black and white circles

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

    // draws circle and stores key data

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

    gameObjects.push(circle); // add to circle object array
    stage.addChild(circle);
    stage.update();

  }

// TURN TRAY FOR USER LOGIC 

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

    var buttonX1 = 0; // for positioning
    var buttonX2 = 0; // for positioning
    var buttonY = 0; // for positioning

    // to contain each button set

    var conditions = new createjs.Container();
    var positions = new createjs.Container();
    var sizes = new createjs.Container();
    var ops = new createjs.Container();
    var actions = new createjs.Container();

    for (var i in buttons) {
      
      if (buttons[i].type == "axis" || buttons[i].type == "comparison") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#4BCAFF");
          label.x = canvas.width/2;
          label.y = gridHeight + 300 + (buttonY * 120);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("#E8E8E8");
          button.graphics.rect((canvas.width/2)-300, label.y-25, 600,100);
          button.id = buttons[i];

          conditions.addChild(button,label);
          buttonY++;
      }

      if (buttons[i].type == "size") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#00CA9D");
          label.x = 590 + (buttonX1 * 120);
          label.y = gridHeight + 310;
          label.textAlign = "center";
          label.lineWidth = 100;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("#E8E8E8");
          button.graphics.rect(label.x-50, label.y-35, 100, 120);
          button.id = buttons[i];

          sizes.addChild(button,label);
          buttonX1++;

      }

      if (buttons[i].type == "position") {

        buttonX = 0;

        var label = new createjs.Text(buttons[i].label, "50px Arial", "#00CA9D");
          label.x = 465 + (buttonX2 * 120);
          label.y = gridHeight + 310;
          label.textAlign = "center";
          label.lineWidth = 100;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("#E8E8E8");
          button.graphics.rect(label.x-50, label.y-35, 100, 120);
          button.id = buttons[i];

          positions.addChild(button,label);
          buttonX2++;

      }

      if (buttons[i].type == "operator") {
        var label = new createjs.Text(buttons[i].label, "50px Arial", "black");
          label.x = canvas.width/2;
          label.y = gridHeight - 360 + (buttonY * 110);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("#E8E8E8");
          button.graphics.rect((canvas.width/2)-300, label.y-25, 600, 100);
          button.id = buttons[i];

          ops.addChild(button,label);
          buttonY++;
      }

      if (buttons[i].type == "action") {
 
        var label = new createjs.Text(buttons[i].label, "50px Arial", "#E01062");
          label.x = canvas.width/2;
          label.y = gridHeight - 320 + (buttonY * 110);
          label.textAlign = "center";
          label.lineWidth = 1000;
          label.lineHeight = 100;

        var button = new createjs.Shape();
          button.graphics.beginFill("#E8E8E8");
          button.graphics.rect((canvas.width/2)-300, label.y-25, 600, 100);
          button.id = buttons[i];

          actions.addChild(button,label);
          buttonY++;
      }

      button.addEventListener("click", buttonClick); // event listener for clicking

      // place on stage and hide except initial button set

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

// CLEAR TRAY INPUT

    var reset = new createjs.Container();

    var resetLabel = new createjs.Text("RESET TURN", "25px Arial", "#E01062");
        resetLabel.x = 175;
        resetLabel.y = gridHeight + 60;
        resetLabel.textAlign = "center";
        resetLabel.lineWidth = 200;
        resetLabel.lineHeight = 100;

    var resetButton = new createjs.Shape();
          resetButton.graphics.beginFill("#E8E8E8");
          resetButton.graphics.rect(resetLabel.x-125, resetLabel.y-30, 250, 90);
          resetButton.id = buttons[i];

      reset.addChild(resetButton,resetLabel);
      stage.addChild(reset);
      stage.update();

      reset.addEventListener("click", resetTray);

    function resetTray() {

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

    // utility to make rule construction function generic

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

      // update turn text

      turn = turn + " " + event.target.id.label;
      tray.text = turn;
      if (event.target.id.type == "axis") {
        rule = event.target.id; // set rule id
        conditions.visible = false; // move to next button set
        positions.visible = true; // move to next button set
      }

      if (event.target.id.type == "comparison") {
        rule = event.target.id; // set rule id
        conditions.visible = false; // move to next button set
        sizes.visible = true; // move to next button set
      }

      stage.update();

      if (currentRule != null) {
        prevRule = currentRule; // track previous rule
      }

      currentRule = event.target.id; // track current rule

      if (currentRule.type == "size" || currentRule.type == "position") {

        currentRule.func = getVal(rule); // send in rule, return right calc for val

        // function to send in rule vars and construct specific rule to compute selection

        function buildRule(rFunc,rProp,tFunc,tVal) {
          return rules.push(function(i) {
            var r = rFunc(i[rProp],tFunc(tVal));
          return r;
          });
        }

        // building the rule for the array

        buildRule(rule.func,rule.property,currentRule.func,currentRule.val);

        // select circles to highlight, with no action yet

        selectCircles(null,rules[0],operators[0],rules[1],operators[1],rules[2]);

        positions.visible = false; // move to next button set
        sizes.visible = false; // move to next button set
        if (rules.length < 3) { ops.visible = true; } // if more operators allowed in turn (max 2)
        actions.visible = true; // move to next button set
        stage.update();

      }

      if (currentRule.type == "operator") {

        operators.push(currentRule.func); // add up to 2 logical operators

        ops.visible = false; // move to next button set
        actions.visible = false; // move to next button set
        conditions.visible = true; // move to next button set
        stage.update();
      }

      if (currentRule.type == "action") {

        // take action on selection

        selectCircles(currentRule,rules[0],operators[0],rules[1],operators[1],rules[2]);

        actions.visible = false; // return to first button set
        ops.visible = false; // return to first button set
        conditions.visible = true; // return to first button set
        stage.update();
      } 
    }

    // selecting circles to highlight, or take action on

    function selectCircles(action,r1,op1,r2,op2,r3) {

      if (action == null) {

        selection = []; // clear selection each time
        returnColors(); // clear colors each time

        for (i in gameObjects) {

          if (gameObjects[i].cleared == false) { // ignore cleared

            // if only one rule

            if (rules.length == 1) {

              if (r1(gameObjects[i])) {

              selection.push(gameObjects[i].id); // add to selection

              // highlight

              var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#00CA9D")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            // if two rules and one operator

            } else if (rules.length == 2) {

              if (op1(r1(gameObjects[i]),r2(gameObjects[i]))) {
                
                selection.push(gameObjects[i].id); // add to selection

                // highlight

                var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#00CA9D")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            // if three rules and two operators

            } else if (rules.length == 3) {

              if (op2(op1(r1(gameObjects[i]),r2(gameObjects[i])),r3(gameObjects[i]))) {
                
                selection.push(gameObjects[i].id); // add to selection

                // highlight

                var obj = gameObjects[i];
                obj.graphics
                .clear()
                .beginStroke("#00CA9D")
                .setStrokeStyle(4, null, null, null, true)
                .drawCircle(0,0,sizeUnit);
                stage.update();

              }

            }
          }
        }

      } else {

        // take action on highlighted circles

        for (i in selection) {

        // grow or shrink circles

        var obj = gameObjects[selection[i]];
            obj.graphics
            .clear()
            .beginStroke("#00CA9D")
            .setStrokeStyle(4, null, null, null, true)
            .drawCircle(0,0,sizeUnit);
            obj.scaleX = (obj.scaleX+=action.val);
            obj.scaleY = (obj.scaleY+=action.val);
            stage.update();
          }

            checkCollision(); // test all circles for collision
            checkShrunk(); // test if shrunk below 'vanishing' point
            winTest(); // test if anyone won or it's a draw
            resetTurn(); // reset turn, vars and arrays
            returnColors(); // reset unaffected circles to original colors
      }
    }

  // UTILITIES

    // checks if radius of two circles is greater than distance between their centers

    function collisionTest(id1,id2,x1,x2,y1,y2,r1,r2) {

      var xDist = x1 - x2;
      var yDist = y1 - y2;

      var distance = Math.sqrt( xDist*xDist + yDist*yDist );

      if ((r1+r2) >= distance) {
        //console.log("collision between " + id1 + " and " + id2);
        return true;
      } 
    }

    // collision test between every circle with every other, adds collided to array

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

                if (collided.indexOf(target.id) == -1) { // if not in array yet
                    collided.push(target.id); // then add
                  }

              }
            }
          }
        }
        popCollided(collided); // send in array of collided circles
      }

  // change style of collided circles

  function popCollided(arrayOfCollided) {

      for (i in arrayOfCollided) {

        // redraw as tiny circles

        gameObjects[arrayOfCollided[i]].graphics
          .clear()
          .beginStroke("#E01062")
          .setStrokeStyle(4, null, null, null, true)
          .drawCircle(0,0,sizeUnit);
          gameObjects[arrayOfCollided[i]].scaleX = .1;
          gameObjects[arrayOfCollided[i]].scaleY = .1;
          gameObjects[arrayOfCollided[i]].alpha = .9;
          gameObjects[arrayOfCollided[i]].cleared = true;
          stage.update();

        }
  }

  // checks if shrunk to 'vanishing' point

  function checkShrunk() {

    for (i in gameObjects) {

        var target = gameObjects[i];

        if (target.cleared == false && (target.scaleX * sizeUnit) < 5) { // ignore cleared
            
            // redraw as tiny circles

            target.graphics
            .beginStroke("#E01062")
            .setStrokeStyle(4, null, null, null, true)
            .drawCircle(0,0,sizeUnit);
            target.scaleX = .1;
            target.scaleY = .1;
            target.alpha = .9;
            target.cleared = true;
            stage.update();

          }
      }
  }

  // check if all circles of one color removed, or draw

  function winTest() {

    var wCount = 0; // white count
    var bCount = 0; // black count
    
    for (i in gameObjects) {

      var target = gameObjects[i];

      if (target.originalColor == "#fff" && target.cleared == false) {
        wCount++;
      }

      if (target.originalColor == "#333" && target.cleared == false) {
        bCount++;
      }
    }

    // alerts are temp!

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

  // return circles to original color after highlight if didn't collide or shrink enough

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

  // reset rules, arrays and the tray

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

  // for generating circle sizes
 
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}