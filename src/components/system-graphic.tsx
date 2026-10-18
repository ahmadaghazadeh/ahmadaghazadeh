export function SystemGraphic() {
  return (
    <div className="system-graphic" role="img" aria-label="An abstract distributed system: connected services orbit a central engineering core.">
      <div className="graphic-top"><span>SYSTEMS THINKING</span><span>FIG. 01 / AA</span></div>
      <svg viewBox="0 0 520 460" fill="none" aria-hidden="true">
        <defs>
          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" opacity=".13" /></pattern>
          <linearGradient id="core" x1="210" y1="170" x2="320" y2="310" gradientUnits="userSpaceOnUse"><stop stopColor="#d5f791"/><stop offset="1" stopColor="#a3c953"/></linearGradient>
        </defs>
        <rect width="520" height="460" fill="url(#dots)" />
        <g stroke="#343936"><ellipse cx="260" cy="233" rx="205" ry="105" transform="rotate(-34 260 233)"/><ellipse cx="260" cy="233" rx="205" ry="105" transform="rotate(34 260 233)"/><circle cx="260" cy="233" r="152" strokeDasharray="3 8"/></g>
        <g stroke="#9ca68e" strokeWidth="1"><path d="M120 150 260 233 404 140M260 233 389 326M260 233 133 337" strokeDasharray="4 5"/></g>
        <g className="orbit-dot"><circle cx="83" cy="238" r="4" fill="#c6ed83"/><circle cx="437" cy="227" r="4" fill="#c6ed83"/></g>
        <path d="m260 163 67 39v77l-67 39-67-39v-77z" fill="url(#core)"/>
        <path d="m193 202 67 39 67-39M260 241v77" stroke="#6c873c"/>
        <path d="m260 182 36 21-36 21-36-21z" stroke="#6c873c"/>
        <g fill="#1d211e" stroke="#56604c"><rect x="85" y="119" width="70" height="58" rx="5"/><rect x="369" y="109" width="70" height="58" rx="5"/><rect x="354" y="301" width="70" height="58" rx="5"/><rect x="98" y="309" width="70" height="58" rx="5"/></g>
        <g stroke="#c6ed83" strokeWidth="1.5"><path d="m113 139-9 9 9 9m14-18 9 9-9 9M392 130h24m-24 7h24m-24 7h13M376 321h25v18h-25zm5 23h15M123 331h20m-20 7h20m-20 7h12"/></g>
        <g fill="#a4aa9d" fontFamily="monospace" fontSize="10"><text x="88" y="104">API</text><text x="371" y="94">EVENTS</text><text x="356" y="383">DATA</text><text x="99" y="390">SERVICES</text></g>
      </svg>
      <div className="graphic-bottom"><span><i /> CONNECTED BY DESIGN</span><span>01 — ∞</span></div>
    </div>
  );
}
