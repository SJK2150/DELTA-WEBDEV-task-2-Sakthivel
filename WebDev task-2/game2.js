//LAST STAND
var canvas = document.getElementById('c1');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var c = canvas.getContext('2d');

var collision = document.getElementById('c2');
collision.height = window.innerHeight;
collision.width = window.innerWidth;
var d = collision.getContext('2d');

var zombies = [];
let explosions = [];
let players = [];
let jetpacks = [];
let bullets = [];

let timeBetweenZombies = 1000;
let timeToNextZombie = 0;
let lastLoopTime = 0;
let interval;
let fuel=1000;

let deaths = 3;
let button1 = document.getElementById('btn');
let button2 = document.getElementById('btn2');
var divStart = document.getElementById('start');
var divGame = document.getElementById('game');
var divEnd = document.getElementById('end');
var scoreDiv = document.getElementById('scored');
var cursor = document.getElementById('cursor');
var openInventoryButton = document.getElementById('openInventoryButton');
var inventoryPopup = document.getElementById('inventoryPopup');
var obstacleButton = document.getElementById('obstacleButton');
var trapButton = document.getElementById('trapButton');
var mineButton = document.getElementById('mineButton');
var startGameFromInventory = document.getElementById('startGameFromInventory');
var placingItem = false;
var currentItem = '';
var immunity = document.getElementById("immunity")

var nick;
let score = 0;
var firstPlace = document.getElementById('first');
var secondPlace = document.getElementById('second');
var thirdPlace = document.getElementById('third');
var fourthPlace = document.getElementById('fourth');
var fifthPlace = document.getElementById('fifth');
var sixthPlace = document.getElementById('sixth');
var seventhPlace = document.getElementById('seventh');

let currentGun = 'SMG'; 
let isShooting = false; 
const GUN_TYPES = {
    SMG: { speed: 15, damage: 25, shootInterval: 100, ammo: 30, reloadTime: 2000, recoil: 0.5, image: 'smg.png' },
    ASSAULT_RIFLE: { speed: 10, damage: 40, shootInterval: 300, ammo: 30, reloadTime: 3000, recoil: 1, image: 'ar.png' },
    SNIPER: { speed: 50, damage: 100, shootInterval: 3000, ammo: 5, reloadTime: 4000, recoil: 2, image: 'sniper.png' }
}


let currentAmmo = GUN_TYPES[currentGun].ammo;
let isReloading = false;
document.addEventListener('DOMContentLoaded', () => {
    let currentGun = 'SMG'; 
    const GUN_TYPES = {
        SMG: { speed: 15, damage: 25, shootInterval: 100, ammo: 30, reloadTime: 2000, recoil: 0.5, image: 'smg.png' },
        ASSAULT_RIFLE: { speed: 10, damage: 40, shootInterval: 300, ammo: 30, reloadTime: 3000, recoil: 1, image: 'ar.png' },
        SNIPER: { speed: 50, damage: 100, shootInterval: 3000, ammo: 5, reloadTime: 4000, recoil: 2, image: 'sniper.png' }
    };

    
    function updateGunImage() {
        const gunImage = document.getElementById('currentGunImage');
        if (gunImage) {
            gunImage.src = GUN_TYPES[currentGun].image;
        } else {
            console.error('currentGunImage element not found');
        }
    }
    function changeGun(gunType) {
        if (GUN_TYPES[gunType]) {
            currentGun = gunType;
            updateGunImage();
        }
    }
    document.addEventListener('keydown', event => {
        if (event.key === '1') {
            currentGun = 'SMG';
            console.log('Current gun: SMG');
            changeGun(currentGun)
        }
        if (event.key === '2') {
            currentGun = 'ASSAULT_RIFLE';
            console.log('Current gun: Assault Rifle');
            changeGun(currentGun)
        }
        if (event.key === '3') {
            currentGun = 'SNIPER';
            console.log('Current gun: Sniper');
            changeGun(currentGun)
        }
    });

});

