window.CanvasDemoEngine = (() => {
  const CANVAS_WIDTH = 420;
  const CANVAS_HEIGHT = 240;

  function resetCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  function createGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "#e5ecfb";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBasics(ctx) {
    createGrid(ctx);
    ctx.fillStyle = "#2A55E5";
    ctx.fillRect(24, 24, 120, 72);
    ctx.strokeStyle = "#12213A";
    ctx.lineWidth = 3;
    ctx.strokeRect(168, 24, 120, 72);

    ctx.beginPath();
    ctx.moveTo(36, 168);
    ctx.lineTo(120, 112);
    ctx.lineTo(204, 168);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#7C8CFF";
    ctx.arc(318, 156, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStyleText(ctx) {
    const gradient = ctx.createLinearGradient(24, 24, 330, 130);
    gradient.addColorStop(0, "#2A55E5");
    gradient.addColorStop(1, "#7C8CFF");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(42, 85, 229, 0.25)";
    ctx.shadowBlur = 16;
    ctx.fillRect(24, 24, 320, 122);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Canvas 样式与文本", 44, 78);
    ctx.font = "16px sans-serif";
    ctx.fillText("gradient / shadow / textAlign", 44, 110);

    ctx.strokeStyle = "#12213A";
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 166, 124, 42);
    ctx.fillStyle = "#12213A";
    ctx.font = "16px sans-serif";
    ctx.fillText("描边按钮", 72, 194);
  }

  function drawTransform(ctx) {
    createGrid(ctx);

    ctx.save();
    ctx.translate(120, 120);
    ctx.rotate(Math.PI / 8);
    ctx.fillStyle = "#2A55E5";
    ctx.fillRect(-60, -24, 120, 48);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(286, 132);
    ctx.scale(1.2, 0.8);
    ctx.fillStyle = "#7C8CFF";
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#12213A";
    ctx.font = "16px sans-serif";
    ctx.fillText("save / restore / translate / rotate / scale", 24, 220);
  }

  function drawImagePixel(ctx) {
    const offscreen = document.createElement("canvas");
    offscreen.width = 180;
    offscreen.height = 120;
    const offCtx = offscreen.getContext("2d");

    const gradient = offCtx.createLinearGradient(0, 0, 180, 120);
    gradient.addColorStop(0, "#2A55E5");
    gradient.addColorStop(1, "#8B5CF6");
    offCtx.fillStyle = gradient;
    offCtx.fillRect(0, 0, 180, 120);
    offCtx.fillStyle = "rgba(255, 255, 255, 0.82)";
    offCtx.font = "bold 24px sans-serif";
    offCtx.fillText("drawImage", 28, 68);

    ctx.drawImage(offscreen, 24, 40);

    const imageData = ctx.getImageData(24, 40, 180, 120);
    for (let index = 0; index < imageData.data.length; index += 4) {
      const avg =
        (imageData.data[index] +
          imageData.data[index + 1] +
          imageData.data[index + 2]) /
        3;
      imageData.data[index] = avg;
      imageData.data[index + 1] = avg;
      imageData.data[index + 2] = avg;
    }
    ctx.putImageData(imageData, 224, 40);
    ctx.fillStyle = "#12213A";
    ctx.font = "16px sans-serif";
    ctx.fillText("左侧原图，右侧灰度处理", 24, 24);
  }

  function drawAnimation(canvas) {
    const ctx = resetCanvas(canvas);
    let frameId = 0;
    let x = 80;
    let velocity = 2.6;
    let buttonColor = "#12213A";

    const handleClick = (event) => {
      const { offsetX, offsetY } = event;
      if (offsetX >= 286 && offsetX <= 386 && offsetY >= 180 && offsetY <= 214) {
        buttonColor = buttonColor === "#12213A" ? "#2A55E5" : "#12213A";
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      createGrid(ctx);

      ctx.beginPath();
      ctx.fillStyle = "#2A55E5";
      ctx.arc(x, 102, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = buttonColor;
      ctx.fillRect(286, 180, 100, 34);
      ctx.fillStyle = "#ffffff";
      ctx.font = "15px sans-serif";
      ctx.fillText("点我变色", 312, 202);

      x += velocity;
      if (x >= CANVAS_WIDTH - 24 || x <= 24) {
        velocity *= -1;
      }

      frameId = requestAnimationFrame(render);
    };

    canvas.addEventListener("click", handleClick);
    render();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("click", handleClick);
    };
  }

  function drawPractice(canvas) {
    const ctx = resetCanvas(canvas);
    ctx.strokeStyle = "#2A55E5";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    let drawing = false;

    const getPoint = (event) => ({ x: event.offsetX, y: event.offsetY });

    const handleDown = (event) => {
      drawing = true;
      const point = getPoint(event);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    const handleMove = (event) => {
      if (!drawing) {
        return;
      }
      const point = getPoint(event);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

    const handleUp = () => {
      drawing = false;
    };

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return {
      cleanup() {
        canvas.removeEventListener("mousedown", handleDown);
        canvas.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      },
      clear() {
        resetCanvas(canvas);
      },
    };
  }

  function mountLesson(canvas, lessonId) {
    if (!canvas) {
      return { cleanup() {}, clearPractice() {} };
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = resetCanvas(canvas);

    if (lessonId === "basics") {
      drawBasics(ctx);
      return { cleanup() {}, clearPractice() {} };
    }

    if (lessonId === "style-text") {
      drawStyleText(ctx);
      return { cleanup() {}, clearPractice() {} };
    }

    if (lessonId === "transform") {
      drawTransform(ctx);
      return { cleanup() {}, clearPractice() {} };
    }

    if (lessonId === "image-pixel") {
      drawImagePixel(ctx);
      return { cleanup() {}, clearPractice() {} };
    }

    if (lessonId === "animation") {
      const cleanup = drawAnimation(canvas);
      return { cleanup, clearPractice() {} };
    }

    if (lessonId === "practice") {
      const practice = drawPractice(canvas);
      return {
        cleanup: practice.cleanup,
        clearPractice: practice.clear,
      };
    }

    return { cleanup() {}, clearPractice() {} };
  }

  return {
    mountLesson,
  };
})();
