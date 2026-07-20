export function loadVideoPosterFromObjectUrl(objectUrl: string) {
  return new Promise<string | undefined>((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.src = objectUrl;

    const cleanup = () => {
      videoElement.pause();
      videoElement.removeAttribute("src");
      videoElement.load();
    };

    const resolvePoster = () => {
      const { videoWidth, videoHeight } = videoElement;

      if (!videoWidth || !videoHeight) {
        cleanup();
        resolve(undefined);
        return;
      }

      const canvasElement = document.createElement("canvas");
      canvasElement.width = videoWidth;
      canvasElement.height = videoHeight;
      const context = canvasElement.getContext("2d");

      if (!context) {
        cleanup();
        resolve(undefined);
        return;
      }

      context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
      const posterDataUrl = canvasElement.toDataURL("image/jpeg", 0.82);
      cleanup();
      resolve(posterDataUrl);
    };

    videoElement.addEventListener(
      "loadeddata",
      () => {
        if (videoElement.currentTime > 0.05) {
          resolvePoster();
          return;
        }

        const handleSeeked = () => {
          videoElement.removeEventListener("seeked", handleSeeked);
          resolvePoster();
        };

        videoElement.addEventListener("seeked", handleSeeked, { once: true });
        videoElement.currentTime = Math.min(0.1, videoElement.duration || 0.1);
      },
      { once: true },
    );

    videoElement.addEventListener(
      "error",
      () => {
        cleanup();
        resolve(undefined);
      },
      { once: true },
    );
  });
}
