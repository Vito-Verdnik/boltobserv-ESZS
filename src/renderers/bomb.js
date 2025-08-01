let bombElement = document.getElementById("bomb")
let bombStyle = bombElement.style
let bombCircle = document.createElement("div")
bombCircle.id = "bomb-circle"
bombElement.appendChild(bombCircle)

// Set default circle size if not defined in config
if (!global.config.radar.bombCircleSize) {
    global.config.radar.bombCircleSize = 60; // default size in pixels
}
global.config.radar.bombCircleSize = 570; // MIRAGE, NO ARMOR 500   MIRAGE ARMOR 390   760 0 dmg
// Add CSS styles for the circle
const circleStyle = document.createElement("style")
circleStyle.textContent = `
#bomb-circle {
    position: absolute;
    width: var(--bomb-circle-size);
    height: var(--bomb-circle-size);
    border: 2px solid red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    pointer-events: none;



}

@keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    50% { transform: translate(-50%, -50%) scale(0.78); opacity: 0.4; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
}
`
document.head.appendChild(circleStyle)

// Set the CSS variable for circle size
document.documentElement.style.setProperty('--bomb-circle-size', global.config.radar.bombCircleSize + 'px');

// Function to update circle size
function updateBombCircleSize(size) {
    global.config.radar.bombCircleSize = size;
    document.documentElement.style.setProperty('--bomb-circle-size', size + 'px');
}

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
console.log(calculateDamage(570));
console.log(calculateDistance(25));
console.log(calculateDistance(0));
console.log(calculateDistance(50));
console.log(calculateDistance(100));
console.log(calculateDistance(325));
socket.element.addEventListener("bomb", event => {
    let bomb = event.data

    if (bomb.state == "carried" || bomb.state == "exploded") {
        bombStyle.display = "none"
    }
    else {
        bombStyle.display = "block"
        bombStyle.left = global.positionToPerc(bomb.position, "x") + "%"
        bombStyle.bottom = global.positionToPerc(bomb.position, "y") + "%"
    }

    if (bomb.state == "planted" || bomb.state == "defusing") {
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