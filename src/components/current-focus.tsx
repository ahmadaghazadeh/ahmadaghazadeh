import { profile } from "@/content/profile";

export function CurrentFocus() {
  return (
    <aside className="focus-panel" aria-labelledby="focus-title">
      <h2 id="focus-title" className="focus-label">Current focus</h2>
      <p className="focus-intro">{profile.focusIntro}</p>
      <div className="focus-areas">
        {profile.focusAreas.map(area => (
          <div className="focus-card" key={area.title}>
            <h3>{area.title}</h3>
            <p>{area.description}</p>
          </div>
        ))}
      </div>
      <div className="focus-note"><span className="status-dot" /> Always learning. Always building.</div>
    </aside>
  );
}