class Zombie {
    constructor() {
        this.image = new Image();
        this.image.src = "img/zombie.png";
        this.imgWidth = 200;
        this.imgHeight = 312;
        this.size = Math.random() * 0.5 + 0.5;
        this.width = this.imgWidth * this.size;
        this.height = this.imgHeight * this.size;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height * 0.3 - this.height) + canvas.height * 0.7;
        this.dx = Math.random() * (2 - 1) ;
        this.delete = false;
        this.frame = 0;
        this.maxFrame = 8;
        this.timeSinceImgChange = 0;
        this.maxTimeToChangeImg = 200;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.health = 100;  
        this.maxHealth = 100;  
        this.stopped=false
        this.moving=true
    }
    stop(){
        this.moving=false
    }

    resume() {
        this.moving = true;
    }

    move(deltatime) {
        if (this.x - this.dx + this.width < 0) {
            this.delete = true;
            let toRemove = ".heart" + deaths;
            let elem = document.querySelector(toRemove);
            elem.classList.add("hidden");
            deaths -= 1;
            score -= 6;
            scoreDiv.innerHTML = "Score: " + score;
        }

        this.x -= this.dx;
        this.timeSinceImgChange += deltatime;

        if (this.timeSinceImgChange > this.maxTimeToChangeImg) {
            this.timeSinceImgChange = 0;
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
        }
    }

    draw() {
        d.fillStyle = this.color;
        d.fillRect(this.x, this.y, this.width, this.height);
        c.drawImage(this.image, this.frame * this.imgWidth, 0, this.imgWidth, this.imgHeight, this.x, this.y, this.width, this.height);
        this.drawHealthBar();  
    }

    drawHealthBar() {
        let healthBarWidth = this.width;
        let healthBarHeight = 5;
        let healthBarX = this.x;
        let healthBarY = this.y - healthBarHeight - 2;
        c.fillStyle = 'red';
        c.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        c.fillStyle = 'green';
        c.fillRect(healthBarX, healthBarY, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
    }
    stop(){
        this.stopped=true
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "img/boom.png";
        this.imgWidth = 200;
        this.imgHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceImgChange = 0;
        this.maxTimeToChangeImg = 100;
        this.delete = false;
    }

    update(deltaTime) {
        this.timeSinceImgChange += deltaTime;

        if (this.timeSinceImgChange > this.maxTimeToChangeImg) {
            this.timeSinceImgChange = 0;
            this.frame++;
            if (this.frame > 5) this.delete = true;
        }
    }

    draw() {
        c.drawImage(this.image, this.frame * this.imgWidth, 0, this.imgWidth, this.imgHeight, this.x, this.y, this.size, this.size);
    }
}


class Dude {
    constructor() {
        this.imageLeft = new Image();
        this.imageLeft.src = "shooterleft3.png";
        this.imageRight = new Image();
        this.imageRight.src = "shooterright3.png";
        this.width = 120;
        this.height = 180;
        this.x = (canvas.width - this.width) / 2;  
        this.y = (canvas.height - this.height) / 2;  
        this.speed = 5;
        this.health = 100;
        this.maxHealth=100
        this.jetpackFuel = 1000;
        this.maxJetpackFuel = 1000;
        this.isJetpackActive = false;
        this.isFacingLeft = true;
        this.currentImage = this.imageRight; 
        this.recoilX = 0; 
        this.recoilY = 0;  
        this.recoilTime = 0;  
        this.isJumping = false;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpStrength = 12;
    }

    moveLeft() {
        this.x -= this.speed;
        if (this.x < 0) {
            this.x = 0;
        }
        this.currentImage = this.imageLeft;
    }

    moveRight() {
        this.x += this.speed;
        if (this.x > canvas.width - this.width) {
            this.x = canvas.width - this.width;
        }
        this.currentImage = this.imageRight; 
    }
    
