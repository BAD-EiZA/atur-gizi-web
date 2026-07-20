"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

let registered = false;
function ensureGsap() {
  if (typeof window === "undefined") return false;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return true;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ensureGsap() || !ref.current) return;
    if (prefersReducedMotion()) {
      gsap.set(ref.current, { opacity: 1, y: 0 });
      return;
    }
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [y, delay, once]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export function ScrollImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!ensureGsap() || !wrap.current || !img.current) return;
    if (prefersReducedMotion()) {
      gsap.set(img.current, { scale: 1, opacity: 1 });
      return;
    }
    const el = wrap.current;
    const target = img.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { scale: 0.82, opacity: 0.55 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom 20%",
            scrub: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className={cn("overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt={alt} className={cn("h-full w-full object-cover", imgClassName)} />
    </div>
  );
}

export function ScrubWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ensureGsap() || !ref.current) return;
    const words = ref.current.querySelectorAll<HTMLElement>("[data-word]");
    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return;
    }
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "bottom 40%",
            scrub: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} data-word className="inline-block will-change-[opacity]">
          {w}
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}

export function PinSplit({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  const section = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ensureGsap() || !section.current || !pin.current) return;
    if (prefersReducedMotion()) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const el = section.current;
    const pinEl = pin.current;
    let ctx: gsap.Context | null = null;

    const setup = () => {
      ctx?.revert();
      ctx = null;
      if (!mq.matches) return;
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top top+=88",
          end: "bottom bottom",
          pin: pinEl,
          pinSpacing: false,
        });
      }, el);
    };

    setup();
    mq.addEventListener("change", setup);
    return () => {
      mq.removeEventListener("change", setup);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={section} className={cn("grid gap-10 lg:grid-cols-12 lg:gap-12", className)}>
      <div ref={pin} className="lg:col-span-4 lg:self-start">
        {left}
      </div>
      <div className="lg:col-span-8">{right}</div>
    </div>
  );
}

export function StaggerChildren({
  children,
  className,
  selector = "[data-stagger]",
}: {
  children: ReactNode;
  className?: string;
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ensureGsap() || !ref.current) return;
    const items = ref.current.querySelectorAll(selector);
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function HoverLift({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "group overflow-hidden transition-transform duration-700 ease-out will-change-transform hover:scale-[1.02]",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
