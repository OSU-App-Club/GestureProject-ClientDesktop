import robot from 'robotjs';

// Get the size of the primary screen
const { width, height } = robot.getScreenSize();

const mouseSpeed = 0.1; // lower is faster

async function moveMouse(
    x: number,
    y: number,
    serverScreenWidth: number,
    serverScreenLength: number,
    value: any
) {
    // Calculate the new mouse position
    const newX = Math.round((x / serverScreenWidth) * width);
    const newY = Math.round((y / serverScreenLength) * height);

    // Move the mouse
    robot.moveMouseSmooth(newX, newY, mouseSpeed);

    // left click down if distanceFromScreen <= 0, otherwise left click up
    const { distanceFromScreen } = value;
    if (distanceFromScreen <= 0) {
        robot.mouseToggle('down', 'left');
    } else {
        robot.mouseToggle('up', 'left');
    }
}

export default moveMouse;
