import Sketch  from "react-p5";
import * as ms from '@magenta/sketch';
import React, {useRef, useImperativeHandle, forwardRef} from "react";
import './SketchPad.css'
import {p5RefGlobal, sketchObj} from './App.js'
import { uploadImageToServer } from "./util.js";

// global setting
const BASE_URL =
      'https://storage.googleapis.com/quickdraw-models/sketchRNN/models/';
const availableModels = [
    'bird',
    'ant',
    'ambulance',
    'angel',
    'alarm_clock',
    'antyoga',
    'backpack',
    'barn',
    'basket',
    'bear',
    'bee',
    'beeflower',
    'bicycle',
    'book',
    'brain',
    'bridge',
    'bulldozer',
    'bus',
    'butterfly',
    'cactus',
    'calendar',
    'castle',
    'cat',
    'catbus',
    'catpig',
    'chair',
    'couch',
    'crab',
    'crabchair',
    'crabrabbitfacepig',
    'cruise_ship',
    'diving_board',
    'dog',
    'dogbunny',
    'dolphin',
    'duck',
    'elephant',
    'elephantpig',
    'everything',
    'eye',
    'face',
    'fan',
    'fire_hydrant',
    'firetruck',
    'flamingo',
    'flower',
    'floweryoga',
    'frog',
    'frogsofa',
    'garden',
    'hand',
    'hedgeberry',
    'hedgehog',
    'helicopter',
    'kangaroo',
    'key',
    'lantern',
    'lighthouse',
    'lion',
    'lionsheep',
    'lobster',
    'map',
    'mermaid',
    'monapassport',
    'monkey',
    'mosquito',
    'octopus',
    'owl',
    'paintbrush',
    'palm_tree',
    'parrot',
    'passport',
    'peas',
    'penguin',
    'pig',
    'pigsheep',
    'pineapple',
    'pool',
    'postcard',
    'power_outlet',
    'rabbit',
    'rabbitturtle',
    'radio',
    'radioface',
    'rain',
    'rhinoceros',
    'rifle',
    'roller_coaster',
    'sandwich',
    'scorpion',
    'sea_turtle',
    'sheep',
    'skull',
    'snail',
    'snowflake',
    'speedboat',
    'spider',
    'squirrel',
    'steak',
    'stove',
    'strawberry',
    'swan',
    'swing_set',
    'the_mona_lisa',
    'tiger',
    'toothbrush',
    'toothpaste',
    'tractor',
    'trombone',
    'truck',
    'whale',
    'windmill',
    'yoga',
    'yogabicycle',
];

const COLORS = [
    { name: 'black', hex: '#000000' },
    { name: 'red', hex: '#f44336' },
    { name: 'pink', hex: '#E91E63' },
    { name: 'purple', hex: '#9C27B0' },
    { name: 'deeppurple', hex: '#673AB7' },
    { name: 'indigo', hex: '#3F51B5' },
    { name: 'blue', hex: '#2196F3' },
    { name: 'cyan', hex: '#00BCD4' },
    { name: 'teal', hex: '#009688' },
    { name: 'green', hex: '#4CAF50' },
    { name: 'lightgreen', hex: '#8BC34A' },
    { name: 'lime', hex: '#CDDC39' },
    { name: 'yellow', hex: '#FFEB3B' },
    { name: 'amber', hex: '#FFC107' },
    { name: 'orange', hex: '#FF9800' },
    { name: 'deeporange', hex: '#FF5722' },
    { name: 'brown', hex: '#795548' },
    { name: 'grey', hex: '#9E9E9E' },
  ];

let model;

// Model
let modelState;
const temperature = 0.1; // Very low so that we draw very well.
let modelLoaded = false;
let modelIsActive = false;

// Model pen state.
let dx, dy;
let x, y;
let startX, startY; // Keep track of the first point of the last raw line.
let pen = [0, 0, 0]; // Model pen state, [pen_down, pen_up, pen_end].
let previousPen = [1, 0, 0]; // Previous model pen state.
const PEN = { DOWN: 0, UP: 1, END: 2 };
const epsilon = 2.0; // to ignore data from user's pen staying in one spot.
let strokes = [];

// Human drawing.
let currentRawLine = [];
let userPen = 0; // above = 0 or below = 1 the paper.
let previousUserPen = 0;
let currentColor = 'black';

