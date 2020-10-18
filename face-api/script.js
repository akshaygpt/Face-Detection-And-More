const video = document.getElementById('video')

// GET nnets and weights
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    // faceapi.nets.ageGenderNet.loadFromUri('./models')
]).then(startVideo)

// ASSIGN webcam feed to video element src
function startVideo(){
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream, // set stream from webcam as video feed
        err => console.error(err)
    )
}

// 
video.addEventListener('play', () => {

    // BUILD a canvas on-top-of video element with same dimensions
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize)

    // CALL this function every 100ms
    setInterval(async () => {

        // DETECT face, landmarks, expressions, age/gender
        const detections = await faceapi.detectAllFaces(
            video, 
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        // .withAgeAndGender()

        // RESIZE on each call
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // CLEAR canvas on each call
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        // DRAW on canvas 
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    }, 100)
})