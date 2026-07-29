"use client";

/* eslint-disable @next/next/no-img-element */

import type {
  HandLandmarker as HandLandmarkerType,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type CameraState = "idle" | "loading" | "ready" | "error";
type SelectionSource = "mouse" | "gesture";
type Gender = "female" | "male";
type Outfit = {
  name: string;
  short: string;
  tag: string;
  col: number;
  row: number;
  color: string;
  description: string;
  filter?: string;
};

const characters = [
  {
    id: "peach",
    name: "奶油桃桃",
    caption: "甜美软萌",
    gender: "female" as Gender,
    index: 0,
    accent: "#ef9aa5",
  },
  {
    id: "blue",
    name: "蓝调酷仔",
    caption: "中性街头",
    gender: "male" as Gender,
    index: 1,
    accent: "#4256a6",
  },
  {
    id: "chestnut",
    name: "栗子同学",
    caption: "复古文艺",
    gender: "female" as Gender,
    index: 2,
    accent: "#8b6b4f",
  },
];

const femaleOutfits: Outfit[] = [
  {
    name: "奶油蝴蝶结",
    short: "奶油",
    tag: "甜美",
    col: 0,
    row: 0,
    color: "#ed9dac",
    description: "粗针织、蓬蓬裙与蝴蝶结，像一块柔软的草莓奶油。",
  },
  {
    name: "复古学院",
    short: "学院",
    tag: "学院",
    col: 1,
    row: 0,
    color: "#bf7a52",
    description: "深色西装配格纹下装，端正里留一点小小的叛逆。",
  },
  {
    name: "美式棒球",
    short: "棒球",
    tag: "休闲",
    col: 2,
    row: 0,
    color: "#5677a6",
    description: "宽松棒球夹克和水洗牛仔裤，轻松又有少年感。",
  },
  {
    name: "街头机能",
    short: "机能",
    tag: "街头",
    col: 3,
    row: 0,
    color: "#37383e",
    description: "黑色连帽衫、工装裤与腰包，适合夜色里的城市漫游。",
  },
  {
    name: "丹宁牛仔",
    short: "牛仔",
    tag: "复古",
    col: 4,
    row: 0,
    color: "#b9854f",
    description: "刺绣丹宁与喇叭裤，带着一点自由的西部气息。",
  },
  {
    name: "森系花园",
    short: "森系",
    tag: "自然",
    col: 0,
    row: 1,
    color: "#74856a",
    description: "碎花长裙与针织披肩，把整个春天穿在身上。",
  },
  {
    name: "都市风衣",
    short: "风衣",
    tag: "通勤",
    col: 1,
    row: 1,
    color: "#a08b78",
    description: "利落长风衣和高腰长裤，克制、从容又很有气场。",
  },
  {
    name: "Y2K 未来",
    short: "Y2K",
    tag: "未来",
    col: 2,
    row: 1,
    color: "#8d80c7",
    description: "金属银与蓝紫渐变，像从千禧年的未来频道走来。",
  },
  {
    name: "活力运动",
    short: "运动",
    tag: "活力",
    col: 3,
    row: 1,
    color: "#d8669b",
    description: "撞色运动套装和复古球鞋，随时准备开始一场快乐比赛。",
  },
  {
    name: "星光舞台",
    short: "舞台",
    tag: "闪耀",
    col: 4,
    row: 1,
    color: "#6f58a8",
    description: "亮片、星星与不对称裙摆，为聚光灯而生。",
  },
];

const maleOutfits: Outfit[] = [
  {
    name: "深蓝学院",
    short: "学院",
    tag: "学院",
    col: 1,
    row: 0,
    color: "#354365",
    description: "深蓝西装、衬衫与领带，清爽利落的少年学院感。",
  },
  {
    name: "美式棒球",
    short: "棒球",
    tag: "休闲",
    col: 2,
    row: 0,
    color: "#5677a6",
    description: "宽松棒球夹克和水洗牛仔裤，轻松又有少年感。",
  },
  {
    name: "暗夜机能",
    short: "机能",
    tag: "街头",
    col: 3,
    row: 0,
    color: "#37383e",
    description: "黑色连帽衫、工装裤与腰包，是酷感十足的街头组合。",
  },
  {
    name: "都市风衣",
    short: "风衣",
    tag: "通勤",
    col: 1,
    row: 1,
    color: "#887665",
    description: "长风衣配直筒长裤，克制、从容又有电影感。",
  },
  {
    name: "沙丘校队",
    short: "沙丘",
    tag: "休闲",
    col: 2,
    row: 0,
    color: "#a2703e",
    description: "沙丘色校队夹克搭配阔腿牛仔，温暖又松弛。",
    filter: "sepia(.38) saturate(.9) brightness(1.08)",
  },
  {
    name: "森林风衣",
    short: "森林",
    tag: "通勤",
    col: 1,
    row: 1,
    color: "#687660",
    description: "低饱和森林色风衣与深色长裤，安静又耐看。",
    filter: "sepia(.16) hue-rotate(52deg) saturate(.72) brightness(.92)",
  },
  {
    name: "森林校队",
    short: "校队",
    tag: "休闲",
    col: 2,
    row: 0,
    color: "#557762",
    description: "森林配色的校队夹克和阔腿牛仔，松弛又耐看。",
    filter: "hue-rotate(48deg) saturate(.82)",
  },
  {
    name: "蓝调机能",
    short: "蓝调",
    tag: "街头",
    col: 3,
    row: 0,
    color: "#3f5678",
    description: "蓝黑机能层次搭配工装裤，适合夜色里的城市漫游。",
    filter: "sepia(.18) hue-rotate(160deg) saturate(1.35) brightness(1.08)",
  },
  {
    name: "焦糖学院",
    short: "焦糖",
    tag: "学院",
    col: 1,
    row: 0,
    color: "#9a684a",
    description: "焦糖色学院外套搭配格纹下装，复古但不拘谨。",
    filter: "sepia(.35) hue-rotate(330deg) saturate(1.15) brightness(1.06)",
  },
  {
    name: "夜幕风衣",
    short: "夜幕",
    tag: "通勤",
    col: 1,
    row: 1,
    color: "#4d5367",
    description: "冷灰蓝风衣和深色长裤，像夜幕下安静利落的主角。",
    filter: "hue-rotate(172deg) saturate(.68) brightness(.86)",
  },
];

const OUTFIT_COUNT = 10;

const handConnections = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
] as const;

