let canvas;
let context;
let bar;
let context2;

let xHTTP;

let mageImage = new Image();
let knightImage = new Image();
let warriorImage = new Image();

let wallImage = new Image();

let roleImage;

let attackAction = false;
let attackFrame = 0;
let stayFrame = 0;

let mainLoop;
let CoLoop;

// I used the 120fps to do before...But not make sense in our server or in the computer in our lab, so i changed that rate.
// Low rate may cause bad experience though.
let fpsInternal = 1000 / 60;

let pausing;

let stairLevel = 10;
let pass;
let nextX;
let nextY;
let leave = false;

let now;
let then = Date.now()

let mapWidth = 36000;
let mapHeight = 30000;


let tileSize = 50;


let praisingRoom = [];
let healing = [];
let n;

let player = {
    role: CharacterData.role,
    x: 18000,
    y: 22000,
    xSize: 75,
    ySize: 75,
    xSpeed: CharacterData.speed,
    ySpeed: CharacterData.speed,
    hp: CharacterData.HP,
    healthMax: CharacterData.HP,
    AP: CharacterData.AP,
    SAP: CharacterData.SAP,
    ACD: CharacterData.ACD,
    SCD: CharacterData.SCD,
    skillPre: CharacterData.skillPre,
    attackPre: CharacterData.attackPre,
    skillDuration: CharacterData.skillDuration,
    attackDuration: CharacterData.attackDuration,
    level: 1,
    exp: 0,
    expMax: 10,
    HUpTimes: CharacterData.HUpTimes,
    HWithLvUp: CharacterData.HWithLvUp,
    AUpTimes: CharacterData.AUpTimes,
    AWithLvUp: CharacterData.AWithLvUp,

    frameX: 0,
    frameY: 0
}

let mapPositionX;
let mapPositionY;

let oSpeed = player.xSpeed;
let oHealth = player.hp;

let recordX = 0;
let recordY = 0;

let ACDCountDown = player.ACD;
let SCDCountDown = player.SCD;
let skillTotal = player.skillPre + player.skillDuration;
let attackTotal = player.attackPre + player.attackDuration;
let damage = false;

let skillPositionX = 0;
let skillPositionY = 0;

let warriorHit = false;
let skillDamage = false;
let skillAfter = false;
let skillPre = false;

let viewport = {
    x: 0,
    y: 0
};

let moveLeft = false;
let moveUp = false;
let moveRight = false;
let moveDown = false;
let attack = false;
let skill = false;
let ACD = false;
let SCD = false;
let theta = 0;

let monsters = []
class monsterAll {
    constructor(n, minX, maxX, minY, maxY,
        size, hp, attack, speed, ACD, level) {
        this.n = n,
            this.xSize = size,
            this.ySize = size,
            this.level = level,
            this.x = random(minX, maxX),
            this.y = random(minY, maxY),
            this.hp = hp + 3 * level,
            this.healthMax = hp + 3 * level,
            this.attack = attack + level,
            this.speed = speed,
            this.ACD = ACD,
            this.inCD = false,
            this.attackMode = false,
            this.dizziness = false,
            this.roomCentreX = (minX + maxX) / 2,
            this.roomCentreY = (minY + maxY) / 2
    }

    attacking() {
        let roomLeft = this.roomCentreX - 975 + player.xSize / 2;
        let roomRight = this.roomCentreX + 975 - player.xSize / 2;
        let roomTop = this.roomCentreY - 975 + player.ySize / 2;
        let roomBottom = this.roomCentreY + 975 - player.ySize / 2;
        if (player.x >= roomLeft &&
            player.x <= roomRight &&
            player.y >= roomTop &&
            player.y <= roomBottom
        ) { this.attackMode = true; }
    }
}

class commonMonster extends monsterAll {
    constructor(n, minX, maxX, minY, maxY,
        size, hp, attack, speed, ACD, level) {
        super(n, minX, maxX, minY, maxY,
            size, hp, attack, speed, ACD, level)
    }

    attacking() {
        super.attacking();
    }

    exp() {
        if (this.hp <= 0) {
            player.exp += 1 + Math.floor(this.level / 3);
        }
    }
}

class specialMonster extends monsterAll {
    constructor(n, minX, maxX, minY, maxY,
        size, hp, attack, speed, ACD, level) {
        super(n, minX, maxX, minY, maxY,
            size, hp, attack, speed, ACD, level)
    }

    attacking() {
        super.attacking();
    }

    exp() {

    }

}

class boss extends monsterAll {
    constructor(n, minX, maxX, minY, maxY,
        size, hp, attack, speed, ACD, skillDamage, SCD, level) {
        super(n, minX, maxX, minY, maxY,
            size, hp, attack, speed, ACD, level)
        this.SAP = skillDamage + this.level,
            this.SCD = SCD,
            this.SinCD = false
    }

    attacking() {
        super.attacking();
    }


    exp() {
        if (this.hp <= 0) {
            player.exp += player.expMax * (1 + Math.floor(this.level / 5));
        }
    }
}

class skeleton extends commonMonster {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            80, 15, 2, 2, 1000, level)
        this.attackRange = this.xSize / 2 + player.xSize / 2
    }
    attacking() {
        super.attacking();
        if (this.attackMode === true &&
            this.dizziness === false
        ) {
            let distanceX = this.x - player.x;
            let distanceY = this.y - player.y;
            let distancePlayer = Math.hypot(distanceX, distanceY)
            if (distancePlayer <= this.attackRange &&
                this.inCD === false) {
                this.inCD = true;
                player.hp -= this.attack;
                let fSpeed = this.speed;
                this.speed = 0;
                setTimeout(() => {
                    this.speed = fSpeed;
                }, 500);

                setTimeout(() => {
                    this.inCD = false;
                }, this.ACD);
            }
        }
    }

    summoned() {
        let masterCheck = monsters.find(master =>
            master instanceof skeletonWitch &&
            master.roomCentreX === this.roomCentreX &&
            master.roomCentreY === this.roomCentreY
        )
        if (this.n === 999 &&
            !masterCheck
        ) {
            this.hp = 0;
        }
    }

}

class wizard extends commonMonster {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            60, 8, 4, 2.5, 5000, level
        )
        this.attackRange = 300
    }

    attacking() {
        super.attacking();

        let distanceX = this.x - player.x;
        let distanceY = this.y - player.y;
        let distancePlayer = Math.hypot(distanceX, distanceY);
        if (distancePlayer <= this.attackRange &&
            this.inCD === false &&
            this.attackMode === true &&
            this.dizziness === false) {
            this.inCD = true;
            let fSpeed = this.speed;
            this.speed = 0;
            setTimeout(() => {
                this.speed = fSpeed;
                bullets.push(new magicBall(
                    this.x,
                    this.y,
                    this.roomCentreX,
                    this.roomCentreY,
                    this.attack,
                    this.n))
            }, 750);


            setTimeout(() => {
                this.inCD = false;
            }, this.ACD);
        }
    }

}

class guard extends commonMonster {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            125, 30, 5, 1, 3000, level
        )
        this.attackRange = this.xSize / 2 + player.xSize / 2
    }

    attacking() {
        super.attacking();
        if (this.attackMode === true &&
            this.dizziness === false) {
            let distanceX = this.x - player.x;
            let distanceY = this.y - player.y;
            let distancePlayer = Math.hypot(distanceX, distanceY);
            if (distancePlayer <= this.attackRange &&
                this.inCD === false) {
                this.inCD = true;
                player.hp -= this.attack;
                let fSpeed = this.speed;
                this.speed = 0;
                setTimeout(() => {
                    this.speed = fSpeed;
                }, 1000);

                setTimeout(() => {
                    this.inCD = false;
                }, this.ACD);
            }
        }
    }
}

class archer extends commonMonster {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            70, 10, 2, 3, 3000, level
        )
        this.attackRange = 750
    }

    attacking() {
        super.attacking();
        if (this.attackMode === true &&
            this.dizziness === false) {
            let distanceX = this.x - player.x;
            let distanceY = this.y - player.y;
            let distancePlayer = Math.hypot(distanceX, distanceY);
            if (distancePlayer <= this.attackRange &&
                this.inCD === false) {
                this.inCD = true;
                let fSpeed = this.speed;
                this.speed = 0;
                setTimeout(() => {
                    this.speed = fSpeed;
                    bullets.push(new arrow(
                        this.x,
                        this.y,
                        Math.atan2(distanceY, distanceX),
                        this.roomCentreX,
                        this.roomCentreY,
                        this.attack))
                }, 200);
                setTimeout(() => {
                    this.inCD = false;
                }, this.ACD);

            }
        }
    }
}

class chest extends specialMonster {
    constructor(n, minX, maxX, minY, maxY) {
        super(n, (minX + maxX) / 2, (minX + maxX) / 2, (minY + maxY) / 2, (minY + maxY) / 2,
            75, 30, -5 * (Math.floor(player.healthMax / 10)), 0, 3000, 0
        )
        this.attackRange = 200,
            this.skillDuration = false
    }



    attacking() {
        super.attacking();

        let distanceX = this.x - player.x;
        let distanceY = this.y - player.y;
        let distancePlayer = Math.hypot(distanceX, distanceY)
        if (distancePlayer <= this.attackRange &&
            this.inCD === false) {
            this.inCD = true;


            bullets.push(new healingBall(
                this.x,
                this.y,
                this.roomCentreX,
                this.roomCentreY,
                this.attack,
                this.n))

            setTimeout(() => {
                this.inCD = false;
            }, this.ACD);
        }
    }

    gift() {
        if (this.hp <= 0) {
            player.AP += 2 + Math.floor(stairLevel / 3);
            player.SAP += (2 + Math.floor(stairLevel / 3)) * 2;
        }
    }

}

class desertEmperor extends boss {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            80, 40, 3, 2, 5000, 6, 5000, level
        )
        this.attackRange = 75 + player.xSize / 2,
            this.skillRange = 150,
            this.skillStatus = false,
            this.healing = true,
            this.makingBall = false,
            this.firstBall = true
    }

    attacking() {
        super.attacking();
        if (this.firstBall === true &&
            this.attackMode === true &&
            this.dizziness === false
        ) {
            this.firstBall = false;
            bullets.push(new sandBallKS(
                this.x,
                this.y,
                this.roomCentreX,
                this.roomCentreY,
                this.attack,
                this.n));

        }
        if (this.attackMode === true &&
            this.dizziness === false) {
            let ballCheck = bullets.find(bullet =>
                bullet instanceof sandBallKS
            )
            if (ballCheck && this.healing === true && this.hp < this.healthMax) {
                this.healing = false;
                this.makingBall = true;
                this.hp += 1;
                setTimeout(() => {
                    this.healing = true;

                }, 500);
            }
            if (!ballCheck &&
                this.inCD === false) {
                this.inCD = true;
                let fSpeed = this.speed;
                this.speed = 0;
                this.lowSpeed = true
                setTimeout(() => {
                    bullets.push(new sandBallKS(
                        this.x,
                        this.y,
                        this.roomCentreX,
                        this.roomCentreY,
                        this.attack,
                        this.n));
                    this.speed = fSpeed;
                    this.makingBall = false;
                }, 750);


                setTimeout(() => {
                    this.inCD = false;
                }, this.ACD);
            }
        }
    }

    skill() {
        if (this.attackMode === true &&
            this.dizziness === false) {
            if (this.SinCD === false) {
                this.SinCD = true;
                let fSpeed = this.speed;
                this.speed = 0;
                setTimeout(() => {
                    bullets.push(new realSandBall(
                        this.x,
                        this.y,
                        this.roomCentreX,
                        this.roomCentreY,
                        this.SAP,
                        this.n
                    ));
                    this.speed = fSpeed;
                }, 500)

                setTimeout(() => {
                    this.SinCD = false
                }, this.SCD);
            }
        }
    }

}

