function sign(n){
  return n < 0 ? -1 : 1;
}

// Location for dragging
int dragX, dragY;

// Mouse x, mouse y, for use with scaling
int mx, my;

// Global variables for Edit mode

int newX, newY;

edit = false;

// Show trails
trails = true;

// Drag viewport
drag = false;

// Display HELP
help = false;

currentBody = null;
currentForce = null;


placeForce = false;
newForceX = 0;
newForceY = 0;

chooseMass = false;
newMass = 1000;

// UNIVERSE SETTINGS
G = 0.1;
TIME_SCALE = 5;
DISTANCE_SCALE = 0.5;
STAR_MASS = 500;
BLACK_HOLE_MASS = 10000;
CRITICAL_MASS = 8000;
SCALE = 1.0;

// Body class
class Body{
  Body(float mass, float radius, int x, int y, double vx, double vy){
    this.mass = mass;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.fixed = false;
      
    if(this.mass > STAR_MASS) this.starLifetime = mass/2;
  }
}

function calculateRadius(mass){
  return 1+Math.sqrt(mass);
}         

// Array of bodies to draw
bodies = [];

// Force class
class Force{
  Force(int x, int y, int x2, int y2){
    this.x = x;
    this.y = y;
    
    this.x2 = x2;
    this.y2 = y2;
  }
}

// Array of forces to draw
forces = [];

function checkStars(){
  for(i in bodies){
    if(bodies[i].starLifetime != null){
      
      // Is a star
      if(bodies[i].starLifetime > 0){
        // Decrease lifetime
        bodies[i].starLifetime -= 0.5;
        
        // Increase radius
        //bodies[i].radius = calculateRadius(bodies[i].mass);
      } else {
        // Go nova
        if(bodies[i].mass != 1){
          if(bodies[i].mass > 20){
            mass = bodies[i].mass/20;
          } else {
            mass = bodies[i].mass-1;
          }
          
          flyoffSpeed = bodies[i].mass/200;
          
          vx = random(-flyoffSpeed, flyoffSpeed);
          vy = random(-flyoffSpeed, flyoffSpeed); 
                                    
          bodies[i].mass -= mass;
          bodies[i].radius = calculateRadius(bodies[i].mass);
          
          ds = sqrt(vx*vx + vy*vy);
          
          bodies.push(new Body(mass, calculateRadius(mass), bodies[i].x+vx/ds*bodies[i].radius*5, bodies[i].y+vy/ds*bodies[i].radius*5, vx, vy ));
        } else {
          bodies.splice(i, 1);
        }
      }
    }                                                                                  
  }
}                

function calculateForces(){  
  for(var i=0; i<bodies.length; i++){
    for(var j=0; j<bodies.length; j++){
      if(bodies[i] != null && bodies[j] != null && bodies[i] != bodies[j]){      
       
        // Get distance in XY components
        dx = bodies[j].x-bodies[i].x;
        dy = bodies[j].y-bodies[i].y;
        
        // Absolute distance
        ds = sqrt(dx*dx+dy*dy);
      
        // Check for collision
        maxRadius = (bodies[j].radius + bodies[i].radius)/4;
        if(ds < maxRadius){
            
          // Combined mass
          nMass = bodies[i].mass + bodies[j].mass;
            
          // Combine                                      
          
          // Set location at larger body
          newX = bodies[i].mass > bodies[j].mass ? bodies[i].x : bodies[j].x;
          newY = bodies[i].mass > bodies[j].mass ? bodies[i].y : bodies[j].y;
          
          // Set speed components of new body
          newVX = (bodies[i].vx * bodies[i].mass + bodies[j].vx * bodies[j].mass) / nMass;
          newVY = (bodies[i].vy * bodies[i].mass + bodies[j].vy * bodies[j].mass) / nMass;
          
          newBody = new Body(nMass, calculateRadius(nMass), newX, newY, newVX, newVY);
        
          // If it's a star
          if(bodies[i].starLifetime != null || bodies[j].starLifetime != null){
            if(bodies[i].starLifetime != null) newBody.starLifetime = bodies[i].starLifetime + bodies[j].mass/2;
            else newBody.starLifetime = bodies[j].starLifetime + bodies[i].mass/2;
          }
          
          bodies[i] = newBody;
          
          // Delete one of the bodies
          bodies.splice(j,1);
          continue;
        }
        
        
        // Calculate current acceleration
        a = G * (bodies[j].mass)/(dx*dx*DISTANCE_SCALE + dy*dy*DISTANCE_SCALE);        
        
        bodies[i].vx += a*dx/ds*TIME_SCALE;
        bodies[i].vy += a*dy/ds*TIME_SCALE;
      }
    }
  }
}

