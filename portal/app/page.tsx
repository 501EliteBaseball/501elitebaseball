import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

const pillars = [
  {
    number: "01",
    title: "Purpose Driven",
    text: "We build players who compete with heart and play with purpose.",
  },
  {
    number: "02",
    title: "Elite Development",
    text: "High-level instruction, intentional training, and relentless improvement.",
    shield: true,
  },
  {
    number: "03",
    title: "Character First",
    text: "Building strong young people on and off the baseball field.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="public-hero">
          <div className="public-hero__overlay" />

          <div className="public-hero__content">
            <p className="section-kicker">501 Elite Baseball</p>

            <h1>
              Own Your <span>Effort.</span>
              <br />
              Own Your <span>Attitude.</span>
              <br />
              Own Your <span>Future.</span>
            </h1>

            <p className="public-hero__copy">
              Developing baseball players with purpose, character, and elite
              instruction. Doing things the right way on the field, at home,
              and in life.
            </p>

            <div className="hero-actions">
              <Link
                href="/register/start"
                className="gem-cta gem-cta--ruby"
                style={{ color: "#ffffff" }}
              >
                Create Family Account
              </Link>

              <Link href="/login" className="gem-cta gem-cta--sapphire">
                Parent Sign In
              </Link>

              <Link
                href="/staff/login"
                className="gem-cta"
                style={{
                  background: "#ffffff",
                  borderColor: "#ffffff",
                  color: "#123E74",
                }}
              >
                Staff Sign In
              </Link>
            </div>
          </div>

          <div className="pillar-grid">
            {pillars.map((pillar) => (
              <article key={pillar.title}>
                {pillar.shield ? (
                  <Image
                    src="/site/shield-card.png"
                    alt=""
                    width={110}
                    height={110}
                  />
                ) : (
                  <b>{pillar.number}</b>
                )}

                <h2>{pillar.title}</h2>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="standard-section">
          <div className="standard-section__copy">
            <p className="section-kicker section-kicker--dark">
              The 501 Standard
            </p>

            <h2>
              Better Players.
              <br />
              <span>Better People.</span>
            </h2>

            <p>
              At 501 Elite, the standard goes far beyond wins and losses. It is
              how we train, compete, lead, respond, and grow together.
            </p>

            <Link href="/training" className="text-link">
              Learn our standard <b aria-hidden="true">→</b>
            </Link>
          </div>

          <div className="standard-metrics">
            <article>
              <strong>2026</strong>
              <span>Founded</span>
            </article>

            <article>
              <strong>13</strong>
              <span>Players</span>
            </article>

            <article>
              <strong>13+</strong>
              <span>Families</span>
            </article>

            <article>
              <strong>100+</strong>
              <span>Practices Ahead</span>
            </article>
          </div>
        </section>

        <section className="launch-section">
          <div>
            <p className="section-kicker">Built for families</p>

            <h2>Everything 501 Elite, in one place.</h2>

            <p>
              Registration, team information, publications, payments, and the
              new 501 Elite OS are being brought together into one secure,
              mobile-first experience.
            </p>
          </div>

          <div className="launch-card-grid">
            <Link href="/parents">
              <span>01</span>
              <strong>Parent Hub</strong>
              <p>Season information, important links, schedules, and updates.</p>
            </Link>

            <Link href="/library">
              <span>02</span>
              <strong>Document Library</strong>
              <p>Handbooks, season guides, training resources, and publications.</p>
            </Link>

            <Link href="/os">
              <span>03</span>
              <strong>501 Elite OS</strong>
              <p>Secure registration and family account access.</p>
            </Link>
          </div>
        </section>

        <section className="home-cta">
          <Image
            src="/site/shield-primary.png"
            alt="501 Elite Baseball shield"
            width={190}
            height={190}
          />

          <div>
            <p className="section-kicker">Together. Compete. Impact.</p>
            <h2>Represent the standard the right way.</h2>
            <p>
              A premium baseball program rooted in family, development, and
              accountability.
            </p>
          </div>

          <Link href="/contact" className="gem-cta gem-cta--sapphire">
            Start a Conversation
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