    moveUp() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpStrength
        }
    }

    activateJetpack() {
        if (this.jetpackFuel > 0) {
            this.isJetpackActive = true;
        }
    }

    deactivateJetpack() {
        this.isJetpackActive = false;
    }

    applyRecoil(dx, dy) {
        this.recoilX = dx;
        this.recoilY = dy;
        this.recoilTime = 5;  
    }
    


    update() {
       
        if (!this.isJetpackActive) {
            this.velocityY += this.gravity;
        } else {
            this.velocityY = -8;
            this.jetpackFuel -= 1;
            fuel=this.jetpackFuel
            if (this.jetpackFuel <= 0) {
                this.isJetpackActive = false;
            }
        }
     
        this.y += this.velocityY;

        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.isJumping = false;
            this.velocityY = 0;
        }

        if (this.recoilTime > 0) {
            this.x += this.recoilX;
            this.y += this.recoilY;
            this.recoilTime--;
        }

        if (this.y < 0) {
            this.y = 0;
        }
    }

    draw() {
        c.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
        this.drawFuelTank();
        this.drawHealthBar()
    }

    drawHealthBar() {
        let healthBarWidth = this.width;
        let healthBarHeight = 10;
        let healthBarX = this.x;
        let healthBarY = this.y - healthBarHeight - 5;
        c.fillStyle = 'red';
        c.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        c.fillStyle = 'green';
        c.fillRect(healthBarX, healthBarY, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
    }

    drawFuelTank() {
        const tankWidth = 100;
        const tankHeight = 20;
        const tankX = 150;
        const tankY = 75;

        c.fillStyle = 'gray';
        c.fillRect(tankX, tankY, tankWidth, tankHeight);

        var currentFuelWidth = (this.jetpackFuel / this.maxJetpackFuel) * tankWidth;
        c.fillStyle = 'green';
        console.log(this.jetpackFuel,"fuel")
        c.fillRect(tankX, tankY, (fuel / this.maxJetpackFuel) * tankWidth, tankHeight);

        c.strokeStyle = 'black';
        c.strokeRect(tankX, tankY, tankWidth, tankHeight);
    }

    faceDirection(cursorX) {
        this.isFacingLeft = cursorX < this.x + this.width / 2;
        if (this.isFacingLeft) {
            this.currentImage = this.imageLeft;
        } else {
            this.currentImage = this.imageRight;
        }
    }
}




player = new Dude();
players.push(player);
players.pop

class Bullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y - 50;
        this.width = 25;
        this.height = 25;
        this.speed = GUN_TYPES[currentGun].speed; 
        this.damage = GUN_TYPES[currentGun].damage; 

        this.targetX = targetX;
        this.targetY = targetY;
        this.gravity = 0.01; 
        this.calculateDirection();
        this.delete = false;

        this.image = new Image();
        this.image.src = 'bullet2.png';
    }

    calculateDirection() {
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        this.xVelocity = (dx / distance) * this.speed;
        this.yVelocity = (dy / distance) * this.speed; 
        this.recoilDirection = { x: -dx / distance, y: -dy / distance };  
    }

    update() {
        this.yVelocity += this.gravity; 
        this.x += this.xVelocity;
        this.y += this.yVelocity;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.delete = true;
        }
    }

    draw() {
        c.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}


class Jetpack {
    constructor(x, y) {
        

        
        this.width = 600;
        this.height = 60;
        this.x = x;
        this.y = y;
    }

    draw() {
        c.drawImage(this.image, player.x-250, player.y+100, this.width, this.height);
    }
}

class Obstacle {
    constructor(x, y) {
        this.image = new Image();
        this.image.src = "img/obstacle.png"; 
        this.width = 100;
        this.height = 100; 
        this.x = x;
        this.y = y;
        this.health = 100;
        this.isVisible = true; 
    }

