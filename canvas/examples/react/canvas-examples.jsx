// 01. 基础绘制
export function BasicsCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 把绘图逻辑放进 useEffect，确保拿到的是挂载后的 canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2A55E5";
    ctx.fillRect(24, 24, 120, 72);
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}

// 02. 样式与文本
export function StyleTextCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(24, 24, 280, 120);
    gradient.addColorStop(0, "#2A55E5");
    gradient.addColorStop(1, "#7C8CFF");

    ctx.fillStyle = gradient;
    ctx.fillRect(24, 24, 280, 120);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("React + Canvas", 44, 76);
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}

// 03. 变换与状态栈
export function TransformCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.save();
    ctx.translate(180, 120);
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = "#2A55E5";
    ctx.fillRect(-70, -24, 140, 48);
    ctx.restore();
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}

// 04. 图像与像素
export function ImagePixelCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(24, 24, 220, 120);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i] = avg;
      imageData.data[i + 1] = avg;
      imageData.data[i + 2] = avg;
    }

    ctx.putImageData(imageData, 280, 24);
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}

// 05. 动画与交互
export function AnimationCanvas() {
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(0);

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let x = 80;
    let vx = 2.4;

    const render = () => {
      ctx.clearRect(0, 0, 420, 240);
      ctx.beginPath();
      ctx.arc(x, 120, 26, 0, Math.PI * 2);
      ctx.fillStyle = "#2A55E5";
      ctx.fill();

      x += vx;
      if (x > 394 || x < 26) vx *= -1;
      frameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}

// 06. 自我练习模块
export function PracticeCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let drawing = false;

    const handleDown = (event) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
    };

    const handleMove = (event) => {
      if (!drawing) return;
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    };

    const handleUp = () => {
      drawing = false;
    };

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      canvas.removeEventListener("mousedown", handleDown);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return <canvas ref={canvasRef} width={420} height={240} />;
}
