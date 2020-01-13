//-------------------chargement--------------------------

var text = ["Chargement", "Chargement.", "Chargement..", "Chargement..."];
var num = 1;

var chargement = window.setInterval(function () {
  document.getElementById("chargement").innerHTML = text[num % 4];
  num++;
}, 300);

//--------------------get model + enable button-------------------------

Promise.all([
  faceapi.loadSsdMobilenetv1Model('./models'),
  faceapi.loadTinyFaceDetectorModel('./models'),
  faceapi.loadMtcnnModel('./models'),
  faceapi.loadFaceLandmarkModel('./models'),
  faceapi.loadFaceLandmarkTinyModel('./models'),
  faceapi.loadFaceRecognitionModel('./models'),
  faceapi.loadFaceExpressionModel('./models')
]).then(start);


async function start() {
  console.log("start");
  clearInterval(chargement);
  document.getElementById("chargement").style.display = 'none';
  document.getElementById('imageUpload').disabled = false;
}

//---------------------------------------------



imageUpload.addEventListener("change", addImage);


function addImage() {
  var img = new Image();
  img.onload = draw;
  img.src = URL.createObjectURL(document.querySelector('input[type=file]').files[0]);
  getFace(img);
}

function draw() {
  var canvas = document.getElementById('myCanvas');

  var hauteur = window.innerHeight;
  var longueur = window.innerWidth;
  var moy = this.width / this.height;

  if (this.width > longueur || this.height > hauteur) {
    canvas.width = (longueur / 100) * 80;
    canvas.height = this.height / moy;
  } else {
    canvas.width = this.width;
    canvas.height = this.height;
  }
  var ctx = canvas.getContext('2d');
  ctx.drawImage(this, 0, 0);
}


async function getFace(input) {

  var emotionCheck = document.getElementById("emotion").checked;
  var faceCheck = document.getElementById("face").checked;


  var canvas = document.getElementById('myCanvas');

  if(emotionCheck === false && faceCheck === false)
  {
    console.log("oups");
    return;
  }

  if (emotionCheck === true) {
    const detections = await faceapi.detectAllFaces(input).withFaceExpressions();

    let displaySize = {
      width: input.width,
      height: input.height
    }

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    resizedDetections.forEach((result, i) => {
      const box = resizedDetections[i].detection.box

      let max = null;
      let res = null;

      var keys = Object.keys(result.expressions);
      keys.forEach(function (key) {
        if (max === null) {
          max = result.expressions[key];
          res = key;
        } else {
          if (max < result.expressions[key]) {
            max = result.expressions[key];
            res = key;
          }
        }
      });


      let color = "blue";

      if (res === "happy") {
        color = "red"
      }

      const drawBox = new faceapi.draw.DrawBox(box, {
        label: res.toString(),
        lineWidth: 1,
        boxColor: color
      })
      drawBox.draw(canvas)
    })

  }



  if (faceCheck === true) {
    const fullFaceDescription = await faceapi.detectAllFaces(input).withFaceLandmarks()

    console.log(fullFaceDescription);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "#33FF3C";

    (fullFaceDescription).forEach(element =>
      (element.landmarks.positions).forEach(elem =>
        ctx.fillRect(elem.x, elem.y, 3, 3)
      )
    )
  }

}