class phantomAssassin extends boss {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            100, 50, 3, 3, 500, 1, 6000, level
        )
        this.attackRange = this.xSize / 2 + player.xSize / 2,
            this.skillRange = 300,
            this.skillStatus = false,
            this.stealth = false,
            this.skillDuration = false
    }

    attacking() {
        super.attacking();

        let distanceX = this.x - player.x;
        let distanceY = this.y - player.y;
        let distancePlayer = Math.hypot(distanceX, distanceY)
        if (distancePlayer <= this.attackRange &&
            this.inCD === false &&
            this.attackMode === true &&
            this.dizziness === false) {
            this.inCD = true;
            player.hp -= this.attack;

            setTimeout(() => {
                this.inCD = false;
            }, this.ACD);
        }
    }

    skill() {
        if (this.attackMode === true &&
            this.dizziness === false) {
            if (this.SinCD === false) {
                this.SinCD = true;
                let fSpeed = this.speed;
                let currentPlayerX = player.x;
                let currentPlayerY = player.y;
                this.speed = 7;
                setTimeout(() => {
                    this.x = currentPlayerX + 5;
                    this.y = currentPlayerY;
                    this.speed = fSpeed;
                    this.skillStatus = true;
                    this.skillDuration = true;
                }, 250)

                setTimeout(() => {
                    this.SinCD = false
                }, this.SCD);
            }
            let distanceX = this.x - player.x;
            let distanceY = this.y - player.y;
            let distancePlayer = Math.hypot(distanceX, distanceY)

            if (this.skillStatus === true &&
                distancePlayer <= this.skillRange
            ) {
                player.hp -= this.SAP;
                this.skillStatus = false;
                this.speed = fSpeed;
            }
        }

    }
}



class skeletonWitch extends boss {
    constructor(n, minX, maxX, minY, maxY, level) {
        super(n, minX, maxX, minY, maxY,
            125, 60, 8, 0.75, 3000, 0, 15000, level
        )
        this.attackRange = 200,
            this.extraSummon = 0,
            this.takeUp = false;
    }

    attacking() {
        super.attacking();

        let distanceX = this.x - player.x;
        let distanceY = this.y - player.y;
        let distancePlayer = Math.hypot(distanceX, distanceY)
        if (distancePlayer <= this.attackRange &&
            this.inCD === false &&
            this.takeUp === false &&
            this.attackMode === true &&
            this.dizziness === false) {
            this.inCD = true;
            this.takeUp = true;
            let fSpeed = this.speed;
            this.speed = 0;
            setTimeout(() => {
                this.speed = fSpeed;
                this.takeUp = false;
                bullets.push(new cursingBall(
                    this.x,
                    this.y,
                    this.roomCentreX,
                    this.roomCentreY,
                    this.attack,
                    this.n))
            }, 1500);


            setTimeout(() => {
                this.inCD = false;
            }, this.ACD);
        }
    }

    skill() {
        if (this.attackMode === true &&
            this.dizziness === false &&
            this.SinCD === false &&
            this.takeUp === false) {
            this.SinCD = true;
            this.takeUp = true;
            let fSpeed = this.speed;
            this.speed = 0;
            setTimeout(() => {
                this.speed = fSpeed;
                this.takeUp = false;
                for (let i = 0; i < 4 + Math.floor(this.extraSummon); i++) {
                    monsters.push(new skeleton(
                        999,
                        this.roomCentreX - 800,
                        this.roomCentreX + 800,
                        this.roomCentreY - 800,
                        this.roomCentreY + 800,
                        this.level))
                }
                this.extraSummon++;
            }, 2000)

            setTimeout(() => {
                this.SinCD = false
            }, this.SCD);
        }

    }

}

let bullets = []
class allBullets {
    constructor(x, y, size, object, roomCentreX, roomCentreY, damage) {
        this.x = x,
            this.y = y,
            this.size = size,
            this.object = object,
            this.roomCentreX = roomCentreX,
            this.roomCentreY = roomCentreY,
            this.damage = damage,
            this.delete = false
    }



    boundary() {
        this.roomLeft = this.roomCentreX - 1000,
            this.roomRight = this.roomCentreX + 1000,
            this.roomTop = this.roomCentreY - 1000,
            this.roomBottom = this.roomCentreY + 1000;
        if (this.x - this.size / 2 < this.roomLeft ||
            this.x + this.size / 2 > this.roomRight ||
            this.y - this.size / 2 < this.roomTop ||
            this.y + this.size / 2 > this.roomBottom) {
            this.delete = true;
        }
    }

    hit() {
        if (this.object === 0) {
            this.distance = Math.hypot(
                this.y - player.y,
                this.x - player.x);
            if (this.distance <= player.xSize / 2 + this.size / 2) {
                this.delete = true;
                player.hp -= this.damage;

            }
        } else {
            monsters.forEach(monster => {
                this.distance = Math.hypot(
                    this.y - monster.y,
                    this.x - monster.x);
                if (this.distance <= monster.xSize / 2 + this.size / 2) {
                    this.delete = true;
                    monster.hp -= this.damage;
                }
            })
        }
    }
}

class arrow extends allBullets {
    constructor(
        x, y, angle, roomCentreX, roomCentreY, damage
    ) {
        super(x, y, 25, 0, roomCentreX, roomCentreY, damage)

        this.xSpeed = 8 * Math.cos(angle),
            this.ySpeed = 8 * Math.sin(angle)
    }

    move() {
        this.x -= this.xSpeed;
        this.y -= this.ySpeed;
    }

    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}


class magicBall extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, n) {
        super(x, y, 50, 0, roomCentreX, roomCentreY, damage),
            this.speed = 1.5,
            this.n = n
    }

    move() {
        this.y += this.speed * Math.sin(Math.atan2(
            player.y - this.y,
            player.x - this.x));
        this.x += this.speed * Math.cos(Math.atan2(
            player.y - this.y,
            player.x - this.x));
    }
    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}

class healingBall extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, n) {
        super(x, y, 50, 0, roomCentreX, roomCentreY, damage),
            this.speed = 7,
            this.n = n
    }

    move() {
        this.y += this.speed * Math.sin(Math.atan2(
            player.y - this.y,
            player.x - this.x));
        this.x += this.speed * Math.cos(Math.atan2(
            player.y - this.y,
            player.x - this.x));
    }
    hit() {
        super.hit();
    }
}

class cursingBall extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, n) {
        super(x, y, 75, 0, roomCentreX, roomCentreY, damage),
            this.speed = 1,
            this.n = n
    }



    move() {
        this.y += this.speed * Math.sin(Math.atan2(
            player.y - this.y,
            player.x - this.x)),
            this.x += this.speed * Math.cos(Math.atan2(
                player.y - this.y,
                player.x - this.x));
        setTimeout(() => {
            this.speed = 0;
        }, 2500);
    }
    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}

class sandBallKS extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, n) {
        super(x, y, 75 + 80, 0, roomCentreX, roomCentreY, damage)
        this.n = n
    }

    move() {
        let master = monsters.find(monster =>
            (monster instanceof desertEmperor)
        )
        if (master) {
            this.x = master.x,
                this.y = master.y
        }
        else {
            this.delete = true;
        }
    }
    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}

class realSandBall extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, n) {
        super(x, y, 50, 0, roomCentreX, roomCentreY, damage)
        this.speed = 1.5,
            this.n = n
    }

    move() {
        this.y += this.speed * Math.sin(Math.atan2(
            player.y - this.y,
            player.x - this.x)),
            this.x += this.speed * Math.cos(Math.atan2(
                player.y - this.y,
                player.x - this.x));
        let t1 = 3;
        let countDown = setInterval(() => {
            t1 -= 0.1;
            if (t1 === 0) {
                clearInterval(countDown);
            } else {
                this.size += 2;
            }
        }, 100)
    }

    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}

class fireBall extends allBullets {
    constructor(x, y, roomCentreX, roomCentreY, damage, angle) {
        super(x, y, 50, 1, roomCentreX, roomCentreY, damage)
        this.speed = 5,
            this.n = 1001,
            this.angle = angle

    }

    move() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }
    boundary() {
        super.boundary();
    }
    hit() {
        super.hit();
    }
}

function intersection(c1, c2) {
    // Start constructing the response object.
    const result = {
        intersect_count: 0,
        intersect_occurs: true,
        one_is_in_other: false,
        are_equal: false,
        point_1: { x: null, y: null },
        point_2: { x: null, y: null },
    };

    // Get vertical and horizontal distances between circles.
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;

    // Calculate the distance between the circle centers as a straight line.
    const dist = Math.hypot(dy, dx);

    // Check if circles intersect.
    if (dist > c1.r + c2.r) {
        result.intersect_occurs = false;
    }

    // Check one circle isn't inside the other.
    if (dist < Math.abs(c1.r - c2.r)) {
        result.intersect_occurs = false;
        result.one_is_in_other = true;
    }

    // Check if circles are the same.
    if (c1.x === c2.x && c1.y === c2.y && c1.r === c2.r) {
        result.are_equal = true;
        result.are_equal = true;
    }

    // Find the intersection points
    if (result.intersect_occurs) {
        // Centroid is the pt where two lines cross. A line between the circle centers
        // and a line between the intersection points.
        const centroid = (c1.r * c1.r - c2.r * c2.r + dist * dist) / (2.0 * dist);

        // Get the coordinates of centroid.
        const x2 = c1.x + (dx * centroid) / dist;
        const y2 = c1.y + (dy * centroid) / dist;

        // Get the distance from centroid to the intersection points.
        const h = Math.sqrt(c1.r * c1.r - centroid * centroid);

        // Get the x and y dist of the intersection points from centroid.
        const rx = -dy * (h / dist);
        const ry = dx * (h / dist);

        // Get the intersection points.
        result.point_1.x = Number((x2 + rx).toFixed(15));
        result.point_1.y = Number((y2 + ry).toFixed(15));

        result.point_2.x = Number((x2 - rx).toFixed(15));
        result.point_2.y = Number((y2 - ry).toFixed(15));

        // Add intersection count to results
        if (result.are_equal) {
            result.intersect_count = null;
        } else if (result.point_1.x === result.point_2.x && result.point_1.y === result.point_2.y) {
            result.intersect_count = 1;
        } else {
            result.intersect_count = 2;
        }
    }
    return result;
}

