"use client";

import { useEffect, useRef, useState } from "react";

const items = [["About", "about"], ["Work", "work"], ["Journey", "journey"], ["Expertise", "expertise"]];

export function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className="header">
      <div className="shell header-inner">
        <a className="wordmark" href="#home" aria-label="Ahmad Aghazadeh, home" onClick={() => setOpen(false)}>aa<span>.</span></a>
        <span className="header-note">ENGINEERING WITH INTENT</span>
        <button ref={button} className="menu-button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? "Close −" : "Menu +"}</button>
        <nav id="main-navigation" aria-label="Main navigation" className={open ? "navigation is-open" : "navigation"}>
          {items.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}
