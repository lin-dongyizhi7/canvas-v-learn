window.CanvasCourseData = {
  frameworkCards: [
    {
      title: "Vue 版学习站",
      href: "./vue/index.html",
      description: "使用 Vue 3 CDN 版本组织章节、切换示例并渲染 Canvas 预览。",
    },
    {
      title: "React 版学习站",
      href: "./react/index.html",
      description: "使用 React 18 CDN 版本管理章节状态，体验组件化学习流程。",
    },
    {
      title: "原生 JS 版学习站",
      href: "./native/index.html",
      description: "零框架，直接与 Canvas API 对话，理解最底层的调用方式。",
    },
    {
      title: "完整文档菜单",
      href: "./docs/index.html",
      description: "独立的概念文档页，按章节罗列知识点、API 与练习建议。",
    },
  ],
  lessons: [
    {
      id: "basics",
      title: "01. 基础绘制",
      summary: "认识画布坐标系、上下文对象与常见基础图形绘制方法。",
      apis: ["getContext", "clearRect", "fillRect", "strokeRect", "beginPath", "moveTo", "lineTo", "arc"],
      concepts: [
        "Canvas 本身是一个位图区域，真正的绘图能力来自 2D 上下文对象。",
        "坐标原点在左上角，x 向右增长，y 向下增长，很多初学者会被这个方向悄悄背刺。",
        "矩形 API 适合快速起手，路径 API 更适合自由组合复杂图形。",
      ],
      goals: [
        "理解 width/height 与 CSS 宽高的区别。",
        "能够用路径画出线段、圆形与简单组合图形。",
        "知道何时先 clearRect 再重绘。",
      ],
      practice: [
        "画一面小旗子：旗杆 + 旗面 + 圆形徽章。",
        "尝试把圆的半径改成通过滑块控制。",
      ],
      docAnchor: "doc-basics",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
    {
      id: "style-text",
      title: "02. 样式与文本",
      summary: "掌握填充、描边、阴影、渐变、字体与文字对齐。",
      apis: ["fillStyle", "strokeStyle", "lineWidth", "font", "fillText", "textAlign", "shadowBlur", "createLinearGradient"],
      concepts: [
        "Canvas 的样式状态挂在上下文对象上，修改一次会影响后续绘制。",
        "文本绘制不会自动换行，复杂排版需要你自己计算行高和行宽。",
        "渐变和阴影是提升观感的利器，但太多会拖慢重绘性能。",
      ],
      goals: [
        "能够区分填充色与描边色的作用范围。",
        "能使用渐变和阴影做出更像 UI 卡片的视觉效果。",
        "知道文字居中时 textAlign 与 textBaseline 应该怎么配合。",
      ],
      practice: [
        "做一个带标题、说明和按钮文案的海报卡片。",
        "尝试给同一段文字设置不同字号和颜色。",
      ],
      docAnchor: "doc-style-text",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
    {
      id: "transform",
      title: "03. 变换与状态栈",
      summary: "学习 save/restore、平移、旋转、缩放以及透明度控制。",
      apis: ["save", "restore", "translate", "rotate", "scale", "globalAlpha"],
      concepts: [
        "变换会影响后续绘制坐标系，因此复杂场景一定要养成 save/restore 的肌肉记忆。",
        "旋转默认围绕当前原点发生，所以常见套路是先 translate 到中心点再 rotate。",
        "globalAlpha 很适合做层次感与轻量动画。",
      ],
      goals: [
        "能把一个普通矩形旋转成指针或卡片效果。",
        "知道多层变换嵌套时为什么需要状态栈。",
        "理解局部透明度与整体重绘顺序的关系。",
      ],
      practice: [
        "画一个会旋转的仪表盘指针。",
        "用三层 save/restore 组合一个太阳和两颗环绕行星。",
      ],
      docAnchor: "doc-transform",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
    {
      id: "image-pixel",
      title: "04. 图像与像素",
      summary: "理解 drawImage、离屏画布、像素读写与简单滤镜。",
      apis: ["drawImage", "getImageData", "putImageData", "createPattern"],
      concepts: [
        "Canvas 不只会画几何图形，它也能处理图像与像素级效果。",
        "像素操作最灵活，但也最容易让性能掉到地上翻滚。",
        "离屏 Canvas 是减少重复绘制开销的常见技巧。",
      ],
      goals: [
        "能用 drawImage 绘制图片或离屏图层。",
        "会写一个简单的灰度或反色滤镜。",
        "知道像素循环里尽量减少额外对象创建。",
      ],
      practice: [
        "把一块渐变色区域转成灰度。",
        "尝试只处理一半画面，观察性能和效果差异。",
      ],
      docAnchor: "doc-image-pixel",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
    {
      id: "animation",
      title: "05. 动画与交互",
      summary: "掌握 requestAnimationFrame、鼠标事件、命中检测与重绘循环。",
      apis: ["requestAnimationFrame", "cancelAnimationFrame", "addEventListener", "isPointInPath"],
      concepts: [
        "动画的本质是按帧清空并重绘，requestAnimationFrame 会帮你和浏览器刷新节奏对齐。",
        "Canvas 内部图形没有 DOM 节点，所以点击命中检测需要自己算。",
        "交互逻辑越复杂，越适合维护一份场景数据而不是到处散落变量。",
      ],
      goals: [
        "会写一个基础小球动画并支持暂停恢复。",
        "知道如何把鼠标坐标转换到 Canvas 坐标系。",
        "理解高频重绘里避免重复绑定事件的重要性。",
      ],
      practice: [
        "做一个可点击变色的按钮。",
        "给小球加上边界反弹和速度控制。",
      ],
      docAnchor: "doc-animation",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
    {
      id: "practice",
      title: "06. 自我练习模块",
      summary: "提供一个可自由涂鸦和清空画布的小练习区，顺手把 API 记到手上。",
      apis: ["lineTo", "stroke", "mousedown", "mousemove", "mouseup", "clearRect"],
      concepts: [
        "最好的学习闭环是看概念、看示例、自己动手再被 bug 教育一遍。",
        "练习模块保持轻量，方便你往里面继续叠加颜色选择、橡皮擦、撤销重做等能力。",
      ],
      goals: [
        "自己补充笔刷颜色和粗细控制。",
        "尝试实现撤销上一步。",
      ],
      practice: [
        "先完成自由画线，再做橡皮擦。",
        "追加一个导出图片按钮。",
      ],
      docAnchor: "doc-practice",
      exampleFiles: {
        native: "../examples/native/canvas-examples.js",
        vue: "../examples/vue/canvas-examples.js",
        react: "../examples/react/canvas-examples.jsx",
      },
    },
  ],
  exampleSources: {
    native: {
      basics: `const canvas = document.querySelector("#lesson-canvas");\nconst ctx = canvas.getContext("2d");\n\n// 先清空再绘制，避免上一次内容残留\nctx.clearRect(0, 0, canvas.width, canvas.height);\nctx.fillStyle = "#2A55E5";\nctx.fillRect(24, 24, 120, 72);\nctx.strokeStyle = "#12213A";\nctx.lineWidth = 3;\nctx.strokeRect(168, 24, 120, 72);\n\nctx.beginPath();\nctx.moveTo(36, 148);\nctx.lineTo(136, 212);\nctx.lineTo(236, 148);\nctx.stroke();\n\nctx.beginPath();\nctx.fillStyle = "#7C8CFF";\nctx.arc(320, 168, 42, 0, Math.PI * 2);\nctx.fill();`,
      "style-text": `const gradient = ctx.createLinearGradient(24, 24, 280, 120);\ngradient.addColorStop(0, "#2A55E5");\ngradient.addColorStop(1, "#7C8CFF");\n\nctx.fillStyle = gradient;\nctx.shadowColor = "rgba(42, 85, 229, 0.25)";\nctx.shadowBlur = 16;\nctx.fillRect(24, 24, 280, 120);\n\nctx.shadowBlur = 0;\nctx.fillStyle = "#ffffff";\nctx.font = "bold 28px sans-serif";\nctx.textAlign = "left";\nctx.fillText("Canvas 文本样式", 44, 74);\nctx.font = "16px sans-serif";\nctx.fillText("fillText / font / shadow / gradient", 44, 108);`,
      transform: `ctx.save();\nctx.translate(180, 120);\nctx.rotate(Math.PI / 6);\nctx.fillStyle = "#2A55E5";\nctx.fillRect(-70, -24, 140, 48);\nctx.restore();\n\nctx.save();\nctx.globalAlpha = 0.35;\nctx.translate(280, 180);\nctx.scale(1.2, 0.8);\nctx.beginPath();\nctx.arc(0, 0, 56, 0, Math.PI * 2);\nctx.fillStyle = "#7C8CFF";\nctx.fill();\nctx.restore();`,
      "image-pixel": `const offscreen = document.createElement("canvas");\noffscreen.width = 220;\noffscreen.height = 120;\nconst offCtx = offscreen.getContext("2d");\nconst gradient = offCtx.createLinearGradient(0, 0, 220, 120);\ngradient.addColorStop(0, "#2A55E5");\ngradient.addColorStop(1, "#8B5CF6");\noffCtx.fillStyle = gradient;\noffCtx.fillRect(0, 0, 220, 120);\n\nctx.drawImage(offscreen, 24, 24);\nconst imageData = ctx.getImageData(24, 24, 220, 120);\nfor (let index = 0; index < imageData.data.length; index += 4) {\n  const avg = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;\n  imageData.data[index] = avg;\n  imageData.data[index + 1] = avg;\n  imageData.data[index + 2] = avg;\n}\nctx.putImageData(imageData, 280, 24);`,
      animation: `let x = 80;\nlet vx = 2.4;\n\nfunction drawFrame() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  ctx.beginPath();\n  ctx.fillStyle = "#2A55E5";\n  ctx.arc(x, 120, 26, 0, Math.PI * 2);\n  ctx.fill();\n\n  x += vx;\n  if (x > canvas.width - 26 || x < 26) {\n    vx *= -1;\n  }\n  requestAnimationFrame(drawFrame);\n}\n\ndrawFrame();`,
      practice: `let drawing = false;\ncanvas.addEventListener("mousedown", (event) => {\n  drawing = true;\n  ctx.beginPath();\n  ctx.moveTo(event.offsetX, event.offsetY);\n});\n\ncanvas.addEventListener("mousemove", (event) => {\n  if (!drawing) return;\n  ctx.lineTo(event.offsetX, event.offsetY);\n  ctx.stroke();\n});\n\nwindow.addEventListener("mouseup", () => {\n  drawing = false;\n});`,
    },
    vue: {
      basics: `<script setup>\nimport { onMounted, ref } from "vue";\n\nconst canvasRef = ref(null);\n\nonMounted(() => {\n  const canvas = canvasRef.value;\n  const ctx = canvas.getContext("2d");\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  ctx.fillStyle = "#2A55E5";\n  ctx.fillRect(24, 24, 120, 72);\n});\n</script>`,
      "style-text": `<script setup>\nimport { onMounted, ref } from "vue";\n\nconst canvasRef = ref(null);\n\nonMounted(() => {\n  const ctx = canvasRef.value.getContext("2d");\n  const gradient = ctx.createLinearGradient(24, 24, 280, 120);\n  gradient.addColorStop(0, "#2A55E5");\n  gradient.addColorStop(1, "#7C8CFF");\n  ctx.fillStyle = gradient;\n  ctx.fillRect(24, 24, 280, 120);\n  ctx.fillStyle = "#fff";\n  ctx.font = "bold 28px sans-serif";\n  ctx.fillText("Vue 中使用 Canvas", 44, 76);\n});\n</script>`,
      transform: `<script setup>\nimport { onMounted, ref } from "vue";\n\nconst canvasRef = ref(null);\n\nonMounted(() => {\n  const ctx = canvasRef.value.getContext("2d");\n  ctx.save();\n  ctx.translate(180, 120);\n  ctx.rotate(Math.PI / 6);\n  ctx.fillStyle = "#2A55E5";\n  ctx.fillRect(-70, -24, 140, 48);\n  ctx.restore();\n});\n</script>`,
      "image-pixel": `<script setup>\nimport { onMounted, ref } from "vue";\n\nconst canvasRef = ref(null);\n\nonMounted(() => {\n  const ctx = canvasRef.value.getContext("2d");\n  const imageData = ctx.getImageData(24, 24, 220, 120);\n  for (let i = 0; i < imageData.data.length; i += 4) {\n    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;\n    imageData.data[i] = avg;\n    imageData.data[i + 1] = avg;\n    imageData.data[i + 2] = avg;\n  }\n  ctx.putImageData(imageData, 280, 24);\n});\n</script>`,
      animation: `<script setup>\nimport { onMounted, onUnmounted, ref } from "vue";\n\nconst canvasRef = ref(null);\nlet frameId = 0;\n\nonMounted(() => {\n  const ctx = canvasRef.value.getContext("2d");\n  let x = 80;\n  let vx = 2.4;\n  const render = () => {\n    ctx.clearRect(0, 0, 420, 240);\n    ctx.beginPath();\n    ctx.arc(x, 120, 26, 0, Math.PI * 2);\n    ctx.fill();\n    x += vx;\n    if (x > 394 || x < 26) vx *= -1;\n    frameId = requestAnimationFrame(render);\n  };\n  render();\n});\n\nonUnmounted(() => cancelAnimationFrame(frameId));\n</script>`,
      practice: `<script setup>\nimport { onMounted, ref } from "vue";\n\nconst canvasRef = ref(null);\n\nonMounted(() => {\n  const canvas = canvasRef.value;\n  const ctx = canvas.getContext("2d");\n  let drawing = false;\n\n  canvas.addEventListener("mousedown", (event) => {\n    drawing = true;\n    ctx.beginPath();\n    ctx.moveTo(event.offsetX, event.offsetY);\n  });\n});\n</script>`,
    },
    react: {
      basics: `import { useEffect, useRef } from "react";\n\nexport function BasicsCanvas() {\n  const canvasRef = useRef(null);\n\n  useEffect(() => {\n    const canvas = canvasRef.current;\n    const ctx = canvas.getContext("2d");\n    ctx.clearRect(0, 0, canvas.width, canvas.height);\n    ctx.fillStyle = "#2A55E5";\n    ctx.fillRect(24, 24, 120, 72);\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
      "style-text": `import { useEffect, useRef } from "react";\n\nexport function TextCanvas() {\n  const canvasRef = useRef(null);\n\n  useEffect(() => {\n    const ctx = canvasRef.current.getContext("2d");\n    const gradient = ctx.createLinearGradient(24, 24, 280, 120);\n    gradient.addColorStop(0, "#2A55E5");\n    gradient.addColorStop(1, "#7C8CFF");\n    ctx.fillStyle = gradient;\n    ctx.fillRect(24, 24, 280, 120);\n    ctx.fillStyle = "#fff";\n    ctx.font = "bold 28px sans-serif";\n    ctx.fillText("React 中使用 Canvas", 44, 76);\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
      transform: `import { useEffect, useRef } from "react";\n\nexport function TransformCanvas() {\n  const canvasRef = useRef(null);\n\n  useEffect(() => {\n    const ctx = canvasRef.current.getContext("2d");\n    ctx.save();\n    ctx.translate(180, 120);\n    ctx.rotate(Math.PI / 6);\n    ctx.fillRect(-70, -24, 140, 48);\n    ctx.restore();\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
      "image-pixel": `import { useEffect, useRef } from "react";\n\nexport function PixelCanvas() {\n  const canvasRef = useRef(null);\n\n  useEffect(() => {\n    const ctx = canvasRef.current.getContext("2d");\n    const imageData = ctx.getImageData(24, 24, 220, 120);\n    for (let i = 0; i < imageData.data.length; i += 4) {\n      const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;\n      imageData.data[i] = avg;\n      imageData.data[i + 1] = avg;\n      imageData.data[i + 2] = avg;\n    }\n    ctx.putImageData(imageData, 280, 24);\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
      animation: `import { useEffect, useRef } from "react";\n\nexport function AnimationCanvas() {\n  const canvasRef = useRef(null);\n  const frameRef = useRef(0);\n\n  useEffect(() => {\n    const ctx = canvasRef.current.getContext("2d");\n    let x = 80;\n    let vx = 2.4;\n    const render = () => {\n      ctx.clearRect(0, 0, 420, 240);\n      ctx.beginPath();\n      ctx.arc(x, 120, 26, 0, Math.PI * 2);\n      ctx.fill();\n      x += vx;\n      if (x > 394 || x < 26) vx *= -1;\n      frameRef.current = requestAnimationFrame(render);\n    };\n    render();\n    return () => cancelAnimationFrame(frameRef.current);\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
      practice: `import { useEffect, useRef } from "react";\n\nexport function PracticeCanvas() {\n  const canvasRef = useRef(null);\n\n  useEffect(() => {\n    const canvas = canvasRef.current;\n    const ctx = canvas.getContext("2d");\n    let drawing = false;\n    const handleDown = (event) => {\n      drawing = true;\n      ctx.beginPath();\n      ctx.moveTo(event.offsetX, event.offsetY);\n    };\n    canvas.addEventListener("mousedown", handleDown);\n    return () => canvas.removeEventListener("mousedown", handleDown);\n  }, []);\n\n  return <canvas ref={canvasRef} width={420} height={240} />;\n}`,
    },
  },
};