function randomRoom() {
    let normalMonsterRoom = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let bossRoom = random(0, 2);
    if (bossRoom === 0) {
        bossRoom = 3;
        normalMonsterRoom.splice(3, 1);
    } else if (bossRoom === 1) {
        bossRoom = 6;
        normalMonsterRoom.splice(6, 1);
    } else {
        bossRoom = 9;
        normalMonsterRoom.splice(-1, 1);
    }

    let noMonsterRoom = [];
    for (let i = 0; i < 8; i++) {
        let luckyNum = random(1, 5);
        if (luckyNum === 1) {
            noMonsterRoom.push(i)
        }
    }
    normalMonsterRoom = normalMonsterRoom.filter(room =>
        !noMonsterRoom.includes(room)
    )
    noMonsterRoom = noMonsterRoom.filter(room =>
        room != bossRoom
    )
    console.log(bossRoom);
    console.log(noMonsterRoom);
    console.log(normalMonsterRoom);

    let roomRange = [
        //min x  max x  min y  max y
        [17200, 18800, 17200, 18800],
        [13200, 14800, 17200, 18800],
        [9200, 10800, 17200, 18800],
        [5200, 6800, 17200, 18800],
        [17200, 18800, 13200, 14800],
        [17200, 18800, 9200, 10800],
        [17200, 18800, 5200, 6800],
        [21200, 22800, 17200, 18800],
        [25200, 26800, 17200, 18800],
        [29200, 30800, 17200, 18800]
    ]
    if (stairLevel <= 5) {
        for (let id of normalMonsterRoom) {
            for (let n = 0; n < 5 + Math.floor(stairLevel / 3); n++) {
                let monsterCategory = random(0, 3)
                if (monsterCategory === 0) {
                    monsters.push(new skeleton(n,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, stairLevel)))
                } else if (monsterCategory === 1) {
                    monsters.push(new guard(n,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, stairLevel)))
                } else if (monsterCategory === 2) {
                    monsters.push(new wizard(n,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, stairLevel)))
                } else if (monsterCategory === 3) {
                    monsters.push(new archer(n,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, stairLevel)))
                }
            }
        }
    } else if (stairLevel <= 15) {
        for (let id of normalMonsterRoom) {
            let bossPer = random(1, 10)
            if (bossPer === 1) {
                let b = random(0, 2)
                if (b === 0) {
                    monsters.push(new desertEmperor(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, Math.floor(stairLevel / 2))
                    ))
                } else if (b === 1) {
                    monsters.push(new phantomAssassin(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, Math.floor(stairLevel / 2))
                    ))

                } else if (b === 2) {
                    monsters.push(new skeletonWitch(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(0, Math.floor(stairLevel / 2))
                    ))

                }
            } else {
                for (let n = 0; n < 5 + Math.floor(stairLevel / 3); n++) {
                    let monsterCategory = random(0, 3)
                    if (monsterCategory === 0) {
                        monsters.push(new skeleton(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(0, stairLevel)))
                    } else if (monsterCategory === 1) {
                        monsters.push(new guard(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(0, stairLevel)))
                    } else if (monsterCategory === 2) {
                        monsters.push(new wizard(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(0, stairLevel)))
                    } else if (monsterCategory === 3) {
                        monsters.push(new archer(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(0, stairLevel)))
                    }
                }
            }
        }
    } else {
        for (let id of normalMonsterRoom) {
            let bossPer = random(1, 10)
            if (bossPer === 1) {
                let b = random(0, 2)
                if (b === 0) {
                    monsters.push(new desertEmperor(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(Math.floor(stairLevel / 10) * 10, stairLevel + 10)
                    ))
                } else if (b === 1) {
                    monsters.push(new phantomAssassin(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(Math.floor(stairLevel / 10) * 10, stairLevel + 10)
                    ))

                } else if (b === 2) {
                    monsters.push(new skeletonWitch(0,
                        roomRange[id][0],
                        roomRange[id][1],
                        roomRange[id][2],
                        roomRange[id][3],
                        random(Math.floor(stairLevel / 10) * 10, stairLevel + 10)
                    ))

                }
            }
            else {
                for (let n = 0; n < 10; n++) {
                    let monsterCategory = random(0, 3)
                    if (monsterCategory === 0) {
                        monsters.push(new skeleton(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(Math.floor(stairLevel / 10) * 10, stairLevel + Math.floor(stairLevel / 5))))
                    } else if (monsterCategory === 1) {
                        monsters.push(new guard(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(Math.floor(stairLevel / 10) * 10, stairLevel + Math.floor(stairLevel / 5))))
                    } else if (monsterCategory === 2) {
                        monsters.push(new wizard(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(Math.floor(stairLevel / 10) * 10, stairLevel + Math.floor(stairLevel / 5))))
                    } else if (monsterCategory === 3) {
                        monsters.push(new archer(n,
                            roomRange[id][0],
                            roomRange[id][1],
                            roomRange[id][2],
                            roomRange[id][3],
                            random(Math.floor(stairLevel / 10) * 10, stairLevel + Math.floor(stairLevel / 5))))
                    }
                }
            }
        }

    }
    for (let id of noMonsterRoom) {
        let gift = random(0, 1)
        if (gift === 0) {
            praisingRoom.push([
                roomRange[id][0] - 200,
                roomRange[id][1] + 200,
                roomRange[id][2] - 200,
                roomRange[id][3] + 200,
                id])
            healing.push([id, true])
        } else {
            monsters.push(new chest(
                999,
                roomRange[id][0],
                roomRange[id][1],
                roomRange[id][2],
                roomRange[id][3]))
            for (let i = 0; i < 8; i++) {
                monsters.push(new guard(i,
                    roomRange[id][0],
                    roomRange[id][1],
                    roomRange[id][2],
                    roomRange[id][3],
                    stairLevel * 2))
            }
        }
    }

    // boss room

    if (n === 0) {
        monsters.push(new desertEmperor(0,
            roomRange[bossRoom][0],
            roomRange[bossRoom][1],
            roomRange[bossRoom][2],
            roomRange[bossRoom][3],
            stairLevel * 2
        ))
    } else if (n === 1) {
        monsters.push(new phantomAssassin(0,
            roomRange[bossRoom][0],
            roomRange[bossRoom][1],
            roomRange[bossRoom][2],
            roomRange[bossRoom][3],
            stairLevel * 2
        ))

    } else if (n === 2) {
        monsters.push(new skeletonWitch(0,
            roomRange[bossRoom][0],
            roomRange[bossRoom][1],
            roomRange[bossRoom][2],
            roomRange[bossRoom][3],
            stairLevel * 2
        ))

    }

}





function monsterMove() {
    monsters.forEach(monster => {






        let distanceX = player.x - monster.x;
        let distanceY = player.y - monster.y;
        let distancePlayer = Math.hypot(distanceX, distanceY)


        // determine whether the player is in the room then:
        let roomLeft = monster.roomCentreX - 975 + player.xSize / 2;
        let roomRight = monster.roomCentreX + 975 - player.xSize / 2;
        let roomTop = monster.roomCentreY - 975 + player.ySize / 2;
        let roomBottom = monster.roomCentreY + 975 - player.ySize / 2;
        if (player.x >= roomLeft &&
            player.x <= roomRight &&
            player.y >= roomTop &&
            player.y <= roomBottom
        ) {
            if (distancePlayer > monster.attackRange) {
                monster.x = monster.x + (distanceX / distancePlayer) * monster.speed;
                monster.y = monster.y + (distanceY / distancePlayer) * monster.speed;

            } else {
                monster.x = monster.x - (distanceX / distancePlayer) * monster.speed;
                monster.y = monster.y - (distanceY / distancePlayer) * monster.speed;
            }
        }

        // It is the methods I give up but that will make the monster cleverer. What a pity!
        // The main problem i met is in dealing with the wall. 
        // In this logic, monster will move vertically against player when player is in their attack range,
        // Which means it will always manage to keep the distance the same,
        // which can make player mad enough. The pink ball won't fucking being at that suck corner,
        // it will move around in order to avoid stupid gamers and 
        // fuck them up at the same time :P

        // What i want is let the monster move vertically and move along the vertical line
        // which is farther from the wall. That could be implemented,
        // but the main problem is how they move if they hit the wall or being in the corner.
        // As you see, if they are in the corner, i want them to move to the middle of the line
        // then escape, but they will shaking fast at the area's edge.
        // I'm sorry but i just want to show you what i wanna do :)

        //     let roomBoundaryLeft = monster.roomCentreX - 975;
        //     let roomBoundaryRight = monster.roomCentreX + 975;
        //     let roomBoundaryTop = monster.roomCentreY - 975;
        //     let roomBoundaryBottom = monster.roomCentreY + 975;
        //         if ((monster.x == roomBoundaryLeft + monster.xSize / 2 ||
        //             monster.x == roomBoundaryRight - monster.xSize / 2) &&
        //             (monster.y < monster.roomCentreY - 150 ||
        //             monster.y > monster.roomCentreY + 150)
        //         ) {
        //             if (monster.y > monster.roomCentreY) {
        //                 monster.y -= monster.speed
        //             } else if (monster.y < monster.roomCentreY) {
        //                 monster.y += monster.speed
        //             }
        //         } else if (monster.y == roomBoundaryTop - monster.ySize / 2 ||
        //             monster.y == roomBoundaryBottom - monster.ySize / 2
        //         ) {
        //             if (monster.x > monster.roomCentreX) {
        //                 monster.x -= monster.speed
        //             } else if (monster.x < monster.roomCentreX) {
        //                 monster.x += monster.speed
        //             }
        //         } else {
        //             let moveDirection = -distanceX / distanceY
        //             //y = kx + b
        //             let b = moveDirection * monster.x - monster.y
        //             //know x 
        //             if ((monster.roomCentreX - 1000) * moveDirection + b > monster.roomCentreY - 1000 &&
        //                 (monster.roomCentreX - 1000) * moveDirection + b < monster.roomCentreY + 1000) {
        //                 // left
        //                 let xDistance1 = monster.roomCentreX - 1000 - monster.x;
        //                 let yDistance1 = ((monster.roomCentreX - 1000) * moveDirection + b) - monster.y;
        //                 let distance1 = Math.sqrt(xDistance1 * xDistance1 + yDistance1 * yDistance1);
        //                 if ((monster.roomCentreX + 1000) * moveDirection + b > monster.roomCentreY - 1000 &&
        //                     (monster.roomCentreX - 1000) * moveDirection + b < monster.roomCentreY + 1000) {
        //                     //right
        //                     let xDistance2 = monster.roomCentreX + 1000 - monster.x;
        //                     let yDistance2 = ((monster.roomCentreX + 1000) * moveDirection + b) - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 } else if ((monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                     (monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                     //top
        //                     let xDistance2 = (monster.roomCentreY + 1000 - b) / moveDirection - monster.x;
        //                     let yDistance2 = monster.roomCentreY - 1000 - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 } else if ((monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                     (monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                     //bottom
        //                     let xDistance2 = (monster.roomCentreY - 1000 - b) / moveDirection - monster.x;
        //                     let yDistance2 = monster.roomCentreY - 1000 - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 }
        //             } else if ((monster.roomCentreX + 1000) * moveDirection + b > monster.roomCentreY - 1000 &&
        //                 (monster.roomCentreX - 1000) * moveDirection + b < monster.roomCentreY + 1000) {
        //                 //right
        //                 let xDistance1 = monster.roomCentreX + 1000 - monster.x;
        //                 let yDistance1 = ((monster.roomCentreX + 1000) * moveDirection + b) - monster.y;
        //                 let distance1 = Math.sqrt(xDistance1 * xDistance1 + yDistance1 * yDistance1);
        //                 if ((monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                     (monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                     //top
        //                     let xDistance2 = (monster.roomCentreY + 1000 - b) / moveDirection - monster.x;
        //                     let yDistance2 = monster.roomCentreY - 1000 - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 } else if ((monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                     (monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                     //bottom
        //                     let xDistance2 = (monster.roomCentreY - 1000 - b) / moveDirection - monster.x;
        //                     let yDistance2 = monster.roomCentreY - 1000 - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 }
        //             } else if ((monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                 (monster.roomCentreY + 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                 //top
        //                 let xDistance1 = (monster.roomCentreY + 1000 - b) / moveDirection - monster.x;
        //                 let yDistance1 = monster.roomCentreY - 1000 - monster.y;
        //                 let distance1 = Math.sqrt(xDistance1 * xDistance1 + yDistance1 * yDistance1);
        //                 if ((monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX - 1000 &&
        //                     (monster.roomCentreY - 1000 - b) / moveDirection > monster.roomCentreX + 1000) {
        //                     //bottom
        //                     let xDistance2 = (monster.roomCentreY - 1000 - b) / moveDirection - monster.x;
        //                     let yDistance2 = monster.roomCentreY - 1000 - monster.y;
        //                     let distance2 = Math.sqrt(xDistance2 * xDistance2 + yDistance2 * yDistance2);
        //                     if (distance1 >= distance2) {
        //                         monster.x = monster.x + (xDistance1 / distance1) * monster.speed;
        //                         monster.y = monster.y + (yDistance1 / distance1) * monster.speed;
        //                     } else {
        //                         monster.x = monster.x + (xDistance2 / distance2) * monster.speed;
        //                         monster.y = monster.y + (yDistance2 / distance2) * monster.speed;
        //                     }
        //                 }
        //             }
        //         }
        //     }

    }
    )
}

