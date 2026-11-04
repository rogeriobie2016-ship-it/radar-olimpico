"use client";

import { useRef } from "react";

export function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Círculo de andar dos mundos em 3D. */
export function Joystick({ aoMover }: { aoMover: (x: number, y: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const bola = useRef<HTMLSpanElement>(null);
  const ativo = useRef<number | null>(null);
  const mover = (cx: number, cy: number) => {
    const r = base.current!.getBoundingClientRect();
    const raio = r.width / 2;
    let x = (cx - r.left - raio) / raio;
    let y = (cy - r.top - raio) / raio;
    const d = Math.hypot(x, y);
    if (d > 1) {
      x /= d;
      y /= d;
    }
    bola.current!.style.transform = `translate(${x * raio * 0.62}px, ${y * raio * 0.62}px)`;
    aoMover(x, y);
  };
  const soltar = () => {
    ativo.current = null;
    bola.current!.style.transform = "";
    aoMover(0, 0);
  };
  return (
    <div
      ref={base}
      className="lab-joystick"
      aria-hidden="true"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        ativo.current = e.pointerId;
        mover(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => ativo.current === e.pointerId && mover(e.clientX, e.clientY)}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <span ref={bola} />
    </div>
  );
}
