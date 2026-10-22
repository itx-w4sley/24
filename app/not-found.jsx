import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CircleHelp,
  Compass,
  FolderKanban,
  Home,
  LifeBuoy,
  Newspaper,
  Sparkles,
} from 'lucide-react';
import styles from './not-found.module.css';

const quickLinks = [
  { href: '/portfolio', title: 'Explore portfolio', description: 'Design work & development projects', icon: FolderKanban },
  { href: '/services', title: 'Our services', description: 'Bots, websites, branding & more', icon: Bot },
  { href: '/start', title: 'Start a project', description: 'Send a new project request', icon: Sparkles },
  { href: '/support', title: 'Get support', description: 'Contact the support centre', icon: LifeBuoy },
];

export const metadata = {
  title: 'Page not found — 404',
  description: 'That page could not be found. Explore projects, services, and support at 24xzvibx Creative Studio.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className={styles.page} id="main-content">
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            <Home size={14} aria-hidden="true" /> Studio
          </Link>
          <span className={styles.slash} aria-hidden="true">/</span>
          <span aria-current="page">404 error</span>
        </div>

        <section className={styles.hero} aria-labelledby="error-heading">
          <div className={styles.copy}>
            <span className={styles.status}><span className={styles.statusDot} /> SYSTEM NOTICE / ERROR 404</span>
            <div className={styles.errorNumber} aria-hidden="true">404<span>.</span></div>
            <h1 className={styles.title} id="error-heading">
              Looks like you took a <span className={styles.gradient}>wrong turn.</span>
            </h1>
            <p className={styles.description}>
              The page you’re looking for doesn’t exist, may have moved, or the link might be broken.
              Let’s get you back to something good.
            </p>
            <div className={styles.actions}>
              <Link href="/" className={styles.primaryButton}>
                <ArrowLeft size={17} aria-hidden="true" /> Back to the studio
              </Link>
              <Link href="/portfolio" className={styles.secondaryButton}>
                View our projects <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.helpText}>
              Think this link should work? <Link href="/support">Tell our support team <ArrowRight size={13} aria-hidden="true" /></Link>
            </p>
          </div>

          <div className={styles.artPanel} aria-hidden="true">
            <div className={styles.grid} />
            <div className={styles.artTop}><span className={styles.windowDots}><i/><i/><i/></span><span>STUDIO / ROUTE MONITOR</span><span>×</span></div>
            <div className={styles.orbitOuter} />
            <div className={styles.orbitInner} />
            <div className={styles.orbitDot} />
            <div className={styles.centerIcon}><Compass size={56} strokeWidth={1.15}/></div>
            <div className={styles.floatingLabel}><span className={styles.floatingPulse}/> SIGNAL LOST</div>
            <div className={styles.artBottom}><span>ERR_ROUTE_NOT_FOUND</span><span>404 / 404</span></div>
          </div>
        </section>

        <section className={styles.directory} aria-labelledby="directory-heading">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>FIND YOUR WAY</span>
              <h2 id="directory-heading">Where would you like to go?</h2>
            </div>
            <span className={styles.sectionHint}><CircleHelp size={15} aria-hidden="true" /> Useful links</span>
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
          <span><span className={styles.onlineDot} /> 24xzvibx Creative Studio</span>
          <Link href="/news">Studio journal <Newspaper size={14} aria-hidden="true" /></Link>
        </div>
      </div>
    </main>
  );
}