function leaveThisLayer() {
    if (leave === true &&
        pass === true &&
        player.x >= nextX - 300 &&
        player.x <= nextX + 300 &&
        player.y >= nextY - 500 &&
        player.y <= nextY + 500
    ) {
        canvas.removeEventListener('mousedown', attackActivate, false);
        init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    drawCo();
    load_assets([{
        'var': knightImage, url: '/~yw18/cgi-bin/ca2/static/knight.png'
    }, {
        'var': warriorImage, url: '/~yw18/cgi-bin/ca2/static/warrior.png'
    }, {
        'var': mageImage, url: '/~yw18/cgi-bin/ca2/static/mage.png'
    }, {
        'var': wallImage, url: '/~yw18/cgi-bin/ca2/static/wall.png'
    }],
        drawMain)
}, false);


function init() {
    // reInit
    window.removeEventListener('keydown', activate, false);
    window.removeEventListener('keyup', deactivate, false);
    pausing = false;
    praisingRoom = [];
    healing = [];
    monsters = [];
    bullets = [];
    pass = false;
    nextX = 0;
    nextY = 0;
    player.x = 18000;
    player.y = 22000;
    player.hp = player.healthMax;
    damage = false;
    viewport = {
        x: 0,
        y: 0
    };

    moveLeft = false;
    moveUp = false;
    moveRight = false;
    moveDown = false;
    attack = false;
    skill = false;
    ACD = false;
    SCD = false;
    leave = false;

    stairLevel++;

    //
    canvas = document.querySelector('#mainViewport');
    bar = document.querySelector('#bar');
    context = canvas.getContext('2d');
    context2 = bar.getContext('2d');
    window.addEventListener('keydown', activate, false);
    window.addEventListener('keyup', deactivate, false);
    canvas.addEventListener('mousedown', attackActivate, false);
    canvas.addEventListener("contextmenu", event => event.preventDefault());
    n = random(0, 2)
    viewportFollower();
    randomRoom();
}

function drawCanvasBoundary() {

    context.strokeStyle = 'white';
    context.lineWidth = 5;
    context.strokeRect(0, 0, canvas.width, canvas.height);

}

function refresh() {

    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInternal) {
        return;
    }

}

