import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PaintPage = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [rightImages, setRightImages] = useState(window.StoryState.elementSrcs);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [droppedImages, setDroppedImages] = useState([]);
  const [drawingData, setDrawingData] = useState([]);
  const [history, setHistory] = useState([{ drawingData: [], droppedImages: [], selectedImages: [] }]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [lastActionType, setLastActionType] = useState(null);

  useEffect(() => {
    if (window.sketches && window.sketches.length > 0) {
      const processedSketches = window.sketches.map(sketch => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL());
          };
          img.onerror = reject;
          img.src = sketch;
        });
      });

      Promise.all(processedSketches).then(processedImages => {
        setRightImages(prevImages => [...prevImages, ...processedImages]);
      });
    }
  }, []);

  const handleImageClick = (imagePath) => {
    if (selectedImages.length < 4 && !selectedImages.includes(imagePath)) {
      const newSelectedImages = [...selectedImages, imagePath];
      setSelectedImages(newSelectedImages);
      const newHistory = history.slice(0, currentStateIndex + 1);
      newHistory.push({ drawingData, droppedImages, selectedImages: newSelectedImages });
      setHistory(newHistory);
      setCurrentStateIndex(newHistory.length - 1);
      setLastActionType('imageClick');
      
      // Redraw the canvas to keep the drawing
      redrawCanvas();
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
      setDrawingData([...drawingData, { type: 'start', x, y }]);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setDrawingData([...drawingData, { type: 'move', x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const newDrawingData = [...drawingData, { type: 'end' }];
      setDrawingData(newDrawingData);
      const newHistory = history.slice(0, currentStateIndex + 1);
      newHistory.push({ drawingData: newDrawingData, droppedImages, selectedImages });
      setHistory(newHistory);
      setCurrentStateIndex(newHistory.length - 1);
      setLastActionType('draw');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    redrawCanvas();

    document.addEventListener('mouseup', handleCanvasMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [drawingData, droppedImages]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all saved drawing data
    drawingData.forEach((data) => {
      if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else if (data.type === 'move') {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    });

    // Redraw all dropped images
    droppedImages.forEach((img) => {
      const imgElement = new Image();
      imgElement.src = img.src;
      imgElement.onload = () => {
        let width = img.width;
        let height = img.height;
        // if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
        //   width = img.width / 4;
        //   height = img.height / 4;
        // }
        width = img.width / 3;
        height = img.height / 3;
        ctx.drawImage(imgElement, img.x - width / 2, img.y - height / 2, width, height);
      };
    });
  };

  const DraggableImage = ({ src, index }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'image',
      item: { src, index },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <img
        ref={drag}
        src={src}
        alt={`Selected ${index}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          margin: '2px',
        }}
      />
    );
  };

  const DropZone = () => {
    const [, drop] = useDrop(() => ({
      accept: 'image',
      drop: (item, monitor) => {
        const dropPos = monitor.getClientOffset();
        if (dropPos && canvasRef.current) {
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const x = dropPos.x - canvasRect.left;
          const y = dropPos.y - canvasRect.top;
          const img = new Image();
          img.src = item.src;
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (item.src.startsWith('http://') || item.src.startsWith('https://')) {
              width = img.width / 5;
              height = img.height / 5;
            }
            const newDroppedImages = [...droppedImages, { src: item.src, x, y, width, height }];
            setDroppedImages(newDroppedImages);
            const newHistory = history.slice(0, currentStateIndex + 1);
            newHistory.push({ drawingData, droppedImages: newDroppedImages, selectedImages });
            setHistory(newHistory);
            setCurrentStateIndex(newHistory.length - 1);
            setLastActionType('drop');
            redrawCanvas();
          };
        }
      },
    }));

    return (
      <div
        ref={drop}
        style={{ position: 'relative', width: '800px', height: '520px', margin: '0 auto' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={520}
          style={{ border: '1px solid black', maxWidth: '100%', maxHeight: 'calc(80vh - 20px)' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
        />
      </div>
    );
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData([]);
    setDroppedImages([]);
    setSelectedImages([]);
    const newHistory = [...history, { drawingData: [], droppedImages: [], selectedImages: [] }];
    setHistory(newHistory);
    setCurrentStateIndex(newHistory.length - 1);
    setLastActionType('clear');
  };

  const handleUndo = () => {
    if (currentStateIndex > 0) {
      let newIndex = currentStateIndex - 1;
      const previousState = history[newIndex];
      setCurrentStateIndex(newIndex);
      setDrawingData(previousState.drawingData);
      setDroppedImages(previousState.droppedImages);
      setSelectedImages(previousState.selectedImages);
      setLastActionType('undo');
      redrawCanvas();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: 'calc(100vh - 90px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                style={{
                  width: '70px',
                  height: '70px',
                  border: '2px solid black',
                  margin: '0 5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px',
                }}
              >
                {selectedImages[index] ? (
                  <DraggableImage src={selectedImages[index]} index={index} />
                ) : null}
              </div>
            ))}
          </div>
          <DropZone />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button onClick={handleClear} style={{ marginRight: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21V8H3V6ZM5 11H19V13H5V11ZM7 16H17V18H7V16Z" fill="currentColor"/>
              </svg>
              擦干净
            </button>
            <button onClick={handleUndo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7H17V9L21 5L17 1V3H5V11H7V7ZM17 17H7V15L3 19L7 23V21H19V13H17V17Z" fill="currentColor"/>
              </svg>
              重来一次
            </button>
          </div>
        </div>
        <div style={{ width: '80px', overflowY: 'auto', maxHeight: 'calc(100vh - 30px)', borderLeft: '1px solid #ccc', padding: '5px' }}>
          {rightImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Right ${index}`}
              style={{ 
                width: '100%', 
                marginBottom: '5px', 
                cursor: selectedImages.includes(src) ? 'not-allowed' : 'pointer',
                opacity: selectedImages.includes(src) ? 0.5 : 1
              }}
              onClick={() => !selectedImages.includes(src) && handleImageClick(src)}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default PaintPage;