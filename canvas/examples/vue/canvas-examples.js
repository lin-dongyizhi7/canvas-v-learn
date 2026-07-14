// 01. 基础绘制
export const basicsExample = `
<script setup>
import { onMounted, ref } from "vue";

const canvasRef = ref(null);

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  // 在组件挂载后拿到真实 DOM，再进行 Canvas 绘制
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2A55E5";
  ctx.fillRect(24, 24, 120, 72);
});
</script>
`;

// 02. 样式与文本
export const styleTextExample = `
<script setup>
import { onMounted, ref } from "vue";

const canvasRef = ref(null);

onMounted(() => {
  const ctx = canvasRef.value.getContext("2d");
  const gradient = ctx.createLinearGradient(24, 24, 280, 120);
  gradient.addColorStop(0, "#2A55E5");
  gradient.addColorStop(1, "#7C8CFF");

  ctx.fillStyle = gradient;
  ctx.fillRect(24, 24, 280, 120);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("Vue + Canvas", 44, 76);
});
</script>
`;

// 03. 变换与状态栈
export const transformExample = `
<script setup>
import { onMounted, ref } from "vue";

const canvasRef = ref(null);

onMounted(() => {
  const ctx = canvasRef.value.getContext("2d");
  ctx.save();
  ctx.translate(180, 120);
  ctx.rotate(Math.PI / 6);
  ctx.fillStyle = "#2A55E5";
  ctx.fillRect(-70, -24, 140, 48);
  ctx.restore();
});
</script>
`;

// 04. 图像与像素
export const imagePixelExample = `
<script setup>
import { onMounted, ref } from "vue";

const canvasRef = ref(null);

onMounted(() => {
  const ctx = canvasRef.value.getContext("2d");
  const imageData = ctx.getImageData(24, 24, 220, 120);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = avg;
    imageData.data[i + 1] = avg;
    imageData.data[i + 2] = avg;
  }

  ctx.putImageData(imageData, 280, 24);
});
</script>
`;

// 05. 动画与交互
export const animationExample = `
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref(null);
let frameId = 0;

onMounted(() => {
  const ctx = canvasRef.value.getContext("2d");
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
    frameId = requestAnimationFrame(render);
  };

  render();
});

onUnmounted(() => cancelAnimationFrame(frameId));
</script>
`;

// 06. 自我练习模块
export const practiceExample = `
<script setup>
import { onMounted, ref } from "vue";

const canvasRef = ref(null);

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
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
});
</script>
`;
