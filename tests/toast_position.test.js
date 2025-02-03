const { calculateToastPosition } = require("../shared");

// Test cases
const tests = [
    {
        name: "Basic positioning - enough space below and right",
        input: {
            position: { x: 100, y: 100 },
            windowDims: { width: 1000, height: 800 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 105, y: 105 }  // OFFSET_X and OFFSET_Y added
    },
    {
        name: "Position with scroll - enough space",
        input: {
            position: { x: 100, y: 100 },  // Already in viewport coordinates
            windowDims: { width: 1000, height: 800 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 105, y: 105 }  // (100 + 5, 100 + 5)
    },
    {
        name: "Near bottom - should position above",
        input: {
            position: { x: 100, y: 750 },
            windowDims: { width: 1000, height: 800 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 105, y: 685 }  // Above cursor (750 - 60 - 5)
    },
    {
        name: "Near right edge - should position left",
        input: {
            position: { x: 900, y: 100 },
            windowDims: { width: 1000, height: 800 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 495, y: 105 }  // Left of cursor (900 - 400 - 5)
    },
    {
        name: "With scroll - near bottom of viewport",
        input: {
            position: { x: 100, y: 600 },  // Already in viewport coordinates
            windowDims: { width: 1000, height: 800 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 105, y: 605 }  // Below cursor (600 + 5) since there's enough space
    },
    {
        name: "With scroll - cursor in viewport",
        input: {
            position: { x: 201, y: 129 },  // Already in viewport coordinates
            windowDims: { width: 1099, height: 802 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 206, y: 134 }  // Keep x near cursor, y adjusted for viewport
    },
    {
        name: "With scroll - cursor below viewport",
        input: {
            position: { x: 390, y: 646 },  // Already in viewport coordinates
            windowDims: { width: 1099, height: 802 },
            toastDims: { width: 400, height: 75 }
        },
        expected: { x: 395, y: 651 }  // Keep x near cursor, y below since there's space (646 + 5)
    },
    {
        name: "With scroll - cursor above viewport",
        input: {
            position: { x: 412, y: -100 },  // Above viewport
            windowDims: { width: 1099, height: 802 },
            toastDims: { width: 400, height: 75 }
        },
        expected: { x: 417, y: 5 }  // Keep x near cursor, y at top
    },
    {
        name: "With large scroll - cursor far above viewport",
        input: {
            position: { x: 176, y: -200 },  // Far above viewport
            windowDims: { width: 1040, height: 1118 },
            toastDims: { width: 400, height: 60 }
        },
        expected: { x: 181, y: 5 }  // Keep x near cursor, y at top
    },
    {
        name: "With large scroll - cursor far below viewport",
        input: {
            position: { x: 249, y: 1200 },  // Far below viewport
            windowDims: { width: 1040, height: 1118 },
            toastDims: { width: 400, height: 75 }
        },
        expected: { x: 254, y: 1038 }  // Keep x near cursor, y at bottom (1118 - 75 - 5)
    }
];

describe('Toast Position Tests', () => {
    tests.forEach(test => {
        it(test.name, () => {
            const result = calculateToastPosition(
                test.input.position,
                test.input.windowDims,
                test.input.toastDims
            );

            if (result.x !== test.expected.x || result.y !== test.expected.y) {
                throw new Error(`
                    Expected: x=${test.expected.x}, y=${test.expected.y}
                    Got: x=${result.x}, y=${result.y}
                `);
            }
        });
    });
}); 