function CharacterCrop({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  return (
    <span className={`character-crop ${className}`} aria-hidden="true">
      <img
        src="./assets/character-lineup.png"
        alt=""
        style={{ transform: `translateX(-${index * 33.3333}%)` }}
      />
    </span>
  );
}

function OutfitCrop({
  col,
  row,
  filter,
  className = "",
}: {
  col: number;
  row: number;
  filter?: string;
  className?: string;
}) {
  return (
    <span className={`outfit-crop ${className}`} aria-hidden="true">
      <img
        src="./assets/outfit-collection.png"
        alt=""
        style={{
          left: `calc(-${col * 105}% - 2.5%)`,
          top: `calc(-${row * 105}% - 2.5%)`,
          width: "525%",
          height: "210%",
          filter,
        }}
      />
    </span>
  );
}

function PolishedLook({
  outfit,
  characterIndex,
  className = "",
}: {
  outfit: Outfit;
  characterIndex: number;
  className?: string;
}) {
  return (
    <span className={`polished-look ${className}`} aria-hidden="true">
      <OutfitCrop
        col={outfit.col}
        row={outfit.row}
        filter={outfit.filter}
        className="polished-look-outfit"
      />
      <CharacterCrop
        index={characterIndex}
        className="polished-look-identity"
      />
    </span>
  );
}

export default function Home() {
  const [activeCharacter, setActiveCharacter] = useState(1);
  const [activeOutfit, setActiveOutfit] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraMessage, setCameraMessage] = useState("等待开启摄像头");
  const [gestureMessage, setGestureMessage] = useState("鼠标模式");
  const [lastSource, setLastSource] = useState<SelectionSource>("mouse");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerType | null>(null);
  const rafRef = useRef<number | null>(null);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerOutfitRef = useRef<
    (index: number, source: SelectionSource) => void
  >(() => undefined);
  const pinchingRef = useRef(false);
  const lastPinchAtRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const hoverTargetRef = useRef<HTMLElement | null>(null);
  const gestureLabelRef = useRef("");

  const character = characters[activeCharacter];
  const wardrobe =
    character.gender === "male" ? maleOutfits : femaleOutfits;
  const outfit = activeOutfit === null ? null : wardrobe[activeOutfit];

  const triggerOutfit = useCallback(
    (index: number, source: SelectionSource) => {
      if (index < 0 || index >= OUTFIT_COUNT) return;
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
      setActiveOutfit(index);
      setLastSource(source);
      setChanging(false);
      window.requestAnimationFrame(() => setChanging(true));
      changeTimerRef.current = setTimeout(() => setChanging(false), 720);
    },
    [],
  );

  useEffect(() => {
    triggerOutfitRef.current = triggerOutfit;
  }, [triggerOutfit]);

  const setGestureLabel = useCallback((label: string) => {
    if (gestureLabelRef.current === label) return;
    gestureLabelRef.current = label;
    setGestureMessage(label);
  }, []);

  const clearGestureHover = useCallback(() => {
    hoverTargetRef.current?.classList.remove("gesture-hover");
    hoverTargetRef.current = null;
  }, []);

  const drawHand = useCallback((landmarks: NormalizedLandmark[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 238, 209, 0.9)";
    ctx.fillStyle = "#ff8fa3";

    for (const [start, end] of handConnections) {
      const a = landmarks[start];
      const b = landmarks[end];
      ctx.beginPath();
      ctx.moveTo((1 - a.x) * canvas.width, a.y * canvas.height);
      ctx.lineTo((1 - b.x) * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }

    landmarks.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(
        (1 - point.x) * canvas.width,
        point.y * canvas.height,
        index === 4 || index === 8 ? 6 : 3.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    clearGestureHover();
    if (pointerRef.current) pointerRef.current.hidden = true;
  }, [clearGestureHover]);

  const processHandFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker) return;

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const landmarks = result.landmarks[0];

        if (landmarks) {
          drawHand(landmarks);
          const thumb = landmarks[4];
          const index = landmarks[8];
          const pinchDistance = Math.hypot(
            thumb.x - index.x,
            thumb.y - index.y,
            thumb.z - index.z,
          );

          const x = (1 - index.x) * window.innerWidth;
          const y = index.y * window.innerHeight;
          const pointer = pointerRef.current;
          if (pointer) {
            pointer.hidden = false;
            pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            pointer.classList.toggle("is-pinching", pinchDistance < 0.058);
          }

          const hit = document
            .elementFromPoint(x, y)
            ?.closest<HTMLElement>("[data-outfit-index]");
          if (hit !== hoverTargetRef.current) {
            clearGestureHover();
            if (hit) {
              hit.classList.add("gesture-hover");
              hoverTargetRef.current = hit;
            }
          }

          if (!pinchingRef.current && pinchDistance < 0.058) {
            pinchingRef.current = true;
            setGestureLabel(hit ? "捏合成功 · 正在换装" : "捏合成功");
            const now = performance.now();
            if (hit && now - lastPinchAtRef.current > 650) {
              const nextIndex = Number(hit.dataset.outfitIndex);
              triggerOutfitRef.current(nextIndex, "gesture");
              lastPinchAtRef.current = now;
            }
          } else if (pinchingRef.current && pinchDistance > 0.085) {
            pinchingRef.current = false;
            setGestureLabel(hit ? "已锁定服装 · 捏合确认" : "张开手掌移动");
          } else if (!pinchingRef.current) {
            setGestureLabel(hit ? "已锁定服装 · 捏合确认" : "张开手掌移动");
          }
        } else {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          clearGestureHover();
          if (pointerRef.current) pointerRef.current.hidden = true;
          setGestureLabel("请把一只手放入画面");
        }
      } catch {
        setGestureLabel("识别暂时中断，正在恢复");
      }
    }

  }, [clearGestureHover, drawHand, setGestureLabel]);

  const runHandLoop = useCallback(() => {
    function tick() {
      processHandFrame();
      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
  }, [processHandFrame]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraMessage("当前浏览器不支持摄像头");
      return;
    }

    setCameraState("loading");
    setCameraMessage("正在请求摄像头权限…");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Video element is unavailable");
      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
      }

      setCameraMessage("正在加载手势模型…");
      const { FilesetResolver, HandLandmarker } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      setCameraState("ready");
      setCameraMessage("摄像头与手势已就绪");
      setGestureLabel("张开手掌移动");
      runHandLoop();
    } catch (error) {
      stopCamera();
      setCameraState("error");
      setCameraMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "摄像头权限未开启，可继续使用鼠标"
          : "手势模式启动失败，可继续使用鼠标",
      );
    }
  }, [runHandLoop, setGestureLabel, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    };
  }, [stopCamera]);

  const stageStyle = {
    "--active-color": outfit?.color ?? character.accent,
    "--character-color": character.accent,
  } as CSSProperties;

  return (
    <main className="app-shell">
      <div className="gesture-pointer" ref={pointerRef} hidden>
        <span />
      </div>

      <header className="topbar">
        <a className="brand" href="#studio" aria-label="换装研究所首页">
          <span className="brand-mark">✦</span>
          <span>
            <strong>换装研究所</strong>
            <small>GESTURE DRESS LAB</small>
          </span>
        </a>
        <div className="top-status">
          <span className={`live-dot ${cameraState === "ready" ? "on" : ""}`} />
          {cameraState === "ready" ? "手势模式已连接" : "鼠标模式可用"}
        </div>
        <button
          className="camera-trigger"
          type="button"
          onClick={() => {
            if (cameraState === "ready") {
              stopCamera();
              setCameraState("idle");
              setCameraMessage("等待开启摄像头");
              setGestureLabel("鼠标模式");
            } else {
              void startCamera();
            }
          }}
          disabled={cameraState === "loading"}
        >
          <span aria-hidden="true">◉</span>
          {cameraState === "ready"
            ? "关闭摄像头"
            : cameraState === "loading"
              ? "正在连接…"
              : "开启手势换装"}
        </button>
      </header>

      <section className="intro">
        <p className="eyebrow">REAL-TIME GESTURE DRESS-UP</p>
        <h1>
          张开手掌，挑一套
          <em>今天的风格</em>
        </h1>
        <p>
          用鼠标点击即可换装；开启摄像头后，移动食指选择服装，
          拇指与食指捏合确认。
        </p>
      </section>

      <section className="studio-grid" id="studio">
        <aside className="character-panel panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <p>选择角色</p>
              <small>CHARACTER</small>
            </div>
          </div>
          <div className="character-list">
            {characters.map((item, index) => (
              <button
                type="button"
                className={`character-card ${
                  index === activeCharacter ? "active" : ""
                }`}
                onClick={() => setActiveCharacter(index)}
                aria-pressed={index === activeCharacter}
                key={item.id}
              >
                <CharacterCrop index={item.index} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.caption}</small>
                </span>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>
          <div className="upload-teaser">
            <span aria-hidden="true">＋</span>
            <div>
              <strong>上传我的形象</strong>
              <small>下一阶段开放</small>
            </div>
          </div>
        </aside>

        <section
          className={`dress-stage panel ${changing ? "is-changing" : ""}`}
          style={stageStyle}
          aria-live="polite"
        >
          <div className="stage-meta">
            <span>
              {outfit
                ? `LOOK ${String(activeOutfit + 1).padStart(2, "0")}`
                : "CHARACTER READY"}
            </span>
            <span>
              {outfit
                ? `${lastSource === "gesture" ? "GESTURE" : "MOUSE"} SELECTED`
                : "WAITING TO DRESS"}
            </span>
          </div>
          <div className="halo halo-one" />
          <div className="halo halo-two" />
          <div className="sparkles" aria-hidden="true">
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
            <span>✧</span>
          </div>

          <div className="doll-wrap">
            {outfit ? (
              <PolishedLook
                outfit={outfit}
                characterIndex={character.index}
                className="doll-polished-look"
              />
            ) : (
              <CharacterCrop
                index={character.index}
                className="doll-base-character"
              />
            )}
          </div>

          <div className="look-caption">
            <span className="look-number">
              {outfit ? String(activeOutfit + 1).padStart(2, "0") : "00"}
            </span>
            <div>
              <small>{outfit ? `${outfit.tag} STYLE` : "READY TO DRESS"}</small>
              <h2>{outfit?.name ?? character.name}</h2>
              <p>
                {outfit?.description ??
                  "左侧选中的角色已经进入换衣区，点击衣橱或用捏合手势为它穿上第一套衣服。"}
              </p>
            </div>
          </div>
        </section>

        <aside className="camera-panel panel">
          <div className="panel-heading">
            <span>02</span>
            <div>
              <p>手势画面</p>
              <small>HAND TRACKING</small>
            </div>
          </div>
          <div className={`camera-view ${cameraState}`}>
            <video ref={videoRef} muted playsInline />
            <canvas ref={canvasRef} />
            {cameraState !== "ready" && (
              <div className="camera-placeholder">
                <span className="camera-icon" aria-hidden="true">
                  ◉
                </span>
                <strong>{cameraMessage}</strong>
                <small>视频只在你的浏览器中处理</small>
              </div>
            )}
          </div>
          <div className="gesture-readout">
            <span className={cameraState === "ready" ? "active" : ""}>
              {cameraState === "ready" ? "LIVE" : "MOUSE"}
            </span>
            <div>
              <strong>{gestureMessage}</strong>
              <small>{cameraMessage}</small>
            </div>
          </div>
          <div className="gesture-guide">
            <div>
              <span aria-hidden="true">☝</span>
              <p>
                <strong>移动食指</strong>
                <small>浏览衣橱</small>
              </p>
            </div>
            <div>
              <span aria-hidden="true">👌</span>
              <p>
                <strong>轻轻捏合</strong>
                <small>确认换装</small>
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="wardrobe-section">
        <div className="wardrobe-title">
          <div>
            <span>03</span>
            <div>
              <p>全部衣橱</p>
              <small>
                {character.gender === "male"
                  ? "10 BOYS' CURATED LOOKS"
                  : "10 GIRLS' CURATED LOOKS"}
              </small>
            </div>
          </div>
          <p>
            当前为{character.gender === "male" ? "男生" : "女生"}衣橱 ·
            点击服装，或用手势光标悬停后捏合
          </p>
        </div>
        <div className="outfit-rail">
          {wardrobe.map((item, index) => (
            <button
              type="button"
              className={`outfit-card ${
                index === activeOutfit ? "active" : ""
              }`}
              data-outfit-index={index}
              aria-pressed={index === activeOutfit}
              onClick={() => triggerOutfit(index, "mouse")}
              key={item.name}
              style={{ "--card-color": item.color } as CSSProperties}
            >
              <PolishedLook
                outfit={item}
                characterIndex={character.index}
                className="outfit-card-look"
              />
              <span className="outfit-card-copy">
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.name}</strong>
                <em>{item.tag}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer>
        <p>换装研究所 · 用一个手势遇见不同的自己</p>
        <span>鼠标与摄像头双模式原型</span>
      </footer>
    </main>
  );
}