function pause() {
    if (pausing === false) {
        pausing = true;
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgb(174, 0, 255)';
        context.fillRect(300, 150, 600, 250);
        context.fillStyle = 'rgb(34, 0, 187)';
        context.font = '48px Arial bold';
        context.fillText(`Game paused`, 500, 200)
        window.cancelAnimationFrame(mainLoop);
        window.cancelAnimationFrame(CoLoop);
    } else {
        pausing = false;
        mainLoop = requestAnimationFrame(drawMain);
        CoLoop = requestAnimationFrame(drawCo);
    }
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function healthCheck() {
    if (player.hp > player.healthMax) {
        player.hp = player.healthMax;
    }
    if (player.hp <= 0) {
        gameOver();
    }
    monsters.forEach(monster => {
        if (monster instanceof chest) {
            monster.gift();
        };
        monster.exp();
        if (monster instanceof boss &&
            monster.level == stairLevel * 2
        ) {
            nextX = monster.roomCentreX;
            nextY = monster.roomCentreY;
            if (monster.hp <= 0) {
                pass = true;
            }
        }
        if (monster instanceof skeleton) {
            monster.summoned();
        }
    }
    )

    monsters = monsters.filter(monster => monster.hp > 0);

}

function transfer() {
    let transferLeft = monsters.find(monster => (
        monster.roomCentreX === 6000
    ))

    let transferRight = monsters.find(monster => (
        monster.roomCentreX === 30000
    ))

    let transferTop = monsters.find(monster => (
        monster.roomCentreY === 6000
    ))
    if (!transferLeft) {

        context.fillStyle = 'rgba(57, 255, 2, 0.55)';
        context.fillRect(
            5050 - viewport.x,
            17800 - viewport.y,
            400,
            400);
        context.strokeStyle = 'black';
        context.lineWidth = 30;
        context.strokeRect(
            5050 - viewport.x,
            17800 - viewport.y,
            400,
            400
        )




        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '24px Arial';

        context.fillText(
            "Press E to transport to the map center",
            5050 - viewport.x,
            17700 - viewport.y
        );

        if (leave === true &&
            player.x >= 5000 &&
            player.x <= 5500 &&
            player.y >= 17800 &&
            player.y <= 18200
        ) {
            player.x = 18000;
            player.y = 18000;
        }
    }

    if (!transferRight) {

        context.fillStyle = 'rgba(57, 255, 2, 0.55)';
        context.fillRect(
            30550 - viewport.x,
            17800 - viewport.y,
            400,
            400);
        context.strokeStyle = 'black';
        context.lineWidth = 30;
        context.strokeRect(
            30550 - viewport.x,
            17800 - viewport.y,
            400,
            400
        )



        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '24px Arial';

        context.fillText(
            "Press E to transport to the map center",
            30550 - viewport.x,
            17700 - viewport.y
        );

        if (leave === true &&
            player.x >= 30500 &&
            player.x <= 31000 &&
            player.y >= 17800 &&
            player.y <= 18200
        ) {
            player.x = 18000;
            player.y = 18000;
        }
    }

    if (!transferTop) {

        context.fillStyle = 'rgba(57, 255, 2, 0.55)';
        context.fillRect(
            17800 - viewport.x,
            5050 - viewport.y,
            400,
            400);
        context.strokeStyle = 'black';
        context.lineWidth = 30;
        context.strokeRect(
            17800 - viewport.x,
            5050 - viewport.y,
            400,
            400);


        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '24px Arial';

        context.fillText(
            "Press E to transport to the map center",
            17800 - viewport.x,
            4950 - viewport.y
        );

        if (leave === true &&
            player.x >= 17800 &&
            player.x <= 18200 &&
            player.y >= 5000 &&
            player.y <= 5500
        ) {
            player.x = 18000;
            player.y = 18000;
        }
    }



}

function nextLayer() {
    if (pass === true) {
        context.strokeStyle = 'black';
        context.lineWidth = 50;
        context.strokeRect(
            nextX - 200 - viewport.x,
            nextY - 400 - viewport.y,
            400,
            600
        )
        context.fillStyle = 'rgba(98, 0, 255, 0.55)';
        context.fillRect(
            nextX - 175 - viewport.x,
            nextY - 375 - viewport.y,
            350,
            550);
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '24px Arial';
        let textWidth = context.measureText("come and press 'E' to leave this layer").width;
        context.fillText(
            "come and press 'E' to leave this layer",
            nextX - viewport.x - textWidth / 2,
            nextY - 450 - viewport.y
        );
    }
}

function viewportFollower() {

    viewport.x = player.x - canvas.width / 2
    viewport.y = player.y - canvas.height / 2

}

function drawBackground() {

    let firstX = Math.floor(viewport.x / tileSize);
    let firstY = Math.floor(viewport.y / tileSize);
    let numberX = Math.floor(canvas.width / tileSize) + 2;
    let numberY = Math.floor(canvas.height / tileSize) + 2;

    for (let col = firstX; col < firstX + numberX; col += 1) {
        for (let row = firstY; row < firstY + numberY; row += 1) {
            if ((col + row) % 2 === 0) {
                if (n === 0) {
                    context.fillStyle = 'rgb(162, 147, 5)'
                } else if (n === 1) {
                    context.fillStyle = 'rgb(168, 168, 168)'
                } else if (n === 2) {
                    context.fillStyle = 'rgb(75, 50, 73)'
                }
            } else {
                if (n === 0) {
                    context.fillStyle = 'rgb(108, 129, 0)'
                }
                else if (n === 1) {
                    context.fillStyle = 'rgb(93, 93, 93)'
                } else if (n === 2) {
                    context.fillStyle = 'rgb(64, 43, 72)'
                }
            };



            //use if to add boundary check; background outside the boundary 
            //should be clear



            context.fillRect(
                col * tileSize - viewport.x,
                row * tileSize - viewport.y,
                tileSize,
                tileSize
            );
        }
    }
}

function praisingRoomFunc() {
    if (praisingRoom.length != 0) {
        context.fillStyle = 'rgba(71, 244, 172, 0.6)';
        for (let i of praisingRoom) {
            context.fillRect(
                i[0] - viewport.x + 25,
                i[2] - viewport.y + 25,
                1950, 1950)
            for (let n in healing)
                if (i[4] === healing[n][0]) {
                    if (player.x > i[0] &&
                        player.x < i[1] &&
                        player.y > i[2] &&
                        player.y < i[3] &&
                        healing[n][1] === true
                    ) {
                        player.healthMax += 5 + 5 * Math.floor(stairLevel / 5);
                        player.hp = player.healthMax;
                        healing[n][1] = false;
                    }
                }
        }
    }
}

function Boundary() {

    // context.save();
    // context.translate(-viewport.x, -viewport.y);
    // let boundary = new Path2D();

    // boundary.moveTo(19000, 5000);

    // let y = 5000;

    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(19000, y += 2000);
    //     boundary.lineTo(18200, y);
    //     boundary.lineTo(18200, y += 2000);
    //     boundary.lineTo(19000, y);
    // }

    // let x = 19000;

    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(x, 17800);
    //     boundary.lineTo(x += 2000, 17800);
    //     boundary.lineTo(x, 17000);
    //     boundary.lineTo(x += 2000, 17000);
    // }
    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(x, 19000);
    //     boundary.lineTo(x -= 2000, 19000);
    //     boundary.lineTo(x, 18200);
    //     boundary.lineTo(x -= 2000, 18200);
    // }

    // boundary.lineTo(19000, 19000);
    // boundary.lineTo(18200, 19000);
    // boundary.lineTo(18200, 21000);
    // boundary.lineTo(19000, 21000);
    // boundary.lineTo(19000, 23000);
    // boundary.lineTo(17000, 23000);
    // boundary.lineTo(17000, 21000);
    // boundary.lineTo(17800, 21000);
    // boundary.lineTo(17800, 19000);
    // boundary.lineTo(17000, 19000);
    // x = 17000;
    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(x, 18200);
    //     boundary.lineTo(x -= 2000, 18200);
    //     boundary.lineTo(x, 19000);
    //     boundary.lineTo(x -= 2000, 19000);
    // }
    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(x, 17000);
    //     boundary.lineTo(x += 2000, 17000);
    //     boundary.lineTo(x, 17800);
    //     boundary.lineTo(x += 2000, 17800);
    // }
    // boundary.lineTo(17000, 17000);
    // y = 17000;
    // for (let i = 0; i < 3; i += 1) {
    //     boundary.lineTo(17800, y);
    //     boundary.lineTo(17800, y -= 2000);
    //     boundary.lineTo(17000, y);
    //     boundary.lineTo(17000, y -= 2000);
    // }
    // boundary.closePath()

    // context.strokeStyle = "black";
    // context.lineWidth = 50;
    // context.stroke(boundary);
    // context.restore();

    let boundaryLines = [
        [19000, 5000, 19000, 7000],
        [19000, 7000, 18200, 7000],
        [18200, 7000, 18200, 9000],
        [18200, 9000, 19000, 9000],
        [19000, 9000, 19000, 11000],
        [19000, 11000, 18200, 11000],
        [18200, 11000, 18200, 13000],
        [18200, 13000, 19000, 13000],

        [19000, 15000, 18200, 15000],
        [18200, 15000, 18200, 17000],
        [18200, 17000, 19000, 17000],

        [19000, 13000, 19000, 15000],
        [19000, 17000, 19000, 17800],

        [19000, 17800, 21000, 17800],
        [21000, 17800, 21000, 17000],
        [21000, 17000, 23000, 17000],
        [23000, 17000, 23000, 17800],
        [23000, 17800, 25000, 17800],
        [25000, 17800, 25000, 17000],
        [25000, 17000, 27000, 17000],

        [27000, 17000, 27000, 17800],
        [27000, 19000, 27000, 18200],
        [27000, 17800, 29000, 17800],
        [27000, 18200, 29000, 18200],
        [29000, 17800, 29000, 17000],
        [29000, 18200, 29000, 19000],
        [31000, 17000, 31000, 19000],
        [29000, 17000, 31000, 17000],
        [29000, 19000, 31000, 19000],



        [27000, 19000, 25000, 19000],
        [25000, 19000, 25000, 18200],
        [25000, 18200, 23000, 18200],
        [23000, 18200, 23000, 19000],
        [23000, 19000, 21000, 19000],
        [21000, 19000, 21000, 18200],
        [21000, 18200, 19000, 18200],

        [19000, 18200, 19000, 19000],
        [19000, 19000, 18200, 19000],
        [18200, 19000, 18200, 21000],
        [18200, 21000, 19000, 21000],
        [19000, 21000, 19000, 23000],
        [19000, 23000, 17000, 23000],
        [17000, 23000, 17000, 21000],
        [17000, 21000, 17800, 21000],
        [17800, 21000, 17800, 19000],
        [17800, 19000, 17000, 19000],

        [17000, 19000, 17000, 18200],
        [17000, 18200, 15000, 18200],
        [15000, 18200, 15000, 19000],
        [15000, 19000, 13000, 19000],
        [13000, 19000, 13000, 18200],
        [13000, 18200, 11000, 18200],
        [11000, 18200, 11000, 19000],
        [11000, 19000, 9000, 19000],

        [9000, 19000, 9000, 18200],
        [9000, 17000, 9000, 17800],
        [9000, 18200, 7000, 18200],
        [9000, 17800, 7000, 17800],

        [7000, 19000, 7000, 18200],
        [7000, 17000, 7000, 17800],

        [7000, 19000, 5000, 19000],

        [5000, 17000, 5000, 19000],
        [5000, 17000, 7000, 17000],


        [9000, 17000, 11000, 17000],
        [11000, 17000, 11000, 17800],
        [11000, 17800, 13000, 17800],
        [13000, 17800, 13000, 17000],
        [13000, 17000, 15000, 17000],
        [15000, 17000, 15000, 17800],
        [15000, 17800, 17000, 17800],

        [17000, 17800, 17000, 17000],
        [17000, 17000, 17800, 17000],
        [17800, 17000, 17800, 15000],
        [17800, 15000, 17000, 15000],
        [17000, 15000, 17000, 13000],
        [17000, 13000, 17800, 13000],
        [17800, 13000, 17800, 11000],
        [17800, 11000, 17000, 11000],
        [17000, 11000, 17000, 9000],
        [17000, 9000, 17800, 9000],
        [17800, 9000, 17800, 7000],
        [17800, 7000, 17000, 7000],
        [17000, 7000, 17000, 5000],
        [17000, 5000, 19000, 5000]
    ];

    let playerLeft = player.x - player.xSize / 2;
    let playerRight = player.x + player.xSize / 2;
    let playerTop = player.y - player.ySize / 2;
    let playerBottom = player.y + player.ySize / 2;
    let halfLineRange = 25;

    for (let line of boundaryLines) {
        if (line[0] === line[2]) {

            let minX = line[0] - halfLineRange;
            let maxX = line[0] + halfLineRange;
            let minY = Math.min(line[1], line[3]);
            let maxY = Math.max(line[1], line[3]);


            //draw
            context.save();
            context.translate(-viewport.x, -viewport.y);
            for (let y = minY; y <= maxY; y += 50) {
                context.drawImage(wallImage,
                    0, 0, 128, 128,
                    line[0] - 25, y - 25,
                    50, 50
                );
            }
            context.restore();

            if (playerRight >= minX &&
                playerRight < maxX &&
                playerBottom > minY &&
                playerTop < maxY) {
                player.x = minX - player.xSize / 2;
            }
            if (playerLeft > minX &&
                playerLeft < maxX &&
                playerBottom > minY &&
                playerTop < maxY) {
                player.x = maxX + player.xSize / 2;
            }
        }
        if (line[1] === line[3]) {

            let minY = line[1] - halfLineRange;
            let maxY = line[1] + halfLineRange;
            let minX = Math.min(line[0], line[2]);
            let maxX = Math.max(line[0], line[2]);

            //draw
            context.save();
            context.translate(-viewport.x, -viewport.y);
            for (let x = minX; x <= maxX; x += 50) {
                context.drawImage(
                    wallImage,
                    0, 0, 128, 128,
                    x - 25, line[1] - 25,
                    50, 50
                );
            }
            context.restore();
            if (playerBottom > minY &&
                playerBottom < maxY &&
                playerRight > minX &&
                playerLeft < maxX) {
                player.y = minY - player.ySize / 2;
            }
            if (playerTop >= minY &&
                playerTop < maxY &&
                playerRight > minX &&
                playerLeft < maxX) {
                player.y = maxY + player.ySize / 2;
            }




            let monsterCheck = monsters.find(monster => (
                player.x >= monster.roomCentreX - 975 &&
                player.x <= monster.roomCentreX + 975 &&
                player.y >= monster.roomCentreY - 975 &&
                player.y <= monster.roomCentreY + 975
            ));


            if (monsterCheck) {

                let roomRight = monsterCheck.roomCentreX + 975 - player.xSize / 2;
                let roomLeft = monsterCheck.roomCentreX - 975 + player.xSize / 2;
                let roomTop = monsterCheck.roomCentreY - 975 + player.xSize / 2;
                let roomBottom = monsterCheck.roomCentreY + 975 - player.xSize / 2;
                if (player.x >= roomRight) {
                    player.x = roomRight;
                } else if (player.x <= roomLeft) {
                    player.x = roomLeft;
                } else if (player.y <= roomTop) {
                    player.y = roomTop;
                } else if (player.y >= roomBottom) {
                    player.y = roomBottom;
                }

                context.strokeStyle = "rgba(105, 0, 161, 0.03)";
                context.lineWidth = 50;

                if (monsterCheck.x < 28000 &&
                    monsterCheck.y > 16000
                ) {
                    context.beginPath();
                    context.moveTo(monsterCheck.roomCentreX + 1000 - viewport.x, monsterCheck.roomCentreY - 175 - viewport.y);
                    context.lineTo(monsterCheck.roomCentreX + 1000 - viewport.x, monsterCheck.roomCentreY + 175 - viewport.y);
                    context.closePath();
                    context.stroke();
                }

                if (monsterCheck.x > 8000 &&
                    monsterCheck.y > 16000
                ) {
                    context.beginPath();
                    context.moveTo(monsterCheck.roomCentreX - 1000 - viewport.x, monsterCheck.roomCentreY - 175 - viewport.y);
                    context.lineTo(monsterCheck.roomCentreX - 1000 - viewport.x, monsterCheck.roomCentreY + 175 - viewport.y);
                    context.closePath();
                    context.stroke();
                }

                if (monsterCheck.x > 16000 &&
                    monsterCheck.x < 19000) {

                    context.beginPath();
                    context.moveTo(monsterCheck.roomCentreX - 175 - viewport.x, monsterCheck.roomCentreY + 1000 - viewport.y);
                    context.lineTo(monsterCheck.roomCentreX + 175 - viewport.x, monsterCheck.roomCentreY + 1000 - viewport.y);
                    context.closePath();
                    context.stroke();

                    if (monsterCheck.y > 6000) {
                        context.beginPath();
                        context.moveTo(monsterCheck.roomCentreX - 175 - viewport.x, monsterCheck.roomCentreY - 1000 - viewport.y);
                        context.lineTo(monsterCheck.roomCentreX + 175 - viewport.x, monsterCheck.roomCentreY - 1000 - viewport.y);
                        context.closePath();
                        context.stroke();
                    }

                }

            }


            //monster
            monsters.forEach(monster => {

                let roomLeft = monster.roomCentreX - 975 + monster.xSize / 2;
                let roomRight = monster.roomCentreX + 975 - monster.xSize / 2;
                let roomTop = monster.roomCentreY - 975 + monster.ySize / 2;
                let roomBottom = monster.roomCentreY + 975 - monster.ySize / 2;
                monster.x = Math.max(roomLeft, Math.min(roomRight, monster.x));
                monster.y = Math.max(roomTop, Math.min(roomBottom, monster.y));

            })
        }
    }
}












function attackActivity() {
    if (attackAction === true) {
        //player
        if (mapPositionX >= player.x &&
            attackAction === true


        ) {
            if (attackFrame < 32) {
                player.frameY = 3;

                player.frameX = Math.floor(attackFrame / 8);
                attackFrame++;
            }
            else {
                attackAction = false;
                attackFrame = 0;
            }
        }
    }
    if (mapPositionX < player.x &&
        attackAction === true
    ) {
        {
            if (attackFrame < 32) {
                player.frameY = 4;

                player.frameX = Math.floor(attackFrame / 8);
                attackFrame++;
            }
            else {
                attackAction = false;
                attackFrame = 0;
            }
        }
    }
}


function attackActivate(event) {
    // click position
    let abPosition = canvas.getBoundingClientRect()
    let clientX = event.clientX - abPosition.left;
    let clientY = event.clientY - abPosition.top;
    mapPositionX = clientX + viewport.x;
    mapPositionY = clientY + viewport.y;
    theta = Math.atan2(clientY - canvas.height / 2, clientX - canvas.width / 2)


    attackAction = true;




    //skill

    if (event.button === 2) {
        if (SCD === false) {
            SCD = true;
            skillPositionX = mapPositionX;
            skillPositionY = mapPositionY;
            skillPre = true;
            canvas.removeEventListener('mousedown', attackActivate, false);


            if (player.role === 'knight' ||
                player.role === 'superKnight') {
                //knight
                player.xSpeed = 1;
                player.ySpeed = 1;


            } else if (player.role === 'warrior') {
                //warrior
                player.xSpeed = 0;
                player.ySpeed = 0;
                oHealth = player.hp;
                window.removeEventListener('keydown', activate, false);
                window.removeEventListener('keyup', deactivate, false);

            } else if (player.role === 'mage') {
                //mage
                player.xSpeed = 0;
                player.ySpeed = 0;
            }
            setTimeout(() => {
                player.xSpeed = oSpeed;
                player.ySpeed = oSpeed;
                skill = true;
                if (player.role != 'mage') {
                    damage = true;
                } else {
                    skillDamage = true;
                }
                if (player.role === 'warrior') {
                    player.hp = oHealth;
                }
            }, player.skillPre);
            let timerSCD = setInterval(() => {
                SCDCountDown -= 0.5;
                if (SCDCountDown === 0) {
                    clearInterval(timerSCD);
                    SCD = false;
                    SCDCountDown = player.SCD
                }
            }, 500)
        }
    } else if (event.button === 0) {

        //attack

        if (ACD === false) {
            ACD = true;
            canvas.removeEventListener('mousedown', attackActivate, false)

            if (player.role === 'knight' ||
                player.role === 'superKnight') {
                player.xSpeed = 2.5;
                player.ySpeed = 2.5;
            } else if (player.role === 'warrior') {
                player.xSpeed = 0;
                player.ySpeed = 0;
            } else if (player.role === 'mage') {
                player.xSpeed = 1;
                player.ySpeed = 1;
            }
            setTimeout(() => {

                attack = true;
                damage = true;
                player.xSpeed = oSpeed;
                player.ySpeed = oSpeed;
            }, player.attackPre);
            console.log(`attacked`);
            let timerACD = setInterval(() => {
                ACDCountDown -= 0.5;
                if (ACDCountDown === 0) {
                    clearInterval(timerACD);
                    ACD = false;
                    console.log('over');
                    ACDCountDown = player.ACD
                }
            }, 500)
        }
    }

}
function attackLogic() {
    if (player.role === 'knight' ||
        player.role === 'superKnight') {

        //knight skill

        if (skill === true) {
            setTimeout(() => {
                canvas.addEventListener('mousedown', attackActivate, false)
            }, skillTotal);
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2);
            context.arc(canvas.width / 2, canvas.height / 2,
                300,
                theta - Math.PI / 2, theta + Math.PI / 2);
            context.closePath();
            let skillColor = context.createRadialGradient(canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                300);
            skillColor.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
            skillColor.addColorStop(1, 'rgb(255, 166, 2)');
            context.fillStyle = skillColor;
            context.fill();
            setTimeout(() => {
                skill = false
            }, player.skillDuration);
        }

        //knight attack

        else if (attack === true) {
            canvas.removeEventListener('mousedown', attackActivate, false)
            setTimeout(() => {
                canvas.addEventListener('mousedown', attackActivate, false)
            }, attackTotal);
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2)
            context.arc(canvas.width / 2, canvas.height / 2,
                150,
                theta - Math.PI / 8, theta + Math.PI / 8)
            context.closePath();
            let attackColor = context.createRadialGradient(canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                150);
            attackColor.addColorStop(0, 'rgba(255, 255, 255, 0)');
            attackColor.addColorStop(1, 'rgba(218, 245, 255, 0.51)');
            context.fillStyle = attackColor;
            context.fill();
            setTimeout(() => {
                attack = false
            }, player.attackDuration);
        }


        //warrior skill

    } else if (player.role === 'warrior') {
        if (skill === true) {
            skillPre = false;

            //health remaining

            if (oHealth > player.hp) {
                player.hp = oHealth;
            } else if (oHealth < player.hp) {
                oHealth = player.hp;
            }

            let monsterCheck = monsters.find(monster => (
                player.x >= monster.roomCentreX - 975 &&
                player.x <= monster.roomCentreX + 975 &&
                player.y >= monster.roomCentreY - 975 &&
                player.y <= monster.roomCentreY + 975
            ));


            if (monsterCheck) {

                let roomRight = monsterCheck.roomCentreX + 975 - player.xSize / 2;
                let roomLeft = monsterCheck.roomCentreX - 975 + player.xSize / 2;
                let roomTop = monsterCheck.roomCentreY - 975 + player.xSize / 2;
                let roomBottom = monsterCheck.roomCentreY + 975 - player.xSize / 2;
                let firstRush = true;


                if (firstRush === true) {
                    firstRush = false;

                    player.x += 6 * Math.cos(theta);
                    player.y += 6 * Math.sin(theta);

                }


                if (player.x <= roomRight + 1 &&
                    player.x >= roomLeft - 1 &&
                    player.y >= roomTop + 1 &&
                    player.y <= roomBottom - 1) {
                    //draw
                    context.beginPath();
                    context.moveTo(canvas.width / 2, canvas.height / 2)
                    context.arc(canvas.width / 2, canvas.height / 2,
                        100,
                        0, 2 * Math.PI)
                    context.closePath();
                    let skillColor = context.createRadialGradient(canvas.width / 2,
                        canvas.height / 2,
                        0,
                        canvas.width / 2,
                        canvas.height / 2,
                        100);
                    skillColor.addColorStop(0, 'rgba(255, 255, 202, 0.2)');
                    skillColor.addColorStop(1, 'rgba(255, 242, 0, 0.51)');
                    context.fillStyle = skillColor;
                    context.fill();
                    player.xSpeed = 2;
                    player.ySpeed = 2;
                    player.x += player.xSpeed * Math.cos(theta);
                    player.y += player.ySpeed * Math.sin(theta);
                }
                else {
                    player.xSpeed = oSpeed;
                    player.ySpeed = oSpeed;
                    canvas.addEventListener('mousedown', attackActivate, false)
                    window.addEventListener('keydown', activate, false);
                    window.addEventListener('keyup', deactivate, false);
                    skill = false;
                    moveLeft = false;
                    moveUp = false;
                    moveRight = false;
                    moveDown = false;
                    damage = false;
                    warriorHit = true;
                    skillAfter = true;
                }
            } else {
                canvas.addEventListener('mousedown', attackActivate, false)
                window.addEventListener('keydown', activate, false);
                window.addEventListener('keyup', deactivate, false);
                skill = false;
                moveLeft = false;
                moveUp = false;
                moveRight = false;
                moveDown = false;

            }

        }

        //warrior attack
        else if (attack === true) {
            canvas.removeEventListener('mousedown', attackActivate, false)
            setTimeout(() => {
                canvas.addEventListener('mousedown', attackActivate, false)
            }, attackTotal);
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2)
            context.arc(canvas.width / 2, canvas.height / 2,
                125,
                0, 2 * Math.PI)
            context.closePath();
            let attackColor = context.createRadialGradient(canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                125);
            attackColor.addColorStop(0, 'rgba(255, 255, 255, 0)');
            attackColor.addColorStop(1, 'rgba(71, 131, 153, 0.7)');
            context.fillStyle = attackColor;
            context.fill();
            setTimeout(() => {
                attack = false
            }, player.attackDuration);
        }


    } else if (player.role === 'mage') {

        // mage skill
        if (attack === true) {
            setTimeout(() => {
                canvas.addEventListener('mousedown', attackActivate, false)
            }, 250);
            if (attack === true &&
                damage === true
            ) {
                //mage attack

                attack = false;
                damage = false;

                //check monster

                let monsterCheck = monsters.find(monster => (
                    player.x >= monster.roomCentreX - 975 &&
                    player.x <= monster.roomCentreX + 975 &&
                    player.y >= monster.roomCentreY - 975 &&
                    player.y <= monster.roomCentreY + 975
                ));
                if (monsterCheck) {
                    console.log('shoot')
                    bullets.push(new fireBall(
                        player.x,
                        player.y,
                        monsterCheck.roomCentreX,
                        monsterCheck.roomCentreY,
                        player.AP,
                        theta
                    ));

                }
            }
        } else if (skill === true) {

            setTimeout(() => {
                canvas.addEventListener('mousedown', attackActivate, false)
            }, 250);
            setTimeout(() => {
                skill = false;
                skillDamage = false;
            }, player.skillDuration);
            context.beginPath();
            context.moveTo(skillPositionX - viewport.x, skillPositionY - viewport.y);
            context.arc(skillPositionX - viewport.x, skillPositionY - viewport.y,
                300,
                0, Math.PI * 2);
            context.closePath();
            let skillColor = context.createRadialGradient(
                skillPositionX - viewport.x,
                skillPositionY - viewport.y,
                0,
                skillPositionX - viewport.x,
                skillPositionY - viewport.y,
                300);
            skillColor.addColorStop(0, 'rgba(0, 255, 247, 0.32)');
            skillColor.addColorStop(0.2, 'rgba(255, 8, 0, 0.4)');
            skillColor.addColorStop(0.4, 'rgba(255, 102, 0, 0.5)');
            skillColor.addColorStop(1, 'rgb(255, 166, 2)');
            context.fillStyle = skillColor;
            context.fill();

        }
    }


    //monster interaction
    let monsterCheck = monsters.find(monster => (
        player.x >= monster.roomCentreX - 975 &&
        player.x <= monster.roomCentreX + 975 &&
        player.y >= monster.roomCentreY - 975 &&
        player.y <= monster.roomCentreY + 975
    ));

    if (monsterCheck) {
        if (player.role === 'knight' && 'superKnight') {


            // knight attack 

            if (attack === true &&
                damage === true
            ) {
                damage = false;
                monsters.forEach(monster => {


                    let directDistance = Math.hypot((monster.x - player.x),
                        (monster.y - player.y))
                    let attackDistance = 150
                    if (attackDistance + monster.xSize / 2 > (directDistance)) {
                        // Establish a coordinate system 
                        // to find the intersections of two circles
                        // then check if one point is within the attack arc
                        // for convenience i copied the function from a website,
                        // details are showed in the acknowledgements.
                        let intersectionPoints = intersection(
                            { x: player.x, y: player.y, r: attackDistance },
                            { x: monster.x, y: monster.y, r: monster.xSize / 2 }
                        )
                        if (intersectionPoints.intersect_count == 0) {
                            monster.hp -= player.AP;
                            return;
                        } else {
                            let LocationX = player.x + attackDistance * Math.cos(theta);
                            let LocationY = player.y + attackDistance * Math.sin(theta);

                            LocationX += player.x;
                            LocationY += player.y;
                            let middlePointLength = Math.hypot(monster.x - LocationX, monster.y - LocationY);
                            if (middlePointLength <= monster.xSize / 2) {
                                monster.hp -= player.AP;
                                return;
                            }
                            let k1 = Math.atan2(intersectionPoints.point_1.y - player.y,
                                intersectionPoints.point_1.x - player.x);
                            let k2 = Math.atan2(intersectionPoints.point_2.y - player.y,
                                intersectionPoints.point_2.x - player.x);
                            if ((k1 > theta - Math.PI / 8 &&
                                k1 < theta + Math.PI / 8) ||
                                (k2 > theta - Math.PI / 8 &&
                                    k2 < theta + Math.PI / 8)
                            ) {
                                monster.hp -= player.AP;
                                return;
                            } else if (Math.min(k1, k2) <= theta - Math.PI / 8 &&
                                Math.max(k1, k2) >= theta + Math.PI / 8) {

                                monster.hp -= player.AP
                            }

                        }



                    }
                })

            }

            // knight skill

            else if (skill === true &&
                damage === true
            ) {
                damage = false;
                monsters.forEach(monster => {


                    let directDistance = Math.hypot((monster.x - player.x),
                        (monster.y - player.y))
                    let skillDistance = 300
                    if (skillDistance + monster.xSize / 2 > (directDistance)) {

                        let intersectionPoints = intersection(
                            { x: player.x, y: player.y, r: skillDistance },
                            { x: monster.x, y: monster.y, r: monster.xSize / 2 }
                        )
                        if (intersectionPoints.intersect_count == 0) {
                            monster.hp -= player.SAP;
                            return;
                        } else {
                            let k1 = Math.atan2(intersectionPoints.point_1.y - player.y,
                                intersectionPoints.point_1.x - player.x)
                            let k2 = Math.atan2(intersectionPoints.point_2.y - player.y,
                                intersectionPoints.point_2.x - player.x)
                            if ((k1 > theta - Math.PI / 2 &&
                                k1 < theta + Math.PI / 2) ||
                                (k2 > theta - Math.PI / 2 &&
                                    k2 < theta + Math.PI / 2)
                            ) {
                                monster.hp -= player.SAP

                            } else if (Math.min(k1, k2) <= theta - Math.PI / 2 &&
                                Math.max(k1, k2) >= theta + Math.PI / 2) {

                                monster.hp -= player.SAP
                            }
                        }



                    }
                })

            }
        } else if (player.role === 'warrior') {

            //warrior attack

            if (attack === true &&
                damage === true
            ) {
                damage = false;
                monsters.forEach(monster => {


                    let directDistance = Math.hypot((monster.x - player.x),
                        (monster.y - player.y))
                    let attackDistance = 125;
                    if (attackDistance + monster.xSize / 2 > (directDistance)) {
                        monster.hp -= player.AP;
                        monster.dizziness = false;
                        setTimeout(() => {
                            monster.dizziness = true;
                        }, 1500)
                    }
                })
            }

            //warrior skill

            else if (skill === true &&
                damage === true
            ) {
                damage = false;
                setTimeout(() => {
                    damage = true;
                }, 250);

                monsters.forEach(monster => {


                    let directDistance = Math.hypot((monster.x - player.x),
                        (monster.y - player.y))
                    let skillDistance = 100
                    if (skillDistance + monster.xSize / 2 > (directDistance)) {
                        monster.hp -= Math.floor(player.SAP / 3);
                        monster.dizziness = true;
                        setTimeout(() => {
                            monster.dizziness = false;
                        }, 250)
                    }
                })
            } else if (warriorHit === true) {

                //warrior skill hit the wall


                warriorHit = false;

                monsters.forEach(monster => {

                    let directDistance = Math.hypot((monster.x - player.x),
                        (monster.y - player.y))

                    let skillDistance = 250;
                    if (skillDistance + monster.xSize / 2 > (directDistance)) {
                        monster.hp -= player.SAP;
                        monster.dizziness = false;
                        setTimeout(() => {
                            monster.dizziness = true;
                        }, 1000);
                    }
                })
            }
        } else if (player.role === 'mage') {


            //attack is ball so only skill


            if (skill === true &&
                skillDamage === true
            ) {
                //mage skill
                skillDamage = false;
                setTimeout(() => {
                    skillDamage = true;
                }, 500);

                monsters.forEach(monster => {


                    let directDistance = Math.hypot((monster.x - skillPositionX),
                        (monster.y - skillPositionY))
                    let skillDistance = 300
                    if (skillDistance + monster.xSize / 2 > (directDistance)) {
                        monster.hp -= Math.floor(player.SAP / 2);
                    }
                })
            }
        }
    }
}