// Keep track of everyone's last attempts to that we can reverse them.
let lastHumanStroke; // encode the human's drawing as a sequence of [dx, dy, penState] strokes
let lastHumanDrawing; // the actual sequence of lines that the human drew, so we can replay them.
let lastModelDrawing = []; // the actual sequence of lines that the model drew, so that we can erase them.

// Don't record mouse events when the splash is open.
let splashIsOpen = false;

let img;


// SketchPad component
function dataURLToBlob(dataURL) {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

export default forwardRef(function SketchPad({ visiable }, ref) {
    const p5Ref = useRef(null);

    function isInBounds() {
      return p5RefGlobal._p5Ref.mouseX >= 0 && p5RefGlobal._p5Ref.mouseY >= 0 && p5RefGlobal._p5Ref.mouseX < p5RefGlobal._p5Ref.width && p5RefGlobal._p5Ref.mouseY < p5RefGlobal._p5Ref.height;
    }

    useImperativeHandle(ref, () => ({
      saveSketchPad: async (saveImgPath) => {
        console.log('save iamge'+saveImgPath);
        // p5RefGlobal._p5Ref.saveCanvas(saveImgPath, 'png');
        const imageDataUrl = p5RefGlobal._p5Ref.canvas.toDataURL('image/png');
        const blob = dataURLToBlob(imageDataUrl);
        await uploadImageToServer(blob, saveImgPath);
      },
    }));

    // helper function

    function retryMagic(p) {
      console.log('retry magic')
      p5RefGlobal._p5Ref.stroke('white');
      // p5RefGlobal._p5Ref.stroke(255,255,255,0);
      p5RefGlobal._p5Ref.strokeWeight(3);

      // Undo the previous line the model drew.
      for (let i = 0; i < lastModelDrawing.length; i++) {
        p5RefGlobal._p5Ref.line(...lastModelDrawing[i]);
      }

      // Undo the previous human drawn.
      for (let i = 0; i < lastHumanDrawing.length; i++) {
        p5RefGlobal._p5Ref.line(...lastHumanDrawing[i]);
      }

      p5RefGlobal._p5Ref.strokeWeight(3.0);
      p5RefGlobal._p5Ref.stroke(currentColor);

      // Redraw the human drawing.
      for (let i = 0; i < lastHumanDrawing.length; i++) {
        p5RefGlobal._p5Ref.line(...lastHumanDrawing[i]);
      }

      // Start again.
      encodeStrokes(lastHumanStroke);
    }

    function restart(p) {
      // p5RefGlobal._p5Ref.background(255, 255, 255);
      p5RefGlobal._p5Ref.clear();
      // p5RefGlobal._p5Ref.image(img, 0, 0, p5RefGlobal._p5Ref.width, p5RefGlobal._p5Ref.height);
      // 图片的宽和高选一个小的作为定值
      p5RefGlobal._p5Ref.strokeWeight(3.0);

      // Start drawing in the middle-ish of the screen
      startX = x = p5RefGlobal._p5Ref.width / 2.0;
      startY = y = p5RefGlobal._p5Ref.height / 3.0;

      // Reset the user drawing state.
      userPen = 1;
      previousUserPen = 0;
      currentRawLine = [];
      strokes = [];

      // Reset the model drawing state.
      modelIsActive = false;
      previousPen = [0, 1, 0];
    }

    function initModel(index) {
      modelLoaded = false;
      // document.getElementById('sketch').classList.add('loading');

      if (model) {
        model.dispose();
      }

      model = new ms.SketchRNN(`${BASE_URL}${availableModels[index]}.gen.json`);
      model.initialize().then(() => {
        modelLoaded = true;
      //   document.getElementById('sketch').classList.remove('loading');
        console.log(`🤖${availableModels[index]} loaded.`);
        model.setPixelFactor(5.0); // Bigger -> large outputs
      });
    }

    function encodeStrokes(sequence) {
      if (sequence.length <= 5) {
        return;
      }

      // Encode the strokes in the model.
      let newState = model.zeroState();
      newState = model.update(model.zeroInput(), newState);
      newState = model.updateStrokes(sequence, newState, sequence.length - 1);

      // Reset the actual model we're using to this one that has the encoded strokes.
      modelState = model.copyState(newState);

      const lastHumanLine = lastHumanDrawing[lastHumanDrawing.length - 1];
      x = lastHumanLine[0];
      y = lastHumanLine[1];

      // Update the pen state.
      const s = sequence[sequence.length - 1];
      dx = s[0];
      dy = s[1];
      previousPen = [s[2], s[3], s[4]];

      lastModelDrawing = [];
      modelIsActive = true;
    }

    function randomColor() {
      return COLORS[Math.floor(Math.random() * COLORS.length)].hex;
    }
    function randomColorIndex() {
      return Math.floor(Math.random() * COLORS.length);
    }

    const setup = (p5) => {
        const container = document.getElementById('storyBackground');
        const screenWidth = container.offsetWidth;
        const screenHeight = container.offsetHeight;
        console.log('screenwidth:', screenWidth, 'screenHeight:', screenHeight);
        const canvas = p5.createCanvas(screenWidth, screenHeight);
        canvas.parent(container)
        console.log("Canvas created!"); // 添加这行日志以确认是否创建了画布
        console.log(screenWidth, screenHeight);
        p5.frameRate(50);
        var modelIndex;
        if(sketchObj._sketchObj === undefined || sketchObj._sketchObj.sketch_object === 'null') {
          modelIndex = 22;
        } else {
          modelIndex = availableModels.indexOf(sketchObj._sketchObj.sketch_object);
        }
        // const modelIndex = 22;
        initModel(modelIndex);
        p5RefGlobal._p5Ref = p5;
        p5RefGlobal._p5Ref = p5;
        const selectModels = document.getElementById('selectModels');
        selectModels.innerHTML = availableModels.map(m => `<option>${m}</option>`).join('');
        selectModels.selectedIndex = modelIndex;
        selectModels.addEventListener('change', () => initModel(selectModels.selectedIndex));
        const btnClear = document.getElementById('btnClear');
        btnClear.addEventListener('click', restart);
        const btnRetry = document.getElementById('btnRetry');
        btnRetry.addEventListener('click', retryMagic);
        const btnSave = document.getElementById('btnSave');
        btnSave.addEventListener('click', () => {
          p5RefGlobal._p5Ref.saveCanvas('magic-sketchpad', 'png');
        });
    };

    const changeColor = (event) => {
      const btn = event.target;
      const colorIndex = btn.dataset.index;
      currentColor = COLORS[colorIndex].hex;
      document.querySelector('.active').classList.remove('active');
      btn.classList.add('active');
    };

    const draw = (p5) => {
        if (!modelLoaded || !modelIsActive) {
            return;
        }
    
        // New state.
        pen = previousPen;
        modelState = model.update([dx, dy, ...pen], modelState);
        const pdf = model.getPDF(modelState, temperature);
        [dx, dy, ...pen] = model.sample(pdf);
    
        // If we finished the previous drawing, start a new one.
        if (pen[PEN.END] === 1) {
        console.log('finished this one');
        modelIsActive = false;
        } else {
        // Only draw on the paper if the pen is still touching the paper.
        if (previousPen[PEN.DOWN] === 1) {
            p5RefGlobal._p5Ref.line(x, y, x + dx, y + dy);
            lastModelDrawing.push([x, y, x + dx, y + dy]);
        }
        // Update.
        x += dx;
        y += dy;
        previousPen = pen;
        }
    };

    const mouseReleased = (p5) => { //鼠标释放
        if (!splashIsOpen && isInBounds()) {
            // userPen = 0; // Up!
            // const currentRawLineSimplified = model.simplifyLine(currentRawLine);
      
            // // If it's an accident...ignore it.
            // if (currentRawLineSimplified.length > 1) {
            //   // Encode this line as a stroke, and feed it to the model.
            //   lastHumanStroke = model.lineToStroke(currentRawLineSimplified, [
            //     startX,
            //     startY,
            //   ]);
            //   encodeStrokes(lastHumanStroke);
            // }
            // currentRawLine = [];
            // previousUserPen = userPen;
          }
    };

    const mouseDragged = (p5) => {
        if (!splashIsOpen && !modelIsActive && isInBounds()) {
            const dx0 = p5RefGlobal._p5Ref.mouseX - x;
            const dy0 = p5RefGlobal._p5Ref.mouseY - y;
            if (dx0 * dx0 + dy0 * dy0 > epsilon * epsilon) {
              // Only if pen is not in same area.
              dx = dx0;
              dy = dy0;
              userPen = 1;
              if (previousUserPen === 1) {
                p5RefGlobal._p5Ref.line(x, y, x + dx, y + dy); // draw line connecting prev point to current point.
                lastHumanDrawing.push([x, y, x + dx, y + dy]);
              }
              x += dx;
              y += dy;
              currentRawLine.push([x, y]);
            }
            previousUserPen = userPen;
          }
          return false;
    };

    const mousePressed = (p5) => {
        if (!splashIsOpen && isInBounds()) {
            x = startX = p5RefGlobal._p5Ref.mouseX;
            y = startY = p5RefGlobal._p5Ref.mouseY;
            userPen = 1; // down!
      
            modelIsActive = false;
            currentRawLine = [];
            lastHumanDrawing = [];
            previousUserPen = userPen;
            p5RefGlobal._p5Ref.stroke(currentColor);
            p5RefGlobal._p5Ref.strokeWeight(3);
          }

    };

    return (
    // <div style={{display: (visiable?'':'none')}}>
    <>
      <Sketch setup={setup} draw={draw} mouseReleased={mouseReleased} mousePressed={mousePressed} mouseDragged={mouseDragged} ref={p5Ref}/>
        <div className="wrapper top">
            <div className="controls">
                <button className="box" id="btnClear" alt="clear drawing">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" /><path fill="none" d="M0 0h24v24H0z" /></svg>
                </button>
                <button className="box" id="btnRetry" alt="retry magic drawing">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /></svg>
                </button>
                <div className="box select-wrapper" style={{ display: 'none' }}>
                    <select id="selectModels"></select>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                </div>

                <button className="box" id="btnSave" alt="save sketch">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" /></svg>
                </button>
            </div>
        </div>
        <div className="wrapper">
            <div id="colorsContainer">
                <button data-index="0" style={{backgroundColor: "rgb(0, 0, 0)"}} className="active" onClick={changeColor}></button>
                <button data-index="1" style={{backgroundColor: "rgb(244, 67, 54)"}} onClick={changeColor}></button>
                <button data-index="2" style={{backgroundColor: "rgb(233, 30, 99)"}} onClick={changeColor}></button>
                <button data-index="3" style={{backgroundColor: "rgb(156, 39, 176)"}} onClick={changeColor}></button>
                <button data-index="4" style={{backgroundColor: "rgb(103, 58, 183)"}} onClick={changeColor}></button>
                <button data-index="5" style={{backgroundColor: "rgb(63, 81, 181)"}} onClick={changeColor}></button>
                <button data-index="6" style={{backgroundColor: "rgb(33, 150, 243)"}} onClick={changeColor}></button>
                <button data-index="7" style={{backgroundColor: "rgb(0, 188, 212)"}} onClick={changeColor}></button>
                <button data-index="8" style={{backgroundColor: "rgb(0, 150, 136)"}} onClick={changeColor}></button>
                <button data-index="9" style={{backgroundColor: "rgb(76, 175, 80)"}} onClick={changeColor}></button>
                <button data-index="10" style={{backgroundColor: "rgb(139, 195, 74)"}} onClick={changeColor}></button>
                <button data-index="11" style={{backgroundColor: "rgb(205, 220, 57)"}} onClick={changeColor}></button>
                <button data-index="12" style={{backgroundColor: "rgb(255, 235, 59)"}} onClick={changeColor}></button>
                <button data-index="13" style={{backgroundColor: "rgb(255, 193, 7)"}} onClick={changeColor}></button>
                <button data-index="14" style={{backgroundColor: "rgb(255, 152, 0)"}} onClick={changeColor}></button>
                <button data-index="15" style={{backgroundColor: "rgb(255, 87, 34)"}} onClick={changeColor}></button>
                <button data-index="16" style={{backgroundColor: "rgb(121, 85, 72)"}} onClick={changeColor}></button>
                <button data-index="17" style={{backgroundColor: "rgb(158, 158, 158)"}} onClick={changeColor}></button>
            </div>
        </div>
        <div id="sketch" ></div>
        </>
        // </div>
      );

});