function moveBodies(){
  for(var i in bodies){
        if(!bodies[i].fixed){        
          bodies[i].x += bodies[i].vx;
          bodies[i].y += bodies[i].vy;
          
          // Remove distant bodies
          if(abs(bodies[i].x) > 50000 || abs(bodies[i].y) > 50000) bodies.splice(i,1);
        }
        
  }
}

function drawBodies(){
  for(var i in bodies){
    
    if(bodies[i].mass < STAR_MASS){ // Draw planet
      noStroke();
      H = 100*bodies[i].mass / STAR_MASS;
      S = 70;
      B = 100;
      
      radius = bodies[i].radius;
      
    } else if(bodies[i].mass < BLACK_HOLE_MASS){ // Draw star
      noStroke();
      H = 5;
      S = 100-100*bodies[i].starLifetime/(bodies[i].mass/2);
      B = 100;
      
      radius = bodies[i].radius + sin( frameCount / 5 )/5;
      
    } else { // Draw black hole
      noStroke();
      H = 75;
      S = 100;
      B = 20;
      
      bodies[i].radius = 5 + sin( frameCount / 10 );
      radius = bodies[i].radius;
    }
  
    for(int n=1; n<5; n++){
      fill( H, S, B-100/(2*n) );
      ellipse( bodies[i].x, bodies[i].y, radius-3*n+3, radius-3*n+3 );
    }
  }
}

function drawForces(){
  for(i in forces){
    stroke(0,0,100);
    line(forces[i].x, forces[i].y, forces[i].x2, forces[i].y2);
  }
}

// Setup the Processing Canvas
void setup(){
  size( window.innerWidth, window.innerHeight );
  frameRate( 100 );
  colorMode(HSB, 100);
  
  background( 0 );
}

// Main draw loop
void draw(){  
   if(!edit && trails){
    // Darken previous screen, for a trail effect
    fill(0x000000, 30);
    rect(0,0, window.innerWidth, window.innerHeight);     
   } else {
    // Fill canvas black (no trail effect)
    background( 0 );
   }     
   
   // Spawn random bodies
   if(!edit && !drag && mousePressed && mouseButton == LEFT && frameCount % 10 == 0){
    mass = Math.random()*100;
    radius = calculateRadius(mass);
  
    vx = Math.random()*4-2;
    vy = Math.random()*4-2;

    bodies.push(new Body(mass, radius, mx, my, vx, vy));
   }
   
   // Set scaled mouse
   mx = mouseX/SCALE;
   my = mouseY/SCALE;
  
  totalMass = 0;
  for(i in bodies){
     totalMass+=bodies[i].mass;
  }
  
  if(!edit){
    // Check star lifetimes
    checkStars();
    
    // Calculate forces
    calculateForces();
  
    // Move bodies
    moveBodies();
  }
  
  // Push the instruction matrix to preserve scale
  PFont fontA = loadFont("Courier New");
  textAlign(CENTER);
  fill(0,0,100);
  if(edit){
    textFont(fontA, 20);
    if(chooseMass)
      text("Set object mass", window.innerWidth/2, 15);
    else if(placeForce){
      text("Set object direction and speed", window.innerWidth/2, 15);
    } else {
      text("Place object", window.innerWidth/2, 15);
    }
    textFont(fontA, 20);
    textAlign(CENTER);
    text("Press ENTER to run", window.innerWidth/2, window.innerHeight-10);
  } else {  
    if(!help){ 
      textFont(fontA, 12);
      textAlign(LEFT);
      text("Press H for HELP", 5, window.innerHeight-10);
    } else {
      textFont(fontA, 20);
      textAlign(CENTER);
      text(
        "Right mouse button - scroll\n"+
        "Left mouse button - spawn random objects\n"+
        "ENTER - edit mode\n"+
        "UP and DOWN arrow keys - zoom in/out\n"+
        "CTRL - clear all objects\n"+
        "T - toggle trails" +
        "H - toggle help"
        , window.innerWidth/2, 100
      );
    }
    
  }
  pushMatrix(); 
  
  // Zoom
  //translate(width/2,height/2); // use translate around scale
  scale(SCALE);
  //translate(-width/2,-height/2); // to scale from the center
  
  // Draw bodies
  drawBodies();
  if(edit){
    drawForces();
  }
  scale(1/SCALE);
  
  // Display instructions by popping the matrix
  popMatrix();            
}

