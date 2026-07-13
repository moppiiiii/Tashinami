import { useId } from "react";

// 絵を持たないカテゴリ（other・未設定）のためのフォールバックの器。
// 線画ではなく、光を通すガラスとして描く。
// 縁の厚み・スペキュラ・底に溜まる光・液面のメニスカスを重ねる。
// fill は 0〜1 で注がれた量。液面の高さと水面の広がりがそれに従う。
// color は 6 桁 hex 前提（`${color}14` のように透明度を付けるため）。

type Ellipse = readonly [cx: number, cy: number, rx: number, ry: number];

type Spec = {
  vw: number;
  vh: number;
  widthRatio: number;
  /** 器の内側。液体のクリップと輪郭を兼ねる */
  body: string;
  /** 口の縁（外周） */
  rim: Ellipse;
  /** 厚いガラスの底。ここに光が溜まる */
  base: Ellipse;
  /** ハイライト。[path, opacity] */
  speculars: readonly (readonly [string, number])[];
  /** 脚（ワイン） */
  stem?: readonly string[];
  /** 台座（ワイン） */
  foot?: Ellipse;
  cx: number;
  top: readonly [y: number, rx: number];
  bottom: readonly [y: number, rx: number];
  /** 空のときの液面 y ／ 満杯のときの液面 y */
  yEmpty: number;
  yFull: number;
  ry: number;
};

const SPECS: Record<"whisky" | "wine" | "cup", Spec> = {
  whisky: {
    vw: 60,
    vh: 76,
    widthRatio: 0.78,
    body: "M12 8 L48 8 L44 70 Q44 74 40 74 L20 74 Q16 74 16 70 Z",
    rim: [30, 8, 18, 2.8],
    base: [30, 68.5, 12, 4.6],
    speculars: [
      ["M15.4 13.5 L18.4 13.5 L20.2 64 L17.5 64 Z", 0.15],
      ["M42.4 16 L44.8 16 L41.8 60 L39.8 60 Z", 0.07],
    ],
    cx: 30,
    top: [8, 18],
    bottom: [74, 10],
    yEmpty: 71,
    yFull: 13,
    ry: 2.7,
  },
  wine: {
    vw: 48,
    vh: 76,
    widthRatio: 0.62,
    body: "M9 3 L39 3 Q39 26 24 34 Q9 26 9 3 Z",
    rim: [24, 3, 15, 1.9],
    base: [24, 30.5, 5.5, 2.6],
    speculars: [
      ["M12.6 7 Q13.4 21 21.4 30.4 L23 29 Q14.8 20.5 14.4 7 Z", 0.16],
      ["M35.4 8 Q35 19.5 28.8 27.6 L27.6 26.6 Q33 19 33.4 8 Z", 0.07],
    ],
    stem: ["M24 34 L24 66"],
    foot: [24, 71.5, 11, 2.2],
    cx: 24,
    top: [3, 15],
    bottom: [34, 0],
    yEmpty: 31.5,
    yFull: 6,
    ry: 2.4,
  },
  cup: {
    vw: 62,
    vh: 46,
    widthRatio: 0.82,
    body: "M8 6 L54 6 L48 40 Q47 44 43 44 L19 44 Q15 44 14 40 Z",
    rim: [31, 6, 23, 3.2],
    base: [31, 41, 14, 3.4],
    speculars: [
      ["M11.6 10 L14.6 10 L17.2 38 L14.4 38 Z", 0.14],
      ["M48.2 11 L50.6 11 L47.4 36 L45.4 36 Z", 0.06],
    ],
    cx: 31,
    top: [6, 23],
    bottom: [44, 12],
    yEmpty: 42,
    yFull: 10,
    ry: 3,
  },
};

function kindOf(slug: string | null): keyof typeof SPECS {
  if (slug === "wine") return "wine";
  if (slug === "whisky" || slug === "shochu") return "whisky";
  return "cup";
}

