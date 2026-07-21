import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
const cursorCanvas = document.getElementById("cursorCanvas");
const cursorCtx = cursorCanvas.getContext("2d");

const container = document.getElementById("canvasContainer");

canvas.width = container.clientWidth;
canvas.height = container.clientHeight;

cursorCanvas.width = container.clientWidth;
cursorCanvas.height = container.clientHeight;

let isDrawing = false;

let brushColor = "#000000";
let brushSize = 5;

ctx.lineCap = "round";
ctx.lineJoin = "round";

//draw function
function draw(x, y) {

    if (!isDrawing) return;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    ctx.lineTo(x, y);
    ctx.stroke();

}

// show cursor
function drawCursor(x, y) {

    cursorCtx.clearRect(
        0,
        0,
        cursorCanvas.width,
        cursorCanvas.height
    );

    cursorCtx.beginPath();

    cursorCtx.arc(
        x,
        y,
        10,
        0,
        Math.PI * 2
    );

    cursorCtx.fillStyle = "red";
    cursorCtx.fill();

}

async function main() {

    // webcam
    const video = document.getElementById("video");

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;
    await video.play();

    // hand detector
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            },
            runningMode: "VIDEO",
            numHands: 1
        }
    );

    // GESTURES



    // frame detection for fingertip
    function detectHands() {

        const results = handLandmarker.detectForVideo(
            video,
            performance.now()
        );

        if (results.landmarks.length > 0) {

            const landmarks = results.landmarks[0];

            const index = landmarks[8];

            const x = (1 - index.x) * canvas.width;
            const y = index.y * canvas.height;

            // show cursor
            cursorCtx.clearRect(
                0,
                0,
                cursorCanvas.width,
                cursorCanvas.height
            );

            cursorCtx.beginPath();

            cursorCtx.arc(
                x,
                y,
                10,
                0,
                Math.PI * 2
            );

            cursorCtx.fillStyle = "red";
            cursorCtx.fill();

        }

        requestAnimationFrame(detectHands);
    }

    detectHands();
}

main();

canvas.addEventListener("mousedown", (event) => {

    isDrawing = true;

    ctx.beginPath();

    ctx.moveTo(event.offsetX, event.offsetY);

});

canvas.addEventListener("mousemove", (event) => {

    draw(event.offsetX, event.offsetY);

});

canvas.addEventListener("mouseup", () => {

    isDrawing = false;

});

canvas.addEventListener("mouseleave", () => {

    isDrawing = false;

});

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

});

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {

    const link = document.createElement("a");
        link.download = "testsave.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

});

const colorPicker = document.getElementById("colorPicker");

colorPicker.addEventListener("input", () => {

    brushColor = colorPicker.value;

});

const brushSlider = document.getElementById("brushSize");

brushSlider.addEventListener("input", () => {

    brushSize = brushSlider.value;

});