    draw() {
        if (this.isVisible) {
            c.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    
    collidesWithPoint(x, y) {
        return (
            x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height
        );
    }

   
    reduceHealth() {
        this.health -= 5; 
        if (this.health <= 0) {
            this.isVisible = false; 
        }
    }
}


class Trap {
    constructor(x, y) {
        this.image = new Image();
        this.image.src = "img/trap.png";
        this.width = 30;
        this.height = 30;
        this.x = x;
        this.y = y;
    }

    draw() {
        c.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Mine {
    constructor(x, y) {
        this.image = new Image();
        this.image.src = "img/mine.png"; 
        this.width = 40;
        this.height = 40;
        this.x = x;
        this.y = y;
    }

    draw() {
        c.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Mortar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.burstDuration = 25000; 
        this.bulletsPerBurst = 5; 
        this.bulletsFired = 0; 
        this.lastShotTime = 0; 
        this.burstStartTime = Date.now(); 
        this.image = new Image();
        this.image.src = "mortar2.png";
    }

    shoot() {
        const now = Date.now();

       
        if (now - this.burstStartTime >= this.burstDuration) {
            this.bulletsFired = 0;
            this.burstStartTime = now;
        }

        if (this.bulletsFired < this.bulletsPerBurst && now - this.lastShotTime >= this.cooldown) {
            const angle = 7*Math.PI / 16; 
            const speed = 10; 
            const targetX = this.x + Math.cos(angle) * speed;
            const targetY = this.y - Math.sin(angle) * speed;

            const mortarBullet = new MortarBullet(this.x, this.y, targetX, targetY);
            projectiles.push(mortarBullet);
            this.lastShotTime = now;
            this.bulletsFired++;
        }
    }

    draw() {
        c.drawImage(this.image, this.x, this.y, 50, 50);
    }
}



class MortarBullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.speed = 100005; 
        this.gravity = 0.0009; 
        this.xVelocity = (targetX - x) / 10;
        this.yVelocity = (targetY - y) / 10;

        this.delete = false;

        this.image = new Image();
        this.image.src = 'gundu2.png';
    }

    update() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.yVelocity += this.gravity; 

        if (this.x < 0 || this.x > canvas.width || this.y > canvas.height) {
            this.delete = true;
        }

        zombies.forEach(zombie => {
            if (this.x < zombie.x + zombie.width &&
                this.x + this.width > zombie.x &&
                this.y < zombie.y + zombie.height &&
                this.y + this.height > zombie.y) {
                zombie.health -= this.damage;
                this.delete = true;
            }
        });
    }

    draw() {
        c.drawImage(this.image, this.x-25, this.y-50, this.width, this.height);
    }
}

 
let obstacles=[]
let traps=[]
let mines=[]
let projectiles=[]

function handleInventory() {
    let placingItem = false;
    let currentItem = ''; 
    let obstacleCount = 0; 
    let trapCount = 0; 
    let mineCount = 0; 
    let tempItem = null; 
    obstacleButton.addEventListener('click', () => {
        if (!isGameStarted && obstacleCount < 5) {
            placingItem = true;
            currentItem = 'obstacle';
            closeInventoryPopup();
        }
    });

    trapButton.addEventListener('click', () => {
        if (!isGameStarted && trapCount < 2) {
            placingItem = true;
            currentItem = 'trap';
            closeInventoryPopup();
        }
    });

    mineButton.addEventListener('click', () => {
        if (!isGameStarted && mineCount < 2) {
            placingItem = true;
            currentItem = 'mine';
            closeInventoryPopup();
        }
    });

    canvas.addEventListener('mousedown', startPlacingItem);

    function startPlacingItem(event) {
        if (placingItem && !isGameStarted && event.button === 0) { 
            let canvasX = event.clientX - canvas.getBoundingClientRect().left;
            let canvasY = event.clientY - canvas.getBoundingClientRect().top;

            switch (currentItem) {
                case 'obstacle':
                    if (obstacleCount < 5) {
                        tempItem = new Obstacle(canvasX, canvasY);
                    }
                    break;
                case 'trap':
                    if (trapCount < 2) {
                        tempItem = new Trap(canvasX, canvasY);
                    }
                    break;
                case 'mine':
                    if (mineCount < 2) {
                        tempItem = new Mine(canvasX, canvasY);
                    }
                    break;
                default:
                    break;
            }

            canvas.addEventListener('mousemove', updateTempItem);

            canvas.addEventListener('mouseup', placeItem);

            event.preventDefault();
        }
    }

    function updateTempItem(event) {
        if (tempItem) {
         
            tempItem.x = event.clientX - canvas.getBoundingClientRect().left;
            tempItem.y = event.clientY - canvas.getBoundingClientRect().top;

            redrawCanvas();
        }
    }

    function placeItem(event) {
        if (tempItem) {
            switch (currentItem) {
                case 'obstacle':
                    if (obstacleCount < 5) {
                        obstacles.push(tempItem);
                        obstacleCount++;
                    }
                    break;
                case 'trap':
                    if (trapCount < 2) {
                        traps.push(tempItem);
                        trapCount++;
                    }
                    break;
                case 'mine':
                    if (mineCount < 2) {
                        mines.push(tempItem);
                        mineCount++;
                    }
                    break;
                default:
                    break;
            }

            tempItem = null;
            canvas.removeEventListener('mousemove', updateTempItem);
            canvas.removeEventListener('mouseup', placeItem);

            redrawCanvas();
        }

        placingItem = false;
        openInventoryPopup(); 
    }

    function redrawCanvas() {
       
        c.clearRect(0, 0, canvas.width, canvas.height);

        obstacles.forEach(obstacle => {
            obstacle.draw();
        });

        traps.forEach(trap => {
            trap.draw();
        });

        
        mines.forEach(mine => {
            mine.draw();
        });

        
        if (tempItem) {
            tempItem.draw();
        }
    }
}


let isInventoryVisible = false;

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === "A" || event.key === "a") {
        player.moveLeft();
    }
    if (event.key === 'ArrowRight'||  event.key === "D" || event.key === "d") {
        player.moveRight();
    }
    if (event.key === 'ArrowUp' || event.key === "W" || event.key === "w") {
        player.moveUp();
    }
    if (event.key === 'q' || event.key === 'Q') {
        if (isInventoryVisible) {
            closeInventoryPopup();
        } else {
            openInventoryPopup();
        }
    }
    if (event.key === 'I' || event.key === 'i') {
        let i=0
        if(i<2)
        {
            player.health=100
            immunity.delete=true
            i++

        }
        else{
            console.log("immunity got over")
        }
        
    }
    if (event.key === ' ') {
        player.activateJetpack();
      
        
    }
});

