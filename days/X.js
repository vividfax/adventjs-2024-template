// Made by Firstname Lastname

function dayXPreload() {

}

class DayX extends Day {

    constructor () {

        super();
        this.loop = true; // Set to true or false

        this.controls = ""; // Write any controls for interactivity if needed or leave blank
        this.credits = "Made by Firstname Lastname";

        // Define variables here. Runs once during the sketch holder setup
    }

    prerun() {

        // Initialise/reset variables here. Runs once, every time your day is viewed
    }

    update() {

        // Update and draw stuff here. Runs continuously (or only once if this.loop = false), while your day is being viewed. Feel free to delete the example contents below

        push();
        translate(width/2, height/2);
        background(100);
        ellipse(sin(frameCount*0.05)*50, 0, 30);
        pop();
    }

    // Below are optional functions for interactivity

    mousePressed() {

    }

    mouseReleased() {

    }

    keyPressed() {

    }

    keyReleased() {

    }

    // Below is an example basic setup for a nested class. This can be renamed

    HelperClass = class {

        constructor() {

        }
    }
}