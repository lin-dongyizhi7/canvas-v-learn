// 01. 基础绘制
export function drawBasics(ctx, canvas) {
  // 先清空画布，避免多次调用后图形叠在一起
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#2A55E5";
  ctx.fillRect(24, 24, 120, 72);

  ctx.strokeStyle = "#12213A";
  ctx.lineWidth = 3;
  ctx.strokeRect(168, 24, 120, 72);

  ctx.beginPath();
  ctx.moveTo(36, 148);
  ctx.lineTo(136, 212);
  ctx.lineTo(236, 148);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "#7C8CFF";
  ctx.arc(320, 168, 42, 0, Math.PI * 2);
  ctx.fill();
}

// 02. 样式与文本
export function drawStyleText(ctx) {
  const gradient = ctx.createLinearGradient(24, 24, 280, 120);
  gradient.addColorStop(0, "#2A55E5");
  gradient.addColorStop(1, "#7C8CFF");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(42, 85, 229, 0.25)";
  ctx.shadowBlur = 16;
  ctx.fillRect(24, 24, 280, 120);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("Canvas 文本样式", 44, 74);
}

// 03. 变换与状态栈
export function drawTransform(ctx) {
  ctx.save();
  ctx.translate(180, 120);
  ctx.rotate(Math.PI / 6);
  ctx.fillStyle = "#2A55E5";
  ctx.fillRect(-70, -24, 140, 48);
  ctx.restore();
}

// 04. 图像与像素
export function drawImagePixel(ctx) {
  const offscreen = document.createElement("canvas");
  offscreen.width = 220;
  offscreen.height = 120;
  const offCtx = offscreen.getContext("2d");

  const gradient = offCtx.createLinearGradient(0, 0, 220, 120);
  gradient.addColorStop(0, "#2A55E5");
  gradient.addColorStop(1, "#8B5CF6");
  offCtx.fillStyle = gradient;
  offCtx.fillRect(0, 0, 220, 120);

  ctx.drawImage(offscreen, 24, 24);

  const imageData = ctx.getImageData(24, 24, 220, 120);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const avg =
      (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;

    imageData.data[index] = avg;
    imageData.data[index + 1] = avg;
    imageData.data[index + 2] = avg;
  }
  ctx.putImageData(imageData, 280, 24);
}

// 05. 动画与交互
export function createAnimation(ctx, canvas) {
  let x = 80;
  let vx = 2.4;

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = "#2A55E5";
    ctx.arc(x, 120, 26, 0, Math.PI * 2);
    ctx.fill();

    x += vx;
    if (x > canvas.width - 26 || x < 26) {
      vx *= -1;
    }
    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

// 06. 自我练习模块
export function enablePractice(ctx, canvas) {
  let drawing = false;

  canvas.addEventListener("mousedown", (event) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!drawing) return;
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  });

  window.addEventListener("mouseup", () => {
    drawing = false;
  });
}