document.addEventListener('keyup', event => {
    if (event.key === ' ') {
        player.deactivateJetpack();
    }
});


function handleShooting() {
    document.addEventListener('click', event => {
        if (deaths > 0 && !isReloading) {
            if (currentAmmo > 0) {
                let newBullet = new Bullet(player.x + player.width / 2, player.y + player.height / 2, event.clientX, event.clientY);
                bullets.push(newBullet);
                
                currentAmmo--;
                updateGunDisplay();
                if (currentAmmo === 0) {
                    reload(currentGun);
                }
                
                let recoilStrength = GUN_TYPES[currentGun].recoil || 5; 
                player.applyRecoil(newBullet.recoilDirection.x * recoilStrength, newBullet.recoilDirection.y * recoilStrength);
            }
        }
    });
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function handleCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        zombies.forEach((zombie, zombieIndex) => {
            if (checkCollision(bullet, zombie)) {
                if(currentGun=='SMG'){
                    zombie.health -= 25;
                    console.log("yes")
                    updateGunDisplay()
                }
                if(currentGun=='ASSAULT_RIFLE'){
                    zombie.health -= 40;
                    console.log("nos")
                    updateGunDisplay()
                }
                if(currentGun=='SNIPER'){
                    zombie.health -= 80;
                    console.log("whys")
                    updateGunDisplay()
                }
                
                if (zombie.health <= 0) {
                    zombie.delete = true;
                    explosions.push(new Explosion(zombie.x, zombie.y, zombie.width));
                    score += 10;
                    scoreDiv.innerHTML = "Score: " + score;
                }
                bullet.delete = true;
            }
        });
    });
}
function handleObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.draw();

        zombies.forEach((zombie, zindex) => {
            if (checkCollision(obstacle, zombie)) {
                
                
            }
        });

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });
}

function handleTraps() {
    traps.forEach((trap, index) => {
        trap.draw();

        zombies.forEach((zombie, zindex) => {
            if (checkCollision(trap, zombie)) {
                zombie.health -= 50;
                if (zombie.health <= 0) {
                    zombie.delete = true;
                    explosions.push(new Explosion(zombie.x, zombie.y, zombie.width));
                    score += 10;
                    scoreDiv.innerHTML = "Score: " + score;
                }
            }
        });

        if (trap.x + trap.width < 0) {
            traps.splice(index, 1);
        }
    });
}

function handleMines() {
    mines.forEach((mine, index) => {
        mine.draw();

        zombies.forEach((zombie, zindex) => {
            if (checkCollision(mine, zombie)) {
                mine.delete = true;
                zombie.delete = true;
                explosions.push(new Explosion(zombie.x, zombie.y, zombie.width));
                score += 10;
                scoreDiv.innerHTML = "Score: " + score;
            }
        });

        if (mine.x + mine.width < 0) {
            mines.splice(index, 1);
        }
    });
}

const thunder=document.getElementById("thunder")