void mousePressed(){
  if(edit && mouseButton == LEFT){      
    // Choose mass
    if(chooseMass){    
      chooseMass = false;
      placeForce = true;
    // Select force
    } else if(placeForce){
      placeForce = false;
      
    // Place a new body
    } else {   
      newX = mx;
      newY = my;
      chooseMass = true;
      
      currentForce = new Force(newX, newY, newX, newY);
      currentBody = new Body(10, calculateRadius(10), newX, newY, 0, 0);
      
      bodies.push(currentBody);
      forces.push(currentForce);
    }
  }
}

void mouseMoved() {
   // Set scaled mouse
   mx = mouseX/SCALE;
   my = mouseY/SCALE;
   
   dragX = mx;
   dragY = my;

   if(chooseMass){
        newMass = (newX-mx)*(newX-mx)+(newY-my)*(newY-my);
        if(newMass >= STAR_MASS){
          currentBody.starLifetime = newMass / 2; 
        }
        
        currentBody.mass = newMass;
        currentBody.radius = calculateRadius(currentBody.mass);
   }
   
   if(placeForce){   
    currentForce.x2 = mx;
    currentForce.y2 = my;
    
    newForceX = mx;
    newForceY = my;
    currentBody.vx = (newForceX-newX)/50;
    currentBody.vy = (newForceY-newY)/50; 
   }
}

void keyPressed() {
  switch(keyCode){    
    case ALT:
      console.log("boom");
      for(i=10; i<window.innerWidth; i+=30){
        for(j=10; j<window.innerHeight; j+=30){
          mass = Math.random()*70;
          bodies.push(new Body(mass, calculateRadius(mass), i+Math.random()*10, j+Math.random()*10, random(-20,20), random(-20,20)));
        }
      }
    break;
   
    case ENTER:
      edit = !(edit);
      // Delete forces
      forces = [];
    break;
    
    case CONTROL:
      if(!edit){
        bodies = [];
      }
    break;
    
    case UP:
      SCALE*=2;      
    break;
    
    case DOWN:
      if(SCALE){
        SCALE*=0.5;
      }
    break;
  }
  
  // Toggle help
  if(key == 'h' || key == 'H'){
     if(!edit) help = !help;
  }
  
  if(key == 't' || key == 'T'){
     trails = !trails;
  }
}

// Move the viewport
void mouseDragged(){
  if(mouseButton == LEFT) return;
  // Move bodies
  for(i in bodies){
      bodies[i].x += (mx - dragX);
      bodies[i].y += (my - dragY);
  }
  
  
  // Move forces
  for(i in forces){
      forces[i].x += (mx - dragX);
      forces[i].y += (my - dragY);
      
      forces[i].x2 += (mx - dragX);
      forces[i].y2 += (my - dragY);
  }
  
  dragX = mx;
  dragY = my;
}