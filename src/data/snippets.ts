export const canvasBasicsSnippet = String.raw`<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#0f172a;color:#fff;font-family:sans-serif;">
    <canvas id="canvas" width="520" height="280" style="display:block;width:100%;background:#081120;"></canvas>
    <script>
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      // 这里演示最常见的基础 API：矩形、路径、圆形与文本
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#2A55E5";
      ctx.fillRect(24, 24, 140, 88);

      ctx.strokeStyle = "#7DD3FC";
      ctx.lineWidth = 4;
      ctx.strokeRect(190, 24, 140, 88);

      ctx.beginPath();
      ctx.moveTo(40, 200);
      ctx.lineTo(130, 130);
      ctx.lineTo(220, 200);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = "#A78BFA";
      ctx.arc(360, 164, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("Canvas 基础绘制", 24, 258);
    </script>
  </body>
</html>`;

export const canvasParticlesSnippet = String.raw`<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#020617;overflow:hidden;">
    <canvas id="canvas" width="520" height="320" style="display:block;width:100%;height:100%;"></canvas>
    <script>
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const pointer = { x: 260, y: 160 };
      const particles = Array.from({ length: 48 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        size: 2 + Math.random() * 4,
      }));

      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      });

      function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(9, 16, 32, 0.22)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const particle of particles) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.max(40, Math.hypot(dx, dy));
          particle.vx += dx / distance * 0.002;
          particle.vy += dy / distance * 0.002;
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.fillStyle = "#7DD3FC";
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        requestAnimationFrame(tick);
      }

      tick();
    </script>
  </body>
</html>`;

export const webAudioSnippet = String.raw`<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;padding:16px;background:#0f172a;color:#fff;font-family:sans-serif;">
    <button id="start" style="margin-right:8px;">播放音调</button>
    <button id="stop">停止</button>
    <canvas id="view" width="520" height="180" style="display:block;margin-top:16px;background:#020617;border-radius:12px;"></canvas>
    <script>
      const AudioContextRef = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextRef();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(audioContext.destination);

      let oscillator = null;
      let gainNode = null;
      const canvas = document.getElementById("view");
      const ctx = canvas.getContext("2d");
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / dataArray.length;
        dataArray.forEach((value, index) => {
          const barHeight = value / 255 * canvas.height;
          ctx.fillStyle = "#2A55E5";
          ctx.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        });
      }

      draw();

      document.getElementById("start").onclick = async () => {
        await audioContext.resume();
        oscillator?.stop();
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        oscillator.type = "sawtooth";
        oscillator.frequency.value = 220;
        gainNode.gain.value = 0.08;
        oscillator.connect(gainNode);
        gainNode.connect(analyser);
        oscillator.start();
      };

      document.getElementById("stop").onclick = () => {
        oscillator?.stop();
        oscillator = null;
      };
    </script>
  </body>
</html>`;

export const webGlSnippet = String.raw`<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#020617;">
    <canvas id="gl" width="520" height="320" style="display:block;width:100%;"></canvas>
    <script>
      const canvas = document.getElementById("gl");
      const gl = canvas.getContext("webgl");
      if (!gl) {
        document.body.innerHTML = "<p style='color:#fff;padding:16px;'>当前环境不支持 WebGL。</p>";
      } else {
        const vertexSource = \`
          attribute vec2 position;
          void main() {
            gl_Position = vec4(position, 0.0, 1.0);
          }
        \`;
        const fragmentSource = \`
          precision mediump float;
          void main() {
            gl_FragColor = vec4(0.165, 0.333, 0.898, 1.0);
          }
        \`;

        function createShader(type, source) {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          return shader;
        }

        const program = gl.createProgram();
        gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        gl.useProgram(program);

        const vertices = new Float32Array([
          0.0, 0.7,
          -0.7, -0.5,
          0.7, -0.5
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.02, 0.05, 0.09, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    </script>
  </body>
</html>`;

export const webCodecsSnippet = String.raw`<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;padding:16px;background:#0f172a;color:#fff;font-family:sans-serif;">
    <h3 style="margin-top:0;">WebCodecs 能力探测</h3>
    <button id="check">检查 H.264 编码支持</button>
    <pre id="log" style="margin-top:12px;padding:12px;border-radius:12px;background:#020617;white-space:pre-wrap;"></pre>
    <script>
      const log = document.getElementById("log");
      document.getElementById("check").onclick = async () => {
        if (!("VideoEncoder" in window)) {
          log.textContent = "当前浏览器不支持 WebCodecs 的 VideoEncoder。";
          return;
        }

        const result = await VideoEncoder.isConfigSupported({
          codec: "avc1.42001E",
          width: 640,
          height: 360,
          bitrate: 1_000_000,
          framerate: 30
        });

        log.textContent = JSON.stringify(result, null, 2);
      };
    </script>
  </body>
</html>`;

export const ffmpegSnippet = String.raw`import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// 关键流程：加载 wasm、写入文件、执行命令、读取产物
async function transcodeToMp3(file: File) {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  await ffmpeg.writeFile("input.mp4", await fetchFile(file));
  await ffmpeg.exec(["-i", "input.mp4", "-vn", "-acodec", "libmp3lame", "output.mp3"]);

  const data = await ffmpeg.readFile("output.mp3");
  return new Blob([data], { type: "audio/mpeg" });
}

// 提醒：浏览器里跑 FFmpeg 很强，但也很吃 CPU 和内存。
// 真到大文件处理阶段，通常要补进度提示、取消任务、worker 隔离。`;