function gameOver() {
    divEnd.classList.remove("hidden"); 
    clearInterval(interval); 
    zombies = [];
    bullets = [];
    explosions = [];
    score = 0;
    deaths = 3;
    player.health=100
    isGameStarted=false
    
    initializeDefaultObstacles()


    
    scoreDiv.innerHTML = "Score: " + score;

   
    divEnd.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


const mortar1= new Mortar(600, canvas.height - 50); 
const mortar2= new Mortar(800, canvas.height - 50);

var isGameStarted = false; 

function animate(timestamp) {
    let deltaTime = timestamp - lastLoopTime;
    lastLoopTime = timestamp;

    c.clearRect(0, 0, canvas.width, canvas.height);
    d.clearRect(0, 0, collision.width, collision.height);

    players.forEach(player => {
        player.update();
        player.draw();
    });

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.delete) bullets.splice(index, 1);
    });

    jetpacks.forEach(jetpack => {
        jetpack.draw();
    });

    obstacles.forEach((obstacle, index) => {
        obstacle.draw();
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    zombies.forEach((zombie, zIndex) => {
        zombie.move(deltaTime);
        zombie.draw();

        let isBlocked = false;

        obstacles.forEach((obstacle, oIndex) => {
            if (checkCollision(obstacle, zombie)) {

                if (obstacle.health > 0) {
                    obstacle.reduceHealth();
                    zombie.stop();
                } else if (obstacle.health <= 0) {
                    obstacle.delete = true;
                }

                if (!obstacle.delete) {
                    if (zombie.x + zombie.width > obstacle.x && zombie.x < obstacle.x + obstacle.width) {
                        if (zombie.y < obstacle.y + obstacle.height && zombie.y + zombie.height > obstacle.y) {
                            zombie.x = obstacle.x + zombie.width;
                            zombie.stop();
                            zombie.health-=0.5
                            isBlocked = true;
                        }
                    }
                }
            }
        });

        if (!isBlocked) {
            zombie.resume();
        }

        projectiles.forEach(mortarBullet => {
            if (checkCollision(mortarBullet, zombie)) {
                zombie.health -= 100;
                mortarBullet.delete = true;
                zombie.delete=true
                score+=10
            }
        });

        if (zombie.delete || zombie.x + zombie.width < 0) {
            zombies.splice(zIndex, 1);
        }
    });

    traps.forEach((trap, index) => {
        trap.draw();
    });

    mines.forEach((mine, index) => {
        mine.draw();
    });

    if (isGameStarted) {
        if (timestamp > timeToNextZombie) {
            zombies.push(new Zombie());
            timeToNextZombie = timestamp + timeBetweenZombies;
        }

        zombies.forEach((zombie, index) => {
            zombie.move(deltaTime);
            zombie.draw();

            players.forEach(player => {
                if (checkCollision(player, zombie)) {
                    const zombiebite=document.getElementById("zombiebite")
                    zombiebite.play()
                    player.health -= 0.10;
                    if (player.health <= 0) {
                        gameOver();
                        player.delete=true
                        
                    }
                    if (!player.delete) {
                        if (zombie.x + zombie.width > player.x && zombie.x < player.x + player.width) {
                            if (zombie.y < player.y + player.height && zombie.y + zombie.height > player.y) {
                                zombie.x = player.x + zombie.width/2;
                                zombie.stop();
                                isBlocked = true;
                            }
                        }
                    }
                }
            });

            if (zombie.delete || zombie.x + zombie.width < 0) {
                zombies.splice(index, 1);
            }
        });

        handleObstacles();
        handleTraps();
        handleMines();
    }

    mortar1.shoot();
    mortar1.draw();
    mortar2.shoot();
    mortar2.draw();

    projectiles = projectiles.filter(projectile => !projectile.delete);
    projectiles.forEach(projectile => {
        projectile.update();
        projectile.draw();
    });

    explosions.forEach((explosion, index) => {
        explosion.update(deltaTime);
        explosion.draw();
        if (explosion.delete) explosions.splice(index, 1);
    });

    handleCollisions();

    requestAnimationFrame(animate);
}





function openInventoryPopup() {
    
	inventoryPopup.classList.remove('hidden')
    placingItem = false;
	isInventoryVisible=true
	handleInventory()
}
function closeInventoryPopup() {
    inventoryPopup.classList.add('hidden');
    isInventoryVisible = false;
    placingItem = false
}


button1.addEventListener("click", e => {
    deaths = 3;
    zombies = [];
    explosions = [];
    timeToNextZombie = 0;
    lastLoopTime = 0;
    score = 0;
    scoreDiv.innerHTML = "Score: " + score;

    for (let i = 1; i <= 3; i++) {
        let toRemove = ".heart" + i;
        let elem = document.querySelector(toRemove);
        elem.classList.remove("hidden");
    }

    nick = document.getElementById("fname").value;
    startGame(e);
});

button2.addEventListener("click", e => {
    divEnd.classList.add("hidden");
    divStart.classList.remove("hidden");
});

function startGame() {
    if (nick.length > 0) {
        divStart.classList.add("hidden");
        divGame.classList.remove("hidden");
        handleInventory(); 

        let player = new Dude();
        players.push(player);

        

        animate(0);
    } else {
        window.alert("You must enter your nickname first!");
    }
}

document.onmousemove = function (e) {
    cursor.style.left = (e.pageX - 20) + "px";
    cursor.style.top = (e.pageY - 20) + "px";
    player.faceDirection(e.pageX);
}



var countdownTimer; 


function startCountdown() {
    var countdownElement = document.getElementById('countdown');
    var countdownTimerElement = document.getElementById('countdown-timer');
    var seconds = 15; 

    countdownElement.classList.remove('hidden')

    countdownTimer = setInterval(function() {
        seconds--;
        countdownTimerElement.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdownTimer);
            countdownElement.classList.add('hidden');
            isGameStarted = true; 
            handleShooting()
            startGame(); 
            const ambient=document.getElementById("ambientsound")
            if(thunder){
                thunder.play()
            }
            ambient.play()
        }
    }, 1000); 
}
button1.addEventListener("click", function() {
    startCountdown(); 
});


