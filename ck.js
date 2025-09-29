/**
 * Example of setTimeout and setInterval in JavaScript
 */

// setTimeout: Executes a function once after a delay (in milliseconds)
setTimeout(() => {
    console.log('This message appears after 2 seconds');
}, 2000);

// setInterval: Executes a function repeatedly at specified intervals (in milliseconds)
const intervalId = setInterval(() => {
    console.log('This message appears every 2W second');
}, 2000);

// Stop the interval after 5 seconds
// setTimeout(() => {
//     clearInterval(intervalId);
//     console.log('Interval stopped');
// }, 5000);