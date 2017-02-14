//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;



//Create a Pixi stage and renderer and add the 
//renderer.view to the DOM
var stage = new Container(),
    renderer = autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);
var explorer;
var exit = false;

var yTopOffset = 20;
var yBottomOffset;

//load an image and run the `setup` function when it's done
loader
  .add("images/treasureHunter.json")
  .load(setup);

function setup() {
	
	


	var id = PIXI.loader.resources["images/treasureHunter.json"].textures; 

	var dungeon = new Sprite(id['dungeon.png']);
	stage.addChild(dungeon);
  	
	explorer = new Sprite(id['explorer.png']);
	explorer.x = 68;

  	//Center the explorer vertically
  	explorer.y = stage.height / 2 - explorer.height / 2;
  	explorer.vx = 0;
  	explorer.vy = 0;
	stage.addChild(explorer);
	  	
	
	var left = keyboard(37),
	      up = keyboard(38),
	      right = keyboard(39),
	      down = keyboard(40);

	  //Left arrow key `press` method
	  left.press = function() {

	    //Change the cat's velocity when the key is pressed
	    explorer.vx = -5;
	    explorer.vy = 0;
	  };

	  //Left arrow key `release` method
	  left.release = function() {

	    //If the left arrow has been released, and the right arrow isn't down,
	    //and the explorer isn't moving vertically:
	    //Stop the explorer
	    if (!right.isDown && explorer.vy === 0) {
	      explorer.vx = 0;
	    }
	  };

	  //Up
	  up.press = function() {
	    explorer.vy = -5;
	    explorer.vx = 0;
	  };
	  up.release = function() {
	    if (!down.isDown && explorer.vx === 0) {
	      explorer.vy = 0;
	    }
	  };

	  //Right
	  right.press = function() {
	    explorer.vx = 5;
	    explorer.vy = 0;
	  };
	  right.release = function() {
	    if (!left.isDown && explorer.vy === 0) {
	      explorer.vx = 0;
	    }
	  };

	  //Down
	  down.press = function() {
	    explorer.vy = 5;
	    explorer.vx = 0;
	  };
	  down.release = function() {
	    if (!up.isDown && explorer.vx === 0) {
	      explorer.vy = 0;
	    }
	  };
































	var treasure = new Sprite(id['treasure.png']);
	treasure.x = stage.width - treasure.width - 48;
  	treasure.y = stage.height / 2 - treasure.height / 2;
	stage.addChild(treasure);
	  	
	yBottomOffset = stage.height - 35;
	var numberOfBlobs = 6,
      spacing = 48,
      xOffset = 150;

	  //Make as many blobs as there are `numberOfBlobs`
	  for (var i = 0; i < numberOfBlobs; i++) {

	    //Make a blob
	    var blob = new Sprite(id["blob.png"]);
	    blob.name = "blob"

	    //Space each blob horizontally according to the `spacing` value.
	    //`xOffset` determines the point from the left of the screen
	    //at which the first blob should be added.
	    var x = spacing * i + xOffset;

	    //Give the blob a random y position
	    //(`randomInt` is a custom function - see below)
	    var y = randomInt(yTopOffset, yBottomOffset - blob.height);

	    //Set the blob's position
	    blob.x = x;
	    blob.y = y;

	    //Add the blob sprite to the stage
	    stage.addChild(blob);
	  }
  	





	


  	renderer.render(stage);
  	console.log(stage)
 //  //Create the `cat` sprite, add it to the stage, and render it
 //  var sprite = new Sprite(
	//   resources["images/treasureHunter.json"].textures["explorer.png"]
	// );
  
}

function gameLoop() {

	if(exit) return;

  //Loop this function at 60 frames per second
  requestAnimationFrame(gameLoop);

  explorer.x += explorer.vx;
  explorer.y += explorer.vy;



  var blobs = stage.children.filter( child => child.name=="blob");
  
  var collision = blobs.map( blob => hitTestRectangle(explorer,blob) ).some( collision => collision == true);
  if(collision){
  	var text = new PIXI.Text('You Lose.',{fontFamily : 'Arial', fontSize: 40, fill : "white", align : 'center'});
	text.position.set(stage.width/2 - text.width/2, stage.height / 2 - text.height / 2);
	stage.addChild(text);
	renderer.render(stage);
	exit =true;
  }


  blobs.forEach(blob=>{
  	if(blob.shouldMoveDown === undefined) blob.shouldMoveDown = true;
  	if(blob.shouldMoveUp === undefined) blob.shouldMoveUp = false;

  	if(blob.y + 1 > yBottomOffset - blob.height && blob.shouldMoveDown){
  		blob.shouldMoveDown = false;
  		blob.shouldMoveUp = true;
  	}
  	if(blob.y - 1 < yTopOffset && blob.shouldMoveUp){
  		blob.shouldMoveDown = true;
  		blob.shouldMoveUp = false;
  	}
  	
  	if(blob.shouldMoveUp) blob.y -= 1.5
  	if(blob.shouldMoveDown) blob.y += 1.5
  	
  })

  //Render the stage to see the animation
  renderer.render(stage);
}

//Start the game loop
gameLoop();




function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}







function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}


function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};