export function Vessel({
  slug,
  color,
  height = 72,
  fill = 0.62,
}: {
  slug: string | null;
  color: string;
  height?: number;
  fill?: number;
}) {
  // url(#…) に載せるので、useId のコロンは落とす。
  const uid = useId().replace(/:/g, "");
  const spec = SPECS[kindOf(slug)];
  const c = color;

  const amount = Math.min(1, Math.max(0, fill));
  const level = spec.yEmpty - amount * (spec.yEmpty - spec.yFull);
  // 液面の位置での器の半径を、口と底のあいだの線形補間で求める。
  const t = (level - spec.top[0]) / (spec.bottom[0] - spec.top[0]);
  const rx = spec.top[1] + t * (spec.bottom[1] - spec.top[1]);
  const ry = Math.max(1, (spec.ry * rx) / spec.top[1]);

  const clip = `${uid}-clip`;
  const glass = `${uid}-glass`;
  const liquid = `${uid}-liquid`;
  const surface = `${uid}-surface`;
  const lens = `${uid}-lens`;

  return (
    <svg
      width={height * spec.widthRatio}
      height={height}
      viewBox={`0 0 ${spec.vw} ${spec.vh}`}
      fill="none"
      aria-hidden="true"
      className="relative z-[1] overflow-visible"
    >
      <defs>
        <clipPath id={clip}>
          <path d={spec.body} />
        </clipPath>

        {/* ガラスの地。左に強く、右にわずかに光を拾う。 */}
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".11" />
          <stop offset=".2" stopColor="#fff" stopOpacity=".025" />
          <stop offset=".64" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".07" />
        </linearGradient>

        {/* 液体。底ほど濃く沈み、そこへ光が抜ける。 */}
        <linearGradient id={liquid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity=".46" />
          <stop offset=".5" stopColor={c} stopOpacity=".3" />
          <stop offset="1" stopColor={c} stopOpacity=".7" />
        </linearGradient>

        <radialGradient id={surface}>
          <stop offset="0" stopColor="#fff" stopOpacity=".42" />
          <stop offset=".5" stopColor={c} stopOpacity=".9" />
          <stop offset="1" stopColor={c} stopOpacity=".45" />
        </radialGradient>

        <radialGradient id={lens}>
          <stop offset="0" stopColor={c} stopOpacity=".85" />
          <stop offset="1" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={spec.body} fill={`url(#${glass})`} />

      {amount > 0 ? (
        <g clipPath={`url(#${clip})`}>
          <rect
            x={0}
            y={level}
            width={spec.vw}
            height={spec.vh * 2}
            fill={`url(#${liquid})`}
          />
          {/* 厚いガラスの底に溜まる光 */}
          <ellipse
            cx={spec.base[0]}
            cy={spec.base[1]}
            rx={spec.base[2]}
            ry={spec.base[3]}
            fill={`url(#${lens})`}
            opacity=".55"
          />
          {/* 液面と、ガラスに吸い上がるメニスカスの縁 */}
          <ellipse
            cx={spec.cx}
            cy={level}
            rx={rx}
            ry={ry}
            fill={`url(#${surface})`}
          />
          <ellipse
            cx={spec.cx}
            cy={level}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#fff"
            strokeOpacity=".3"
            strokeWidth=".7"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ) : null}

      {spec.speculars.map(([d, opacity]) => (
        <path key={d} d={d} fill="#fff" opacity={opacity} />
      ))}

      {/* 輪郭は非スケーリングの細線。拡大しても太らせない。 */}
      <path
        d={spec.body}
        stroke={c}
        strokeOpacity=".85"
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
      />

      {spec.stem?.map((d) => (
        <path
          key={d}
          d={d}
          stroke={c}
          strokeWidth="1.3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {spec.foot ? (
        <ellipse
          cx={spec.foot[0]}
          cy={spec.foot[1]}
          rx={spec.foot[2]}
          ry={spec.foot[3]}
          fill={`url(#${glass})`}
          stroke={c}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {/* 縁の厚み：外周と内周の二重で、口のガラスに厚さを与える。 */}
      <ellipse
        cx={spec.rim[0]}
        cy={spec.rim[1]}
        rx={spec.rim[2]}
        ry={spec.rim[3]}
        fill="none"
        stroke={c}
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={spec.rim[0]}
        cy={spec.rim[1] + 1.1}
        rx={spec.rim[2] - 1.3}
        ry={Math.max(0.8, spec.rim[3] - 0.9)}
        fill="none"
        stroke="#fff"
        strokeOpacity=".22"
        strokeWidth=".7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
