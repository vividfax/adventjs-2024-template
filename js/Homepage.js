class Homepage {

    constructor() {

        this.palette = {
            white: color("#FFFFFF"),
            light: color("#FFEFD2"),
            gold: color("#C9A156"),
            mid: color("#81C3AF"),
            dark: color("#578C7C"),
            black: color("#315358"),
        };

        this.windowFrameStrokeWeight = 4;

        this.doorSize = 60;
        this.doorSpacingX = 37 + 67.5;
        this.doorSpacingY = 47 + 67.5;

        this.values = {
            palette: this.palette,
            doorSize: this.doorSize,
            doorSpacingX: this.doorSpacingX,
            doorSpacingY: this.doorSpacingY,
            frameWeight: this.windowFrameStrokeWeight,
        };

        this.doorOrder = [
            1, 9, 21, 15, 4,
            16, 13, 23, 8, 18,
            20, 7, 22, 3, 12,
            24, 6, 2, 11, 14,
            10, 19, 25, 17, 5,
            26, 27, 28, 29, 30,
        ];
        this.doorNumberAlign = [
            1, 3, 1, 3, 1,
            0, 2, 1, 0, 2,
            3, 2, 3, 3, 2,
            0, 1, 0, 2, 0,
            2, 3, 0, 0, 3,
            0, 0, 0, 0, 0,
        ];
        this.doors = [];

        for (let i = 0; i < this.doorOrder.length; i++) {

            this.doors.push(new Door(i%5, int(i/5), i, this.doorOrder[i], this.doorNumberAlign[i], this.values));
        }

        this.originX = 0;
        this.originY = 0;
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1;
        // this.zoom = 0.8; // logo zoom level
        this.minZoom = 1;
        this.maxZoom = width/this.doorSize;

        this.visible = true;
        this.currentDoor = -1;
        this.enteringDoor = false;
        this.exitingDoor = false;
        this.doorOpen = false;

        this.doorDateAlpha = 1;

        this.openAmount = 0;

        this.threeD = createGraphics(width, height, WEBGL);
        this.twoDWindow = this.create2DWindow();
        this.twoDFrontDoor = this.create2DFrontDoor();
        this.twoDPresents = [];
        for (let i = 0; i < 5; i++) this.twoDPresents.push(this.create2DPresent(i));
        this.treeMask = this.createTreeMask();
        this.treeTinselA = this.createTreeTinsel();
        this.treeTinselB = this.createTreeTinsel();
        this.snow = this.setupSnow();

        this.defaultOpenOnX(); // comment out outside of template
    }

    defaultOpenOnX() {

        this.currentDoor = this.doors[0];
        this.currentDoor.hovering = 1;
        this.currentDoor.openAmount = 1;

        this.cameraX = this.currentDoor.xPos;
        this.cameraY = this.currentDoor.yPos;
        this.doorDateAlpha = 0;

        this.zoom = this.maxZoom;
        this.doorOpen = true;
        this.openAmount = 1;
        this.enteringDoor = false;
        this.visible = false;
        backButton.style("display", "inline");

        today = 0;
        updateInfo(days[0]);
    }

    create2DWindow() {

        let twoD = createGraphics(width, height);
        let weight = this.windowFrameStrokeWeight*this.maxZoom;

        twoD.strokeWeight(weight);
        twoD.stroke(this.palette.gold);
        twoD.fill(this.palette.light);
        twoD.rectMode(CENTER);
        twoD.rect(width/4*3+weight/4, height/2, width/2-weight/2, height-weight);
        twoD.line(width/2, height/2, width, height/2);

        return twoD;
    }

    create2DFrontDoor() {

        let h = height*2;
        let twoD = createGraphics(width, h);
        let weight = this.windowFrameStrokeWeight*this.maxZoom;

        twoD.noStroke();
        twoD.background(this.palette.gold);
        twoD.strokeWeight(weight);
        twoD.stroke(this.palette.black);
        twoD.line(width, 0, width, h);
        twoD.line(width-7*this.maxZoom, h/2-4.5*this.maxZoom, width-7*this.maxZoom, h/2+4.5*this.maxZoom);

        return twoD;
    }

    create2DPresent(i) {

        let palette;

        if (i == 0) palette = [this.palette.dark, this.palette.light];
        else if (i == 1) palette = [this.palette.gold, this.palette.black];
        else if (i == 2) palette = [this.palette.mid, this.palette.black];
        else if (i == 3) palette = [this.palette.dark, this.palette.gold];
        else if (i == 4) palette = [this.palette.gold, this.palette.light];

        let h = height*2;
        let twoD = createGraphics(width, h);
        let weight = 6*17.5;

        twoD.noStroke();
        twoD.background(palette[0]);
        twoD.strokeWeight(weight);
        twoD.stroke(palette[1]);
        twoD.line(width, 0, width, h);

        return twoD;
    }

    createTreeMask() {

        let layer = createGraphics(160*this.maxZoom, 295*this.maxZoom);

        layer.push();
        layer.translate(160*this.maxZoom/2, 0);
        for (let i = 2; i < 6; i++) {
            let w2 = 32*i*this.maxZoom;
            let h2 = 35*i*this.maxZoom;
            layer.triangle(-w2/2, h2, 0, 0, w2/2, h2);
            layer.translate(0, 10*i*this.maxZoom);
        }

        layer.pop();

        return layer;
    }

    createTreeTinsel() {

        let layer = createGraphics(160*this.maxZoom, 295*this.maxZoom);
        layer.translate(layer.width/2, 0);

        layer.background(this.palette.black);
        layer.noFill();

        let colour1 = this.palette.mid;
        let colour2 = this.palette.dark;

        if (daysToReveal < 3) colour2 = color(0, 0);
        if (daysToReveal < 7) colour1 = color(0, 0);

        let num = 8;
        for (let i = num-1; i >= 1; i--) {

            let weight = i%2 == 1 ? 160 : 80;
            layer.strokeWeight(weight);
            let colour = i%2 == 1 ? colour1 : colour2;
            layer.stroke(colour);
            layer.ellipse(random(-layer.width/14*i, layer.width/14*i), 0, layer.height*2/num*(i+0.4));
        }

        let maskedTinsel = layer.get();
        maskedTinsel.mask(this.treeMask);
        layer.clear();
        layer.image(maskedTinsel, -layer.width/2, 0, layer.width, layer.height);

        layer.noStroke();

        colour1 = this.palette.light;
        colour2 = this.palette.gold;

        if (daysToReveal < 10) colour2 = color(0, 0);
        if (daysToReveal < 15) colour1 = color(0, 0);

        for (let i = 1; i < 10; i++) {
            let n = int(i*0.6+0.5);
            let w = -130*n;
            let x = w;
            let rand = random([0, 1]);
            let rand2 = random([0, 1]);
            for (let j = 0; j <= n; j++) {
                layer.push();
                layer.translate(x, layer.height/10*i-10);
                let offset = 45;
                layer.translate(random(-offset, offset), random(-offset, offset));
                let colour = (j+rand)%2 == 0 ? colour1 : colour2;
                layer.fill(colour);
                layer.ellipse(0, 0, 130);
                x -= (w*2)/n;
                layer.pop();
            }
        }

        return layer;
    }

    setupSnow() {

        let snow = [];

        for (let i = 0; i < 600; i++) {
            snow.push(new this.Snow(1, this.palette.white));
        }

        return snow;
    }

    update() {

        if (this.enteringDoor) this.enterDoor();
        else if (this.exitingDoor) this.exitDoor();

        if (this.enteringDoor || this.exitingDoor) return;

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].update();
        }
    }

    checkDoorClick() {

        if (this.enteringDoor || this.exitingDoor) return;

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].checkClick();
        }
    }

    enterDoor() {

        let door = this.currentDoor;
        let d = deltaTime/17;

        // if (d > 10) return;

        if (this.doorDateAlpha > 0) {

            this.cameraX = lerp(this.cameraX, door.xPos, 0.1*d);
            this.cameraY = lerp(this.cameraY, door.yPos, 0.1*d);
            this.doorDateAlpha = lerp(this.doorDateAlpha, 0, 0.1*d);

            if (this.doorDateAlpha < 0.01) {
                this.cameraX = door.xPos;
                this.cameraY = door.yPos;
                this.doorDateAlpha = 0;
            }

        } else if (this.doorDateAlpha == 0 && this.maxZoom - this.zoom > 0) {

            this.zoom = lerp(this.zoom, this.maxZoom, 0.1*d);
            if (this.maxZoom - this.zoom < 0.01) {

                this.zoom = this.maxZoom;

                changeDay(door.date-1);
                this.doorOpen = true;
                updateInfo(days[door.date-1]);
            }

        } else if (this.maxZoom == this.zoom) {

            if (!this.skippedFrame) {
                this.skippedFrame = true;
                return;
            }

            this.openAmount = lerp(this.openAmount, 1, 0.1*d);
            if (this.openAmount > 0.99) {
                this.openAmount = 1;
                this.enteringDoor = false;
                this.visible = false;
                backButton.style("display", "inline");
            }
        }
    }

    exitDoor() {

        let door = this.currentDoor;
        let d = deltaTime/17;

        if (this.openAmount != 0) {

            this.openAmount = lerp(this.openAmount, 0, 0.1*d);
            if (this.openAmount < 0.001) {
                this.openAmount = 0;
                this.doorOpen = false;
                cleanupOnExit();
            }

        } else if (this.openAmount == 0 && this.zoom-this.minZoom > 0) {

            this.zoom = lerp(this.zoom, this.minZoom, 0.1*d);
            if (this.zoom - this.minZoom < 0.01) this.zoom = this.minZoom;

        } else if (this.zoom == this.minZoom) {

            this.cameraX = lerp(this.cameraX, this.originX, 0.1*d);
            this.cameraY = lerp(this.cameraY, this.originY, 0.1*d);
            this.doorDateAlpha = lerp(this.doorDateAlpha, 1, 0.1*d);

            if (this.doorDateAlpha > 0.999) {

                this.cameraX = this.originX;
                this.cameraY = this.originY;
                this.doorDateAlpha = 1;

                door.clicked = false;
                this.exitingDoor = false;
                this.currentDoor = -1;
            }
        }
    }

    display() {

        push();

        translate(width/2, height/2);
        translate(-this.cameraX*homepage.zoom, -this.cameraY*homepage.zoom);
        if (this.zoom != this.maxZoom) this.displayHouse();

        if (this.openAmount == 0) {
            for (let i = 0; i < this.doors.length; i++) {
                this.doors[i].display();
            }
        }

        this.displayFairyLights();
        this.displayWreath();

        pop();

        if (this.openAmount > 0) this.display3DWindows(this.openAmount);
    }

    displayHouse() {

        let zoom = this.zoom;

        push();
        rectMode(CENTER);
        noStroke();

        background(this.palette.gold);
        this.displaySkyStar(zoom);
        this.displayReindeer(zoom);
        this.displaySnow();

        if (daysToReveal < 9) fill(this.palette.mid);
        else fill(this.palette.white);
        rect(0, 316*zoom+450*zoom, width*zoom*2, 68*zoom+1000*zoom);

        let w1 = 442/2*zoom;
        let w2 = 590/2*zoom;
        let h1 = -214*zoom;
        let h2 = -114*zoom + h1;
        fill(this.palette.black);
        quad(-w2, h1, w2, h1, w1, h2, -w1, h2);
        rect(0, 304*zoom, 594*zoom, 12*zoom);
        w1 = 90/2*zoom;
        w2 = 110/2*zoom * 20;
        h1 = 308*zoom;
        h2 = 42*zoom + h1 * 10;
        quad(-w1, h1, w1, h1, w2, h2, -w2, h2);

        fill(this.palette.dark);
        rect(0, 48*this.zoom, 580*this.zoom, 500*this.zoom);

        fill(this.palette.mid);
        rect(0, -208*zoom, 602*zoom, 12*zoom);
        rect(0, -332*zoom, 442*zoom, 8*zoom);

        for (let i = 0; i < 33; i++) {
            let w = 15+i%3*5;
            rect((-293+w/2)*zoom, (-192 + i*15)*zoom, w*zoom, 10*zoom);
            w = 15+(i+1)%3*5;
            rect((293-w/2)*zoom, (-192 + i*15)*zoom, w*zoom, 10*zoom);
        }

        pop();

        this.displayTrees();
        this.displaySnowman(zoom);
    }

    displaySkyStar(zoom) {

        if (daysToReveal < 14) return;

        push();

        imageMode(CENTER);

        // let s = sin(frameCount*0.05)*3;

        image(assets.homepageStar, 300*zoom, -283*zoom, 25*zoom, 30*zoom);
        pop();
    }

    displayReindeer(zoom) {

        if (daysToReveal < 24) return;

        push();

        imageMode(CENTER);
        angleMode(DEGREES);

        let offset = 600*zoom;

        translate(0, offset);
        rotate(90);
        rotate(-frameCount/3);
        image(assets.homepageReindeer, 0, -310*zoom - offset, 166*zoom, 42*zoom);

        pop();
    }

    displaySnow() {

        push();

        let snowPercent = (daysToReveal-1)/25;
        snowPercent = constrain(snowPercent, 0, 1);

        for (let i = 0; i < this.snow.length*snowPercent; i++) {
            this.snow[i].display(this.zoom);
        }

        pop();
    }

    displayTrees() {

        let zoom = this.zoom;

        let x = 317*zoom;
        let y = 68*zoom;

        push();

        translate(x, y);
        this.displayTree(zoom, this.treeTinselA);

        translate(-x*2, 0);
        this.displayTree(zoom, this.treeTinselB);

        pop();
    }

    displayTree(zoom, tinselLayer) {

        rectMode(CENTER);
        noStroke();

        this.displayTreeBase(zoom);
        image(tinselLayer, -160/2*zoom, 0, 160*zoom, 295*zoom);
        this.displayStars(zoom);
    }

    displayTreeBase(zoom) {

        let h = 267*zoom;

        fill(this.palette.black);
        rect(0, h, 24*zoom, 40*zoom);

        // push();

        // for (let i = 2; i < 6; i++) {
        //     let w2 = 32*i*zoom;
        //     let h2 = 35*i*zoom;
        //     triangle(-w2/2, h2, 0, 0, w2/2, h2);
        //     translate(0, 10*i*zoom);
        // }

        // pop();
    }

    displayStars(zoom) {

        if (daysToReveal < 19) return;

        push();
        translate(0, 3*zoom);
        angleMode(DEGREES);
        rotate(-90);
        angleMode(RADIANS);

        fill(this.palette.white);
        this.displayStar(0, 0, 8*zoom, 5);

        // for (let i = 0; i < 7; i++) {

        //     let colour = lerpColor(this.palette.white, this.palette.gold, i/6)
        //     fill(colour);
        //     this.displayStar(0, 0, 7-i*0.7*zoom, 5);
        // }
        pop();
    }

    displayStar(x, y, radius, npoints) {
        let angle = TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
          let sx = x + cos(a) * radius*2;
          let sy = y + sin(a) * radius*2;
          vertex(sx, sy);
          sx = x + cos(a + halfAngle) * radius;
          sy = y + sin(a + halfAngle) * radius;
          vertex(sx, sy);
        }
        endShape(CLOSE);
    }

    displaySnowman(zoom) {

        push();
        translate(-160*zoom, 273*zoom);
        noStroke();
        fill(this.palette.dark);
        let weight = 3*zoom;

        for (let i = 0; i < 2; i++) {

            if (i > 0) fill(this.palette.white);
            if (daysToReveal >= 20) ellipse(0, 0, 30*zoom-i*weight);
            if (daysToReveal >= 17) ellipse(0, 23*zoom, 38*zoom-i*weight);
            if (daysToReveal >= 12) ellipse(0, 47*zoom, 45*zoom-i*weight);
        }

        if (daysToReveal >= 23) {

            fill(this.palette.black);
            translate(2*zoom, 5*zoom);

            ellipse(-6*zoom, -6*zoom, 3.5*zoom);
            ellipse(6*zoom, -6*zoom, 3.5*zoom);

            for (let i = -2; i <= 2; i++) {
                ellipse(i*2*zoom, cos(i)*1.5*zoom, 2*zoom);
            }

            let w = 3*zoom;
            let h = 7*zoom;
            fill(this.palette.gold);
            translate(0, -4*zoom);
            rotate(5);
            ellipse(0, 0, w);
            triangle(-w/2, 0, w/2, 0, 0, h);
        }

        pop();
    }

    displayFairyLights() {

        let zoom = this.zoom;

        push();
        translate(0, -195*zoom);
        noStroke();

        let w = 280*zoom;
        let start = 4;

        if (daysToReveal >= 22) start = -1;
        else if (daysToReveal >= 18) start = 0;
        else if (daysToReveal >= 13) start = 1;
        else if (daysToReveal >= 8) start = 2;
        else if (daysToReveal >= 5) start = 3;

        for (let i = start; i < 4; i++) {
            let yOffset = 0;
            if (i == 0) w = 290*zoom;
            else if (i == -1) {
                w = 220*zoom;
                yOffset = -12;
            }
            else w = 250*zoom;
            let count = i%2 == 1 ? 1 : 0;
            for (let j = -w-1; j <= w+1; j+=10*zoom) {

                // let cosW = (i == 0 || i == -1) ? 5/zoom : 5/zoom;
                let cosW = 5/zoom;
                // let colourOffset = (int(i+(frameCount*0.01)))%2 == 0; // animate
                // let colourOffset = i%2 == 0;
                // let colourOffset = 1;

                let colour = count%2 == 0 ? this.palette.light : this.palette.gold;
                fill(colour);
                ellipse(j, (cos(j*cosW)*5 + i*116.5 + yOffset)*zoom, 6*zoom);

                count++;
            }
        }
        pop();
    }

    displayWreath() {

        if (daysToReveal < 25) return;

        let zoom = this.zoom;

        let startingColours = [this.palette.black, this.palette.mid, this.palette.light];
        let colours = [];

        for (let i = 0; i < 3; i++) {
            let col = color(0);
            col.setRed(red(startingColours[i]));
            col.setGreen(green(startingColours[i]));
            col.setBlue(blue(startingColours[i]));
            if (today+1 == 25) col.setAlpha(this.doorDateAlpha*255);
            colours.push(col);
        }

        push();
        translate(0, 230*zoom);

        noFill();
        stroke(colours[0]);
        strokeWeight(13*zoom);
        ellipse(0, 0, 22*zoom);

        noStroke();

        for (let i = 0; i < 18; i++) {

            push();
            rotate(360/18*i);
            let colour = i%3 == 0 ? colours[1] : colours[2];
            fill(colour);
            let offset = i%2 == 0 ? 10 : 16;
            translate(0, offset*zoom);
            ellipse(0, 0, 4*zoom);
            pop();
        }

        pop();
    }

    display3DWindows(openAmount) {

        let source = this.twoDWindow;
        if (today+1 > 25) source = this.twoDPresents[today-25];
        else if (today+1 == 25) source = this.twoDFrontDoor;

        angleMode(DEGREES);
        imageMode(CENTER);

        this.threeD.push();
        this.threeD.angleMode(DEGREES);
        this.threeD.clear();
        this.threeD.noStroke();
        this.threeD.texture(source);
        this.threeD.rotateY(openAmount*90);
        if (today+1 == 25) this.threeD.plane(width, height*2);
        else this.threeD.plane(width, height);
        this.threeD.pop();

        push();
        translate(width/2, height/2);
        image(this.threeD, -width/2, 0);
        translate(width/2, 0);
        rotate(180);
        image(this.threeD, 0, 0);
        pop();
    }

    Snow = class {

        constructor(zoom, colour) {

            this.padding = 250;
            this.x = random(-this.padding, width+this.padding);
            this.y = random(-this.padding, height);
            this.radius = random(3, 6)*zoom;
            this.colour = colour;
        }

        display(zoom) {

            this.x += random(-0.5, 1);
            this.y += random(0.5, 1.5);

            if (this.x > width+this.padding) this.x = -this.padding;
            if (this.x < -this.padding) this.x = width+this.padding;
            if (this.y > height) this.y = -this.padding;

            noStroke();
            fill(this.colour);
            ellipse((this.x-width/2)*zoom, (this.y-height/2)*zoom, this.radius);
        }
    }
}