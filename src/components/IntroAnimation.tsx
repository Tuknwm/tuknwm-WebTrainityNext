"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const CHARS = ["く", "ろ", "き", "ゅ", "う"];
const POSITIONS = [-180, -90, 0, 90, 180];
const LEFT_INDICES = [0, 1];
const RIGHT_INDICES = [2, 3, 4];

export default function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("trainity_intro_seen")) return;
    setVisible(true);

    let clockInterval: ReturnType<typeof setInterval>;

    function startClock() {
      const tick = () => {
        const now = new Date();
        if (clockRef.current)
          clockRef.current.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
        if (dateRef.current)
          dateRef.current.textContent = now.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long",
          });
      };
      tick();
      clockInterval = setInterval(tick, 1000);
    }

    function startAnimation() {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => {
            sessionStorage.setItem("trainity_intro_seen", "1");
            setVisible(false);
          }, 400);
        },
      });

      const latinStroke = document.getElementById("kurokyu-stroke");
      const curvePath = document.getElementById("curvePath");
      const textGroup = document.getElementById("text-group");

      if (!latinStroke || !curvePath || !textGroup) return;

      const pathLength = (latinStroke as unknown as SVGTextElement).getComputedTextLength() * 2;
      gsap.set(latinStroke, { strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 0 });
      gsap.set(textGroup, { scale: 2, opacity: 0 });

      tl.to(textGroup, { scale: 1, opacity: 1, duration: 1.5, ease: "expo.out" });
      tl.fromTo(
        ".text-path",
        { strokeDasharray: 450, strokeDashoffset: 450 },
        { strokeDashoffset: 0, duration: 1.5, stagger: 0.1, ease: "power2.inOut" },
        "-=0.5"
      );

      const flicker = (el: Element, delay: number) =>
        gsap.timeline({ delay })
          .to(el, { opacity: 0.7, duration: 0.05 })
          .to(el, { opacity: 0.1, duration: 0.04 })
          .to(el, { opacity: 1, duration: 0.1, filter: "drop-shadow(0 0 25px #fff)" });

      tl.addLabel("neon");
      LEFT_INDICES.forEach((i) => {
        const fill = document.getElementById(`fill-${i}`);
        if (fill) tl.add(flicker(fill, i * 0.1), "neon");
      });
      [...RIGHT_INDICES].reverse().forEach((i, idx) => {
        const fill = document.getElementById(`fill-${i}`);
        if (fill) tl.add(flicker(fill, idx * 0.1), "neon");
      });

      tl.addLabel("latin", "-=0.3");
      tl.to(latinStroke, {
        opacity: 1, duration: 0.1,
        onComplete: () =>
          gsap.to(latinStroke, { opacity: 0.1, duration: 0.05, yoyo: true, repeat: 1 }),
      }, "latin");
      tl.to(latinStroke, { strokeDashoffset: 0, duration: 2.5, ease: "power3.inOut" }, "latin");
      tl.to(latinStroke, { opacity: 0.15, duration: 1.5 }, "-=0.5");

      const emoji = document.getElementById("emoji-exit");
      if (emoji) tl.to(emoji, { opacity: 1, y: 0, duration: 0.5, ease: "back.out" }, "+=0.5");

      tl.addLabel("exit", "+=1.5");
      tl.to(".intro-fade-out", { opacity: 0, y: -20, duration: 0.5, stagger: 0.05 }, "exit");
      tl.to(
        curvePath,
        { attr: { d: "M 0,0 L 1,0 L 1,0 Q 0.5,-0.2 0,0 Z" }, duration: 1.5, ease: "expo.inOut" },
        "exit"
      );
    }

    startClock();
    const timer = setTimeout(startAnimation, 100);

    return () => {
      clearInterval(clockInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <defs>
          <clipPath id="curveClip" clipPathUnits="objectBoundingBox">
            <path id="curvePath" d="M 0,0 L 1,0 L 1,1 Q 0.5,1 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#000", color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
          display: "flex", justifyContent: "center", alignItems: "center",
          clipPath: "url(#curveClip)",
          overflow: "hidden",
        }}
      >
        {/* Top-left clock */}
        <div className="intro-fade-out" style={{ position: "absolute", top: 25, left: 25, zIndex: 1000 }}>
          <div ref={dateRef} style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>
            Memuat...
          </div>
          <div ref={clockRef} style={{ fontSize: 24, fontWeight: 900 }}>00:00:00</div>
        </div>

        {/* Bottom-left */}
        <div
          className="intro-fade-out"
          style={{
            position: "absolute", bottom: 25, left: 25,
            fontSize: 14, fontWeight: 300, letterSpacing: 3,
            textTransform: "uppercase", opacity: 0.6, zIndex: 1000,
          }}
        >
          Tuknwn
        </div>

        {/* Bottom-right emoji */}
        <div
          id="emoji-exit"
          className="intro-fade-out"
          style={{
            position: "absolute", bottom: 25, right: 25,
            fontSize: 24, fontWeight: 900, opacity: 0,
            transform: "translateY(20px)", zIndex: 1000, color: "#fff",
          }}
        >
          ＞︿＜
        </div>

        {/* Main SVG */}
        <div className="intro-fade-out" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <svg
            viewBox="0 0 1000 300"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", maxWidth: 900, height: "auto", overflow: "visible" }}
          >
            <g transform="translate(500, 150)">
              <text
                id="kurokyu-stroke"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: "transparent",
                  stroke: "rgba(255,255,255,0.3)",
                  strokeWidth: 1.5,
                  fontSize: 150,
                  fontWeight: 900,
                  letterSpacing: -2,
                }}
              >
                KUROKYU
              </text>
            </g>

            <g id="text-group" transform="translate(500, 150)">
              {CHARS.map((char, i) => (
                <g
                  key={i}
                  className={`char-unit ${LEFT_INDICES.includes(i) ? "left-side" : "right-side"}`}
                  transform={`translate(${POSITIONS[i]}, 0)`}
                >
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={90}
                    fontWeight="bold"
                    className="text-path"
                    style={{
                      fill: "transparent",
                      stroke: "#333",
                      strokeWidth: 1.5,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                    }}
                  >
                    {char}
                  </text>
                  <text
                    id={`fill-${i}`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={90}
                    fontWeight="bold"
                    style={{
                      fill: "#fff",
                      opacity: 0,
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
                    }}
                  >
                    {char}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