document.addEventListener("DOMContentLoaded", () => {
    divGame.classList.remove("hidden"); 
   
    
})

function handleContinuousShooting() {
    let shootTimeout = null;

    function shoot() {
        bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, event.clientX, event.clientY));
        shootTimeout = setTimeout(shoot, GUN_TYPES[currentGun].shootInterval);
    }

    document.addEventListener('mousedown', () => {
        if (currentGun === 'SMG') {
            isShooting = true;
            shoot();
        } else {
            isShooting = true;
            bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, event.clientX, event.clientY));
        }
    });

    document.addEventListener('mouseup', () => {
        isShooting = false;
        clearTimeout(shootTimeout);
    });

    document.addEventListener('mousemove', event => {
        if (!isShooting) return;
        if (currentGun !== 'SMG') {
            bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, event.clientX, event.clientY));
        }
    });
}

document.addEventListener('keydown', event => {
    if (event.key === '1') {
        currentGun = 'SMG';
        console.log('Current gun: SMG');
        changeGun(currentGun)
    }
    if (event.key === '2') {
        currentGun = 'ASSAULT_RIFLE';
        console.log('Current gun: Assault Rifle');
        changeGun(currentGun)
    }
    if (event.key === '3') {
        currentGun = 'SNIPER';
        console.log('Current gun: Sniper');
        changeGun(currentGun)
    }
});

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.update();
        bullet.draw();
    });
}
function updateGunDisplay() {
    gunDisplay.innerHTML = "Current Gun: " + currentGun; 
}



function reload(gunType) {
    isReloading = true;
    setTimeout(() => {
        currentAmmo = GUN_TYPES[gunType].ammo;
        isReloading = false;
        updateGunDisplay();
    }, GUN_TYPES[gunType].reloadTime);
    const reloadSound = document.getElementById('reloadSound');
    if (reloadSound) {
        reloadSound.play();
    }
    
}

function initializeDefaultObstacles() {
    obstacles.push(new Obstacle(900, 600));
    obstacles.push(new Obstacle(300, 600));
    obstacles.push(new Obstacle(1100, 600));
    obstacles.push(new Obstacle(300, 600));
    obstacles.push(new Obstacle(900,510))
    obstacles.push(new Obstacle(1000, 600));
    obstacles.push(new Obstacle(1000, 510));

}

initializeDefaultObstacles();
