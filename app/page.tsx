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

function GarmentOnly({
  outfit,
  className = "",
}: {
  outfit: Outfit;
  className?: string;
}) {
  return (
    <span className={`garment-only ${className}`} aria-hidden="true">
      <OutfitCrop
        col={outfit.col}
        row={outfit.row}
        filter={outfit.filter}
        className="garment-piece garment-piece-top"
      />
      <OutfitCrop
        col={outfit.col}
        row={outfit.row}
        filter={outfit.filter}
        className="garment-piece garment-piece-bottom"
      />
      <OutfitCrop
        col={outfit.col}
        row={outfit.row}
        filter={outfit.filter}
        className="garment-piece garment-piece-shoes"
      />
    </span>
  );
}

const femaleGarmentKinds = [
  "knit-skirt",
  "academy",
  "varsity",
  "hoodie",
  "western",
  "dress",
  "trench",
  "y2k",
  "sport",
  "stage",
] as const;

const maleGarmentKinds = [
  "academy",
  "varsity",
  "hoodie",
  "trench",
  "varsity",
  "trench",
  "varsity",
  "hoodie",
  "academy",
  "trench",
] as const;

function WardrobeGarment({
  outfit,
  index,
  gender,
}: {
  outfit: Outfit;
  index: number;
  gender: Gender;
}) {
  const kind =
    gender === "male" ? maleGarmentKinds[index] : femaleGarmentKinds[index];
  const gradientId = `garment-gradient-${gender}-${index}`;
  const patternId = `garment-pattern-${gender}-${index}`;
  const shadowId = `garment-shadow-${gender}-${index}`;
  const silverId = `garment-silver-${gender}-${index}`;
  const isMale = gender === "male";

  const garment = (() => {
    switch (kind) {
      case "academy":
        return (
          <>
            <path
              d="M54 42 72 35h16l18 7 13 39-18 7-5-24v45H64V64l-5 24-18-7Z"
              fill={`url(#${gradientId})`}
            />
            <path d="m72 36 8 16 8-16 9 8-8 18H71l-8-18Z" fill="#fffaf1" />
            <path d="m80 51-5 13 5 16 5-16Z" fill="#a75c43" />
            <path d="M64 62h32M67 86h26" fill="none" />
            {isMale ? (
              <>
                <path
                  d="M64 108h32l9 64-18 3-7-48-7 48-18-3Z"
                  fill={`url(#${patternId})`}
                />
                <path d="M54 178h20l-2 12H49q-3-8 5-12ZM86 178h20q8 4 5 12H88Z" fill="#332d31" />
              </>
            ) : (
              <>
                <path d="M61 108h38l10 42H51Z" fill={`url(#${patternId})`} />
                <path d="M58 158h18l-2 14H54ZM84 158h18l4 14H86Z" fill="#fff8eb" />
                <path d="M53 174h23l-3 14H49ZM85 174h23l3 14H88Z" fill="#3c3436" />
              </>
            )}
          </>
        );
      case "varsity":
        return (
          <>
            <path
              d="M53 43 69 36h22l16 7 16 35-17 8-8-21v41H62V65l-8 21-17-8Z"
              fill={`url(#${gradientId})`}
            />
            <path d="M69 36h22l-5 14H74ZM62 88h36v10H62Z" fill="#f8eee0" />
            <path d="M76 50h9v35h-9Z" fill="#fffaf4" opacity=".78" />
            <path d="M58 107h44l8 67-20 2-10-47-10 47-20-2Z" fill="#7190aa" />
            <path d="m62 121 13 4-5 38-12-1ZM98 121l-13 4 5 38 12-1Z" fill="#87a4ba" opacity=".65" />
            <path d="M50 178h25l-3 12H45q-2-8 5-12ZM85 178h25q7 4 5 12H88Z" fill="#f5eee2" />
          </>
        );
      case "hoodie":
        return (
          <>
            <path
              d="M57 44 68 35h24l11 9 18 37-17 8-8-22v42H64V67l-8 22-17-8Z"
              fill={`url(#${gradientId})`}
            />
            <path d="M68 35q12 18 24 0l7 18H61Z" fill="#24252b" />
            <path d="M69 79h22l7 15H62Z" fill="#1d1e23" />
            <path d="M58 108h44l10 65-20 4-12-44-12 44-20-4Z" fill="#30333b" />
            <path d="M51 126h15v23H48ZM94 126h15l3 23H96Z" fill="#24262d" />
            <path d="M48 179h27l-4 12H43q-3-8 5-12ZM85 179h27q8 4 5 12H88Z" fill="#1d1e23" />
          </>
        );
      case "trench":
        return (
          <>
            <path
              d="M55 41 70 34h20l15 7 16 38-17 8-8-21 9 76H55l9-76-8 21-17-8Z"
              fill={`url(#${gradientId})`}
            />
            <path d="m70 34 10 19 10-19 10 13-14 17H74L60 47Z" fill="#f7f0e6" />
            <path d="M80 54v86M61 91h38M68 101h24" fill="none" />
            <circle cx="72" cy="70" r="2.5" fill="#6d584b" stroke="none" />
            <circle cx="88" cy="70" r="2.5" fill="#6d584b" stroke="none" />
            <path d="M62 142h36l8 34-18 2-8-27-8 27-18-2Z" fill="#343238" />
            <path d="M52 180h23l-3 12H47q-2-8 5-12ZM85 180h23q7 4 5 12H88Z" fill="#423a38" />
          </>
        );
      case "western":
        return (
          <>
            <path
              d="M55 44 70 36h20l15 8 15 34-16 9-9-22v42H65V65l-9 22-16-9Z"
              fill="#f8ead5"
            />
            <path d="M65 54h30l-4 50H69Z" fill={`url(#${gradientId})`} />
            <path d="M70 36 80 53l10-17 7 13-12 13H75L63 49Z" fill="#fffaf1" />
            <path d="M58 106h44l12 70-22 2-12-49-12 49-22-2Z" fill="#50799a" />
            <path d="M53 128h17M90 128h17" fill="none" stroke="#d3a761" strokeWidth="2" />
            <path d="M47 180h28l-3 12H43q-2-8 4-12ZM85 180h28q7 4 4 12H88Z" fill="#774f30" />
          </>
        );
      case "dress":
        return (
          <>
            <path
              d="M67 38h26l5 26 12 27 18 86q-20 15-48 15t-48-15l18-86 12-27Z"
              fill={`url(#${patternId})`}
            />
            <path d="M67 38q13 15 26 0l5 26H62Z" fill="#f9ecd8" opacity=".72" />
            <path d="M58 78h44M49 108h62M41 145h78" fill="none" stroke="#f2dfc9" />
            <path d="M61 65 43 87l10 14 17-25M99 65l18 22-10 14-17-25" fill="#eee0ca" opacity=".85" />
          </>
        );
      case "y2k":
        return (
          <>
            <path
              d="M54 44 69 36h22l15 8 15 35-17 8-8-23v43H64V64l-8 23-17-8Z"
              fill={`url(#${silverId})`}
            />
            <path d="M70 47h20l6 42H64Z" fill={`url(#${gradientId})`} />
            <path d="M61 106h38l13 43H48Z" fill={`url(#${patternId})`} />
            <path d="M54 156h19l-1 17H51ZM87 156h19l3 17H88Z" fill="#eee8f3" />
            <path d="M48 174h27l-2 18H44ZM85 174h27l4 18H87Z" fill="#a4a8bc" />
          </>
        );
      case "sport":
        return (
          <>
            <path
              d="M53 44 69 36h22l16 8 16 34-17 9-9-22v40H63V65l-9 22-17-9Z"
              fill={`url(#${gradientId})`}
            />
            <path d="M65 54h30v14H65ZM72 36h16l7 15H65Z" fill="#f9eee6" />
            <path d="M60 105h40l8 36-20 3-8-24-8 24-20-3Z" fill={`url(#${patternId})`} />
            <path d="M55 151h18v18H53ZM87 151h18l2 18H89Z" fill="#fff7e9" />
            <path d="M48 173h29l-5 17H43q-3-11 5-17ZM83 173h29q8 6 5 17H88Z" fill="#f0e9df" />
          </>
        );
      case "stage":
        return (
          <>
            <path
              d="M64 37h32l5 28 13 27 13 78-29 20-18-29-18 29-29-20 13-78 13-27Z"
              fill={`url(#${patternId})`}
            />
            <path d="M64 37 80 55l16-18 6 21-13 16H71L58 58Z" fill="#302144" />
            <path d="M52 92h56M44 128h72" fill="none" stroke="#e8c56b" />
            <path d="m101 122 25 43-26 25-13-43Z" fill={`url(#${gradientId})`} opacity=".8" />
            <path d="M50 178h23l-2 15H47ZM87 178h23l3 15H89Z" fill="#2a202f" />
          </>
        );
      default:
        return (
          <>
            <path
              d="M55 43 70 35h20l15 8 15 35-16 9-9-22v39H65V65l-9 22-16-9Z"
              fill="#f7ead8"
            />
            <path d="M61 105h38l13 48H48Z" fill={`url(#${patternId})`} />
            <path d="M54 158h20l-2 16H51ZM86 158h20l3 16H88Z" fill="#fff7eb" />
            <path d="M49 176h26l-3 15H45ZM85 176h26l4 15H88Z" fill={outfit.color} />
          </>
        );
    }
  })();

  return (
    <svg
      className="wardrobe-garment-art"
      viewBox="0 0 160 220"
      role="img"
      aria-label={`${outfit.name}服装`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8ef" />
          <stop offset=".42" stopColor={outfit.color} />
          <stop offset="1" stopColor={outfit.color} stopOpacity=".72" />
        </linearGradient>
        <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={outfit.color} />
          <path d="M0 6h12M6 0v12" stroke="#fff7e9" strokeOpacity=".28" />
          <circle cx="3" cy="3" r="1.2" fill="#fff7e9" fillOpacity=".5" />
        </pattern>
        <linearGradient id={silverId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f5fa" />
          <stop offset=".45" stopColor="#9ca3b6" />
          <stop offset=".7" stopColor="#e3e5ed" />
          <stop offset="1" stopColor="#858da3" />
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#50373d" floodOpacity=".18" />
        </filter>
      </defs>
      <g
        filter={`url(#${shadowId})`}
        stroke="#5a464a"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {garment}
      </g>
    </svg>
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
            <CharacterCrop
              index={character.index}
              className="doll-base-character"
            />
            {outfit && (
              <GarmentOnly
                outfit={outfit}
                className="doll-garment-layer"
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
                  ? "10 BOYS' GARMENTS"
                  : "10 GIRLS' GARMENTS"}
              </small>
            </div>
          </div>
          <p>
            纯服装预览 · 当前为
            {character.gender === "male" ? "男生" : "女生"}衣橱 ·
            点击或捏合换装
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
              <WardrobeGarment
                outfit={item}
                index={index}
                gender={character.gender}
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
