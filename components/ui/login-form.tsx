"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Smokey WebGL background + glassmorphism form pieces, adapted from the
// "login-form" block (21st.dev). Changes from the block:
// - the shader is compiled once per color; mouse position lives in a ref
//   (the block re-created the whole WebGL program on every mouse move and
//   never cancelled its requestAnimationFrame loop, which stacks loops and
//   lags quickly);
// - the loop pauses while the tab is hidden, the canvas resolution is
//   capped, and reduced-motion users get a single still frame;
// - the form itself is not here: the real login/signup forms
//   (app/account/AuthForms.tsx) are built from <GlassCard> and
//   <FloatingField>, with RTL floating labels and the site's server actions.

const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const blurClassMap: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
};

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.substring(1, 3), 16) / 255,
  parseInt(hex.substring(3, 5), 16) / 255,
  parseInt(hex.substring(5, 7), 16) / 255,
];

interface SmokeyBackgroundProps {
  backdropBlurAmount?: BlurSize;
  /** Smoke color as #rrggbb. */
  color?: string;
  className?: string;
}

/** Interactive WebGL smoke that drifts and bends toward the pointer. */
export function SmokeyBackground({ backdropBlurAmount = "sm", color = "#8f0a20", className = "" }: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // target and eased pointer position, in canvas pixels (null = centered)
  const target = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertexSmokeySource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uMouse = gl.getUniformLocation(program, "iMouse");
    gl.uniform3f(gl.getUniformLocation(program, "u_color"), ...hexToRgb(color));

    // The smoke is soft and sits under a blur, so a capped resolution
    // looks the same and costs far less on large / high-DPI screens.
    const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.75;
    const eased = { x: 0, y: 0 };
    let raf = 0;
    const start = performance.now();

    const draw = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        eased.x = w / 2;
        eased.y = h / 2;
      }
      const t = target.current;
      const tx = t ? t.x * scale : w / 2;
      const ty = t ? h - t.y * scale : h / 2;
      eased.x += (tx - eased.x) * 0.06;
      eased.y += (ty - eased.y) * 0.06;
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    if (reduced) draw();
    else raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVisibility);

    // Listen on the window so the smoke follows the pointer even over the
    // form card that sits on top of the canvas.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [color]);

  return (
    <div className={cn("absolute inset-0 h-full w-full overflow-hidden bg-[#050506]", className)} aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className={cn("absolute inset-0", blurClassMap[backdropBlurAmount])} />
    </div>
  );
}

/** The frosted-glass card the forms sit in. */
export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "w-full max-w-sm space-y-6 rounded-2xl border border-white/15 bg-white/[0.07] p-8 text-white shadow-2xl shadow-black/50 backdrop-blur-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

type FloatingFieldProps = {
  id: string;
  name: string;
  label: string;
  icon: ReactNode;
  type?: "text" | "password" | "tel";
  required?: boolean;
  inputMode?: "numeric" | "text";
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
};

/** Underlined input whose label floats up when focused or filled (RTL);
 *  password fields get a show/hide toggle. */
export function FloatingField({ id, name, label, icon, type = "text", required, inputMode, dir, autoComplete, value, onChange }: FloatingFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="relative z-0">
      <input
        id={id}
        name={name}
        type={isPassword && !visible ? "password" : type === "password" ? "text" : type}
        required={required}
        inputMode={inputMode}
        dir={dir}
        autoComplete={autoComplete}
        placeholder=" "
        {...(onChange ? { value: value ?? "", onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        className={cn(
          "peer block w-full appearance-none border-0 border-b-2 border-white/30 bg-transparent px-0 py-2.5 text-[14.5px] text-white transition-colors focus:border-blood-hi focus:outline-none focus:ring-0",
          dir === "ltr" && "text-left",
          isPassword && "pl-9"
        )}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute right-0 top-3 -z-10 flex origin-top-right -translate-y-6 scale-75 items-center gap-2 text-[14px] text-white/60 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-[rgb(235_80_96)]"
      >
        {icon}
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
          aria-pressed={visible}
          className="absolute bottom-1.5 left-0 flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition hover:text-white"
        >
          {visible ? <EyeOff className="size-[17px]" /> : <Eye className="size-[17px]" />}
        </button>
      )}
    </div>
  );
}
