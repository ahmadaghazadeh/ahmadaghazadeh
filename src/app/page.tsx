import { Header } from "@/components/header";
import { SystemGraphic } from "@/components/system-graphic";
import { profile, workHighlights } from "@/content/profile";

function Arrow({ diagonal = true }: { diagonal?: boolean }) { return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>; }
function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) { return <div className="section-label"><span>{number} /</span> {children}</div>; }

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero shell" id="home" aria-labelledby="hero-title">
          <div className="hero-eyebrow"><span className="status-dot" /> SENIOR SOFTWARE ENGINEER <span className="eyebrow-divider">/</span> {profile.location}</div>
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="hero-intro">Hi, I’m Ahmad Aghazadeh.</p>
              <h1 id="hero-title">Scalable systems.<br /><span>Thoughtful</span><br />software<span className="lime">.</span></h1>
              <p className="hero-description">{profile.intro}</p>
              <div className="hero-actions"><a className="button button-primary" href="#work">Explore my work <Arrow diagonal={false} /></a><a className="text-link" href="#contact">Get in touch <Arrow /></a></div>
            </div>
            <SystemGraphic />
          </div>
          <div className="hero-footer"><div className="hero-facts"><span><strong>14+</strong> years of building</span><span><strong>.NET</strong> at the core</span><span><strong>End-to-end</strong> perspective</span></div><a href="#about" className="scroll-link">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a></div>
        </section>

        <section id="about" className="section about-section" aria-labelledby="about-title">
          <div className="shell"><SectionLabel number="01">THE PERSON BEHIND THE CODE</SectionLabel><div className="about-layout"><h2 id="about-title">Big-picture thinker.<br />Hands-on <span className="muted">builder.</span></h2><div className="about-copy">{profile.about.map(p => <p key={p}>{p}</p>)}<div className="about-signature"><span className="signature">Ahmad.</span><span>CURIOSITY IS A CONSTANT.</span></div></div></div></div>
        </section>

        <section id="work" className="section shell" aria-labelledby="work-title">
          <SectionLabel number="02">SELECTED ENGINEERING WORK</SectionLabel>
          <div className="section-heading"><h2 id="work-title">Complex problems.<br /><span className="muted">Practical solutions.</span></h2><p>A few systems I’ve helped shape.<br />Real work, from architecture to delivery.</p></div>
          <div className="work-grid">{workHighlights.map(work => <article key={work.number} className="work-card"><div className="work-top"><span className="mono">{work.category}</span><span className="work-number">{work.number}</span></div><p className="work-company">{work.company}</p><h3>{work.title}</h3><p className="work-challenge">{work.challenge}</p><div className="work-contribution"><span className="tiny-label">MY CONTRIBUTION</span><p>{work.contribution}</p></div><div className="tags">{work.technologies.map(tag => <span key={tag}>{tag}</span>)}</div>{work.caseStudyUrl && <a className="text-link case-link" href={work.caseStudyUrl} target="_blank" rel="noopener noreferrer">Read case study <Arrow /></a>}</article>)}</div>
          <div className="work-bottom"><p>The story continues. More project deep dives to come.</p><a className="text-link" href={profile.links[0].url} target="_blank" rel="noopener noreferrer">Explore my GitHub <Arrow /></a></div>
        </section>

        <section id="journey" className="section journey-section" aria-labelledby="journey-title"><div className="shell journey-layout"><div className="journey-intro"><SectionLabel number="03">THE JOURNEY</SectionLabel><h2 id="journey-title">Always learning.<br /><span className="muted">Always forward.</span></h2><p>From mobile experiences to distributed systems. Every chapter brings a broader perspective.</p><div className="journey-aside"><span className="tiny-label">MY APPROACH</span><p>Understand deeply.<br />Build deliberately.<br />Share what you learn.</p></div></div><ol className="timeline">{profile.experience.map((job, i) => <li key={job.company}><div className={`timeline-dot ${i === 0 ? "current" : ""}`} /><div className="job-meta"><span>{job.period}</span>{i === 0 && <span className="current-label">CURRENT</span>}</div><h3>{job.company}</h3><p className="job-role">{job.role}</p><p className="job-location">{job.location}</p><p className="job-description">{job.description}</p><div className="job-tags">{job.tags.map(tag => <span key={tag}>{tag}</span>)}</div></li>)}</ol></div></section>

        <section id="expertise" className="section shell" aria-labelledby="expertise-title"><SectionLabel number="04">TOOLS & MINDSET</SectionLabel><div className="section-heading"><h2 id="expertise-title">Depth where it matters.<br /><span className="muted">Breadth where it helps.</span></h2><p>Technology is a means.<br />Better software is the goal.</p></div><div className="expertise-grid">{profile.expertise.map(area => <article key={area.number} className="expertise-card"><span className="expertise-number">{area.number}</span><h3>{area.title}</h3><p>{area.description}</p><ul>{area.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div><div className="education"><span className="tiny-label">THE FOUNDATION</span><p>{profile.education}<span>{profile.university}</span></p><span className="education-symbol" aria-hidden="true">↗</span></div></section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="shell"><SectionLabel number="05">WHAT’S NEXT?</SectionLabel><div className="contact-heading"><h2 id="contact-title">Let’s build<br />something <span>that lasts.</span></h2><a className="contact-arrow" href={`mailto:${profile.email}`} aria-label="Email Ahmad"><Arrow /></a></div><div className="contact-bottom"><div><p>{profile.availability}</p><a className="email-link" href={`mailto:${profile.email}`}>{profile.email} <Arrow /></a></div><div className="social-links">{profile.links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <Arrow /></a>)}</div></div></div></section>
      </main>
      <footer className="footer shell"><a href="#home" className="wordmark" aria-label="Back to top">aa<span>.</span></a><p>© {new Date().getFullYear()} {profile.name}</p><span>THOUGHTFULLY ENGINEERED.</span><a href="#home" className="back-top">Back to top ↑</a></footer>
    </>
  );
}
