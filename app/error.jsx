'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CircleHelp,
  CloudOff,
  FolderKanban,
  Home,
  LifeBuoy,
  RefreshCcw,
  RotateCw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import styles from './error.module.css';

const quickLinks = [
  { href: '/portfolio', title: 'Browse projects', description: 'Explore the studio portfolio', icon: FolderKanban },
  { href: '/services', title: 'Explore services', description: 'Discord bots, websites & more', icon: Bot },
  { href: '/start', title: 'Start a project', description: 'Send a new project enquiry', icon: Sparkles },
  { href: '/support', title: 'Support centre', description: 'Report a problem or ask for help', icon: LifeBuoy },
];

/** Next.js App Router route error boundary. Do not reveal raw exception messages or stack traces to visitors. */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Detailed logs are available to developers locally; the public UI only exposes an opaque digest.
    if (process.env.NODE_ENV === 'development' && error) console.error('Studio route error:', error);
  }, [error]);

  const reference = typeof error?.digest === 'string' ? error.digest : null;

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />

      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            <Home size={14} aria-hidden="true" /> Studio
          </Link>
          <span className={styles.slash} aria-hidden="true">/</span>
          <span aria-current="page">Unexpected error</span>
        </nav>

        <section className={styles.hero} aria-labelledby="error-heading">
          <div className={styles.copy}>
            <span className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              SYSTEM NOTICE / SOMETHING WENT WRONG
            </span>

            <div className={`${styles.errorNumber} ${styles.errorWord}`} aria-hidden="true">
              Oops<span>.</span>
            </div>
            <h1 className={styles.title} id="error-heading">
              The studio hit a <span className={styles.gradient}>small glitch.</span>
            </h1>
            <p className={styles.description}>
              Something interrupted this page while it was loading. You can try again, return
              to the homepage, or contact support if it keeps happening.
            </p>

            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={() => reset()}>
                <RefreshCcw size={17} aria-hidden="true" /> Try again
              </button>
              <Link href="/" className={styles.secondaryButton}>
                <ArrowLeft size={17} aria-hidden="true" /> Back to the studio
              </Link>
              <button
                className={styles.tertiaryButton}
                type="button"
                onClick={() => window.location.reload()}
              >
                <RotateCw size={16} aria-hidden="true" /> Reload page
              </button>
            </div>

            {reference ? (
              <div className={styles.reference}>
                <span>ERROR REFERENCE</span>
                <code>{reference}</code>
                <p>Include this reference if you report the issue.</p>
              </div>
            ) : (
              <p className={styles.helpText}>
                Still having trouble? <Link href="/support">Contact the support centre <ArrowRight size={13} aria-hidden="true" /></Link>
              </p>
            )}
          </div>

          <div className={`${styles.artPanel} ${styles.errorArt}`} aria-hidden="true">
            <div className={styles.grid} />
            <div className={styles.artTop}>
              <span className={styles.windowDots}><i /><i /><i /></span>
              <span>STUDIO / RECOVERY CONSOLE</span>
              <span>×</span>
            </div>
            <div className={styles.orbitOuter} />
            <div className={styles.orbitInner} />
            <div className={styles.orbitDot} />
            <div className={styles.centerIcon}>
              <TriangleAlert size={58} strokeWidth={1.25} />
            </div>
            <div className={styles.floatingLabel}>
              <span className={styles.floatingPulse} /> RETRY AVAILABLE
            </div>
            <div className={styles.artBottom}>
              <span>ERR_UNEXPECTED_RENDER</span><span>RECOVERY / READY</span>
            </div>
          </div>
        </section>

        <section className={styles.directory} aria-labelledby="help-heading">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>LET'S GET YOU MOVING</span>
              <h2 id="help-heading">You can still explore the studio.</h2>
            </div>
            <span className={styles.sectionHint}><CircleHelp size={15} aria-hidden="true" /> Other destinations</span>
          </div>
          <div className={styles.cards}>
            {quickLinks.map(({ href, title, description, icon: Icon }) => (
              <Link className={styles.card} href={href} key={href}>
                <span className={styles.cardIcon}><Icon size={21} aria-hidden="true" /></span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{title}</span>
                  <span className={styles.cardDescription}>{description}</span>
                </span>
                <ArrowUpRight className={styles.cardArrow} size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.bottomLine}>
          <span><CloudOff size={14} aria-hidden="true" /> 24xzvibx Creative Studio</span>
          <Link href="/support">Need help? <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </div>
    </main>
  );
}