function attackFeatured() {
    if (player.role === 'knight' && 'superKnight') {
        if (player.xSpeed === 1) {
            console.log('pre_skill')
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2);
            context.arc(canvas.width / 2, canvas.height / 2,
                300,
                theta - Math.PI / 2, theta + Math.PI / 2);
            context.closePath();
            let skillRange = context.createRadialGradient(canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                300);
            skillRange.addColorStop(0, 'rgba(255, 255, 255, 0)');
            skillRange.addColorStop(1, 'rgba(255, 251, 5, 0.7)');
            context.fillStyle = skillRange;
            context.fill();
        }
    } else if (player.role === 'warrior') {
        if (skillAfter === true) {
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2)
            context.arc(canvas.width / 2, canvas.height / 2,
                250,
                0, 2 * Math.PI)
            context.closePath();
            let skillColor = context.createRadialGradient(canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                150);
            skillColor.addColorStop(0, 'rgba(255, 255, 0, 0.2)');
            skillColor.addColorStop(1, 'rgb(255, 251, 0)');
            context.fillStyle = skillColor;
            context.fill();
            setTimeout(() => {
                skillAfter = false;
            }, player.skillDuration);
        }
    } else if (player.role === 'mage') {
        //fire ball!!!
        if (skillAfter === true) {
            //draw
            context.beginPath();
            context.moveTo(recordX - viewport.x, recordY - viewport.y)
            context.arc(recordX - viewport.x, recordY - viewport.y,
                100,
                0, 2 * Math.PI)
            context.closePath();
            let attackColor = context.createRadialGradient(
                recordX - viewport.x, recordY - viewport.y,
                0,
                recordX - viewport.x, recordY - viewport.y,
                150);
            attackColor.addColorStop(0, 'rgba(112, 236, 255, 0.49)');
            attackColor.addColorStop(1, 'rgba(255, 5, 5, 0.51)');
            context.fillStyle = attackColor;
            context.fill();
        }

    }
}

