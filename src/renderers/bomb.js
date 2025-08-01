let bombElement = document.getElementById("bomb")
let bombStyle = bombElement.style
let bombCircle = document.createElement("div")
bombCircle.id = "bomb-circle"
bombElement.appendChild(bombCircle)

// Set default circle size if not defined in config
if (!global.config.radar.bombCircleSize) {
    global.config.radar.bombCircleSize = 60; // default size in pixels
}
//global.config.radar.bombCircleSize = 720; // MIRAGE, NO ARMOR 500   MIRAGE ARMOR 390   760 0 dmg
// Add CSS styles for the circle
const circleStyle = document.createElement("style")
circleStyle.textContent = `
#bomb-circle {
    position: absolute;
    width: var(--bomb-circle-size);
    height: var(--bomb-circle-size);
    border: 8px dotted red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    pointer-events: none;
    opacity: 1;
    visibility: visible;

    transition: width 0.3s ease-in-out, height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

#bomb-circle.hidden {
    opacity: 0;
    visibility: hidden;
    width: 0;
    height: 0;
    transition: visibility 0.3s ease-in-out, opacity 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out;
}


`

document.head.appendChild(circleStyle)
// Add lookup tables for different maps at the top level, where lookupMirage is defined
const lookupTables = {
    mirage: [760, 662, 633, 610, 590, 572, 556, 541, 527, 513, 500, 488, 476, 464, 453, 441, 431, 420, 410, 400, 390],
    // Add other maps with their lookup values
    // Example:
    // dust2: [...],
    // inferno: [...],
    // nuke: [...],
    default: [760, 662, 633, 610, 590, 572, 556, 541, 527, 513, 500, 488, 476, 464, 453, 441, 431, 420, 410, 400, 390] // fallback to mirage values
};
const lookupMirage = [760, 662, 633, 610, 590, 572, 556, 541, 527, 513, 500, 488, 476, 464, 453, 441, 431, 420, 410, 400, 390]; //A TABLE THAT GOES FROM 0 DMG TO 100 DMG FOR PLAYER WITH ARMOR - it gives you distance
// Set the CSS variable for circle size
document.documentElement.style.setProperty('--bomb-circle-size', global.config.radar.bombCircleSize + 'px');

// Function to update circle size
function updateBombCircleSize(size) {
    global.config.radar.bombCircleSize = size;
    document.documentElement.style.setProperty('--bomb-circle-size', size + 'px');
}

/*
function calculateDamage(x) {
    return (6.1052e-7 * Math.pow(x, 3)) - 
           (0.000298608 * Math.pow(x, 2)) - 
           (0.553326 * x) + 
           325;
}


function calculateDistance(damage) {
    // Set search range (distance in units)
    let left = 0;
    let right = 1000; // Assuming maximum reasonable distance
    const epsilon = 0.1; // Acceptable error margin
    const maxIterations = 100; // Prevent infinite loops
    
    // Target damage value
    const target = damage;
    
    let iterations = 0;
    while ((right - left) > epsilon && iterations < maxIterations) {
        const mid = (left + right) / 2;
        const currentDamage = calculateDamage(mid);
        
        if (Math.abs(currentDamage - target) < epsilon) {
            return mid;
        }
        
        // Since damage decreases with distance, adjust search range accordingly
        if (currentDamage > target) {
            left = mid;
        } else {
            right = mid;
        }
        
        iterations++;
    }
    
    return (left + right) / 2;
}

*/

// Add this near the top of bomb.js where other event listeners are defined
/*socket.element.addEventListener("spectatedStatsChanged", (event) => {
    updateBombCircleBasedOnHealth();
});*/


socket.element.addEventListener("bomb", event => {
    let bomb = event.data
    global.bombStatus = bomb.state;
    console.log(global.showDeathRange);
    console.log(global.bombStatus);
    if (!(bomb.state == "planted" || bomb.state == "defusing")) {
        global.showDeathRange = false;
        bombCircle.classList.add('hidden');
    }

    if (bomb.state == "carried" || bomb.state == "exploded") {
        bombStyle.display = "none"

    }
    else {
        bombStyle.display = "block"
        bombStyle.left = global.positionToPerc(bomb.position, "x") + "%"
        bombStyle.bottom = global.positionToPerc(bomb.position, "y") + "%"

    }

    if (bomb.state == "planted" || bomb.state == "defusing") {
        /*let event = new Event("spectatedStatsChanged");*/
        if(global.showDeathRange && global.spectatedHealth !== global.previousState[0] && global.spectatedArmor !== global.previousState[1]){
            bombCircle.classList.remove('hidden');
            updateBombCircleBasedOnHealth();}
        else if (!global.showDeathRange){
            bombCircle.classList.add('hidden');

        }

        /*socket.element.dispatchEvent(event);*/
        bombElement.className = "planted"
        bombCircle.style.borderColor = "#ff0000"

    }
    else if (bomb.state == "defused") {
        bombElement.className = "defused"
        bombCircle.style.borderColor = "#00ff00"

    }
    else {
        bombElement.className = ""
        bombCircle.style.borderColor = "#ff6600"

    }
})
//global.spectatedHealth gives me hp
//global.spectatedArmor gives me armor
// Loop through damage values from 0 to 100 with step of 5
/*
console.log("i am here");
for (let damage = 0; damage <= 100; damage += 5) {
    const distance = calculateDistance(damage);
    console.log(`Damage: ${damage}, Distance: ${distance.toFixed(2)} units`);
}*/

// Update the function
function updateBombCircleBasedOnHealth() {
    // Only proceed if we have both health and armor values
    if (typeof global.spectatedHealth !== 'undefined' && typeof global.spectatedArmor !== 'undefined') {
        let circleSize;
        
        // Get current map name and remove 'de_' prefix
        const mapName = global.currentMap.replace('de_', '').toLowerCase();
        
        // Get the appropriate lookup table for the current map
        const currentLookupTable = lookupTables[mapName] || lookupTables.default;

        let localHealth = global.spectatedHealth;
        global.previousState = [localHealth, global.spectatedArmor];
        
        if (global.spectatedArmor === 0) {
            localHealth /= 2;
        }
        
        let valueLower = currentLookupTable[Math.floor((localHealth / 5.0))];
        let valueUpper = currentLookupTable[Math.ceil((localHealth / 5.0))];

        let distance = (valueLower + valueUpper) / 2;
        circleSize = distance;

        console.log(`distance is ${distance}, health was ${localHealth}, armor was ${global.spectatedArmor}, map is ${mapName}`);

        updateBombCircleSize(circleSize);
    }
}