function monsterAttack() {
    monsters.forEach(monster => {
        monster.attacking();
        if (monster instanceof boss) {
            monster.skill();
        }
    }
    )

}

function bulletsLogic() {
    bullets.forEach(bullet => {

        bullet.move();
        bullet.hit();
        bullet.boundary();

        if (bullet instanceof magicBall ||
            bullet instanceof cursingBall
        ) {
            let checkSource = monsters.find(monster =>
                monster.n === bullet.n &&
                monster.roomCentreX === bullet.roomCentreX &&
                monster.roomCentreY === bullet.roomCentreY
            )
            if (!checkSource) {
                bullet.delete = true;
            }
        }
    }
    )


    //for fireball
    bullets.forEach(bullet => {
        if (bullet instanceof fireBall &&
            bullet.delete === true) {
            monsters.forEach(monster => {


                bullet.distance = Math.hypot(
                    bullet.y - monster.y,
                    bullet.x - monster.x);
                if (bullet.distance <= monster.xSize / 2 + 100) {
                    monster.hp -= Math.floor(bullet.damage / 3);
                }
            })
            recordX = bullet.x;
            recordY = bullet.y;
            skillAfter = true;
            setTimeout(() => {
                skillAfter = false;
            }, 500);
        }

    }
    )





    bullets = bullets.filter(bullet => !bullet.delete)

}



function move() {
    if (moveDown) {
        if (moveLeft || moveRight) {
            player.y = player.y + player.ySpeed / Math.SQRT2
        } else {
            player.y = player.y + player.ySpeed
        }
    };
    if (moveUp) {
        if (moveLeft || moveRight) {
            player.y = player.y - player.ySpeed / Math.SQRT2
        } else {
            player.y = player.y - player.ySpeed
        }
    };
    if (moveLeft) {
        if (moveUp || moveDown) {
            player.x = player.x - player.xSpeed / Math.SQRT2
        } else {
            player.x = player.x - player.xSpeed
        }
    };
    if (moveRight) {
        if (moveUp || moveDown) {
            player.x = player.x + player.xSpeed / Math.SQRT2
        } else {
            player.x = player.x + player.xSpeed
        }
    }
}

function levelUp() {
    if (player.exp >= player.expMax) {
        player.level += 1;
        player.exp -= player.expMax;

        if (player.level / player.HUpTimes
            === Math.floor(player.level / player.HUpTimes)) {


            player.healthMax += player.HWithLvUp;
        }
        player.hp = player.healthMax;



        if (player.level / player.AUpTimes
            === Math.floor(player.level / player.AUpTimes)) {


            player.AP += player.AWithLvUp;
            player.SAP += 2 * player.AWithLvUp;
        }



        if (Math.floor(player.level / 5)
            === player.level / 5) {
            player.expMax += 5;
        }

    }
}



function drawMain() {
    mainLoop = window.requestAnimationFrame(drawMain);
    // background()
    viewportFollower();
    refresh();



    // background
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawCanvasBoundary();

    //praisingRoom
    praisingRoomFunc();
    //bossRoom
    if (n === 0) {
        context.fillStyle = 'rgba(255, 94, 0, 0.3)';
    } else if (n === 1) {
        context.fillStyle = 'rgba(175, 175, 175, 0.3)';
    } else {
        context.fillStyle = 'rgba(49, 0, 67, 0.3)';
    }
    context.fillRect(
        nextX - 975 - viewport.x,
        nextY - 975 - viewport.y,
        1950, 1950)

    levelUp();
    move();
    Boundary();



    attackLogic();
    attackFeatured();
    monsterAttack();
    bulletsLogic();

    nextLayer();

    // draw player
    context.fillStyle = 'blue';
    if (player.role === 'knight' ||
        player.role === 'superKnight'
    ) {
        roleImage = knightImage;
    } else if (player.role === 'warrior') {
        roleImage = warriorImage;
    } else if (player.role === 'mage') {
        roleImage = mageImage;
    }
    if (attackAction === true) {
        //in attack activate
        attackActivity()
    } else if ((moveRight) &&
        !(moveRight && moveLeft) &&
        !(!moveRight && moveUp && moveDown)) {
        player.frameX = (player.frameX + 1) % 4;
        player.frameY = 0;
    } else if ((moveLeft || moveDown) &&
        !(moveRight && moveLeft) &&
        !(!moveLeft && moveUp && moveDown)) {
        player.frameX = (player.frameX + 1) % 4;
        player.frameY = 1;
    } else if ((moveUp) &&
        !(moveRight && moveLeft) &&
        !(!moveRight && moveUp && moveDown)) {
        player.frameX = (player.frameX + 1) % 4;
        player.frameY = 0;
    } else {
        player.frameY = 2;
        stayFrame++;
        player.frameX = Math.floor(stayFrame / 32) % 4;
    }
    context.drawImage(roleImage,
        player.frameX * 256, player.frameY * 256, 256, 256,
        canvas.width / 2 - player.xSize / 2, canvas.height / 2 - player.ySize / 2, player.xSize * 1.5, player.ySize * 1.5
    )


    //monster
    monsters.forEach(monster => {

        if (monster instanceof skeleton) {
            context.fillStyle = 'black';
        } else if (monster instanceof archer) {
            context.fillStyle = 'pink';
        } else if (monster instanceof guard) {
            context.fillStyle = 'silver';
        } else if (monster instanceof wizard) {
            context.fillStyle = 'purple';
        } else if (monster instanceof chest) {
            context.fillStyle = "rgb(128, 100, 65)";
        } else if (monster instanceof skeletonWitch) {
            context.fillStyle = "rgb(255, 0, 234)";
        } else if (monster instanceof phantomAssassin) {
            context.fillStyle = "rgb(74, 74, 74)";
        } else if (monster instanceof desertEmperor) {
            context.fillStyle = "rgb(255, 170, 0)";
        }
        context.beginPath();
        context.arc(monster.x - viewport.x, monster.y - viewport.y, monster.xSize / 2, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        if (monster instanceof boss) {
            context.fillStyle = "rgb(255, 0, 0)";
            context.beginPath();
            context.arc(monster.x - viewport.x, monster.y - viewport.y, monster.xSize / 8, 0, Math.PI * 2);
            context.closePath();
            context.fill();
        }

        // monster health
        context.fillStyle = '#ddc797';
        context.fillRect(
            monster.x - viewport.x - monster.xSize * 0.75,
            monster.y - viewport.y - monster.ySize,
            1.5 * monster.xSize,
            0.25 * monster.ySize);
        let monsterCurrentHealth = monster.hp / monster.healthMax;
        context.fillStyle = 'red';
        context.fillRect(monster.x - viewport.x - monster.xSize * 0.75,
            monster.y - viewport.y - monster.xSize,
            1.5 * monster.xSize * monsterCurrentHealth,
            0.25 * monster.ySize);
        let monsterHPShowUp = `${monster.hp}/${monster.healthMax}`

        context.font = `${0.25 * monster.xSize}px Arial`;
        context.fillStyle = 'white';
        let textWidth = context.measureText(monsterHPShowUp).width;
        context.fillText(
            monsterHPShowUp,
            monster.x - viewport.x - textWidth / 2,
            monster.y - viewport.y - monster.ySize * 0.75
        );
        let textWidth2 = context.measureText(`Lv.${monster.level}`).width;
        if (monster.level > stairLevel) {
            context.fillStyle = 'red';
        } else if (monster.level < stairLevel) {
            context.fillStyle = 'rgb(21, 255, 0)';
        }
        context.fillText(`Lv.${monster.level}`,
            monster.x - viewport.x - textWidth2 / 2,
            monster.y - viewport.y - monster.ySize * 1)
    }
    )
    monsterMove();

    bullets.forEach(bullet => {
        if (bullet instanceof arrow) {
            context.fillStyle = 'brown';
        } else if (bullet instanceof magicBall ||
            bullet instanceof cursingBall) {
            context.fillStyle = 'rgba(153, 0, 255, 0.7)';
        } else if (bullet instanceof healingBall) {
            context.fillStyle = 'rgba(125, 255, 108, 0.55)';
        } else if (bullet instanceof sandBallKS) {
            context.fillStyle = 'rgba(250, 255, 109, 0.55)';
        } else if (bullet instanceof realSandBall) {
            context.fillStyle = 'rgba(255, 255, 0, 0.7)';
        } else if (bullet instanceof fireBall) {
            context.fillStyle = 'rgba(255, 85, 0, 0.55)';
        }
        context.beginPath();
        context.arc(bullet.x - viewport.x, bullet.y - viewport.y, bullet.size / 2, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }
    )




    // healthCheck
    healthCheck();


    transfer();
    leaveThisLayer();



}

function drawCo() {
    CoLoop = window.requestAnimationFrame(drawCo);
    refresh();

    context2.clearRect(0, 0, bar.width, bar.height);
    context2.font = '24px Arial';
    context2.fillStyle = 'black';
    context2.fillText('HP', 15, 33);
    let HPshowup = `${player.hp}/${player.healthMax}`
    context2.font = '20px Arial bold';
    context2.fillStyle = 'black';
    context2.fillText(HPshowup, 230, 30);
    context2.strokeStyle = 'white';
    context2.lineWidth = 5;
    context2.strokeRect(0, 0, bar.width, bar.height);
    context2.fillStyle = '#ddc797';
    context2.fillRect(60, 10, 170, 30);
    let currentHealthBar = 170 * (player.hp / player.healthMax);
    context2.fillStyle = 'red';
    context2.fillRect(60, 10, currentHealthBar, 30);

    context2.font = '16px Arial';
    context2.fillStyle = 'black';
    context2.fillText('Attack CD: ', 320, 33);
    if (ACD === true) {
        context2.fillText(ACDCountDown + 'sec', 400, 33)
    } else {
        context2.fillStyle = 'red';
        context2.fillText('Ready!', 400, 33);
    }
    context2.font = '16px Arial';
    context2.fillStyle = 'black';
    context2.fillText('Skill CD: ', 470, 33);
    if (SCD === true) {
        context2.fillText(SCDCountDown + 'sec', 540, 33);
    } else {
        context2.fillStyle = 'red';
        context2.fillText('Ready!', 540, 33);
    }
    context2.font = '16px Arial';
    context2.fillStyle = 'black';
    context2.fillText(`Attack Point: ${player.AP}  Level: ${player.level}   exp: ${player.exp}/${player.expMax}  stair:${stairLevel}`, 610, 33);


}

function gameOver() {
    window.removeEventListener('keydown', activate, false);
    window.removeEventListener('keyup', deactivate, false);
    canvas.removeEventListener('mousedown', attackActivate, false);
    let record;
    if (player.role === 'superKnight') {
        record = `How you died? You fucking cheater, Shame on you!`
    } else {
        if (stairLevel >= 5) {
            record = "Your game has been recorded. it may be displayed on the leader board. Cheers!"

            let data = new FormData();
            data.append('score', stairLevel);
            data.append('character', player.role);

            xHTTP = new XMLHttpRequest();
            xHTTP.addEventListener('readystatechange',
                handle_response, false);
            xHTTP.open('POST', '/record', true);
            xHTTP.send(data);
        } else {
            record = `because you haven't reached at least the 5th floor, it won't be record. Keep trying!`
        }
    }
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgb(174, 0, 255)';
    context.fillRect(300, 150, 600, 250);
    context.fillStyle = 'rgb(34, 0, 187)';
    context.font = '48px Arial bold';
    context.fillText(`Game over!`, 500, 200)
    context.font = '32px Arial bold';
    context.fillText(`You've reached the floor ${stairLevel}.`, 450, 250)
    context.font = '16px Arial bold';
    context.fillText(`${record}`, 333, 350)
    window.cancelAnimationFrame(mainLoop);
    window.cancelAnimationFrame(CoLoop);
    let link = document.querySelector('#link');
    link.innerHTML = `<a href="choose_character">Start again</a>`;


}


function activate(event) {
    let key = event.key;
    if (event.key === 'w' ||
        event.key === 'a' ||
        event.key === 's' ||
        event.key === 'd' ||
        event.key === 'e' ||
        event.key === 'p'
    ) {
        event.preventDefault();
    }
    if (event.key === 'w') {
        moveUp = true;
    } else if (event.key === 'a') {
        moveLeft = true;
    } else if (event.key === 'd') {
        moveRight = true;
    } else if (event.key === 's') {
        moveDown = true;
    } else if (event.key === 'e') {
        leave = true;
    } else if (event.key === 'p') {
        pause();
    }
}

function deactivate(event) {

    if (event.key === 'w' ||
        event.key === 'a' ||
        event.key === 's' ||
        event.key === 'd' ||
        event.key === 'e'
    ) {
        event.preventDefault();
    };
    if (event.key === 'w') {
        moveUp = false;
    } else if (event.key === 'a') {
        moveLeft = false;
    } else if (event.key === 'd') {
        moveRight = false;
    } else if (event.key === 's') {
        moveDown = false;
    } else if (event.key === 'e') {
        leave = false;
    }
}

function load_assets(assets, callback) {
    let num = assets.length;
    let loaded = function () {
        console.log('loaded');
        num -= 1;
        if (num === 0) {
            callback();
        }
    }
    for (let asset of assets) {
        let element = asset.var;
        if (element instanceof HTMLImageElement) {
            console.log('img');
            element.addEventListener('load', loaded, false);
        }
        else if (element instanceof HTMLAudioElement) {
            console.log('audio');
            element.addEventListener('backgroundMusic', loaded, false);
        }
        element.src = asset.url;
    }
}

function handle_response() {
    if (xHTTP.readyState === 4
    ) {
        if (xHTTP.status === 200) {
            console.log('nice');
        }
    }
}