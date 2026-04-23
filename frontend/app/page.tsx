'use client';

import Link from 'next/link';
import {
  Map,
  Clock,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Users,
  Sprout,
  BarChart3,
} from 'lucide-react';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.brand}>
            <div className={styles.logoBox}>🌾</div>
            <span className={styles.brandName}>Smartseason</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#solutions" className={styles.navLink}>Solutions</Link>
            <Link href="#impact" className={styles.navLink}>Impact</Link>
            <Link href="#process" className={styles.navLink}>Process</Link>
            {!isLoading && (
              user ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <div className={styles.authCtas}>
                  <Link href="/login" className={styles.navLink}>Sign In</Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Split Layout with Vibrant Image */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>Next-Gen Agriculture</div>
            <h1 className={styles.heroTitle}>
              Empowering farmers with <br />
              <span className={styles.accent}>real-time intelligence.</span>
            </h1>
            <p className={styles.heroTagline}>
              Smartseason bridges the gap between field agents and coordinators. Track growth, mitigate risks, and maximize your harvest with our strictly functional management platform.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/register">
                <Button variant="primary" size="lg" className={styles.mainCta}>
                  Start Free Trial <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="#solutions">
                <Button variant="outline" size="lg">
                  Explore Solutions
                </Button>
              </Link>
            </div>
            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <div className={styles.avatar}>👨‍🌾</div>
                <div className={styles.avatar}>👩‍🌾</div>
                <div className={styles.avatar}>👨‍🔬</div>
              </div>
              <p>Trusted by 500+ agricultural cooperatives nationwide.</p>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2070&auto=format&fit=crop" 
              alt="Farmer in lush field" 
              className={styles.heroImage}
            />
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}><Sprout size={20} /></div>
              <div>
                <p className={styles.cardLabel}>Current Stage</p>
                <p className={styles.cardValue}>Lush Growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights - Colorful Cards */}
        <section id="solutions" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tailored Solutions</h2>
            <p className={styles.sectionSubtitle}>Everything you need to manage your fields at scale.</p>
          </div>
          
          <div className={styles.grid}>
            <div className={`${styles.card} ${styles.greenCard}`}>
              <div className={styles.cardIcon}><Map size={28} /></div>
              <h3>Field Provisioning</h3>
              <p>Map fields, assign agents, and define crop parameters in a single, streamlined interface.</p>
            </div>
            <div className={`${styles.card} ${styles.blueCard}`}>
              <div className={styles.cardIcon}><Users size={28} /></div>
              <h3>Agent Coordination</h3>
              <p>Real-time task assignment and status tracking ensures your team is always focused on what matters.</p>
            </div>
            <div className={`${styles.card} ${styles.amberCard}`}>
              <div className={styles.cardIcon}><TrendingUp size={28} /></div>
              <h3>Risk Mitigation</h3>
              <p>Our computed status logic automatically flags "At Risk" fields before problems become crises.</p>
            </div>
          </div>
        </section>

        {/* Impact Section - Large Realistic Image Overlay */}
        <section id="impact" className={styles.impactSection}>
          <div className={styles.impactGrid}>
            <div className={styles.impactImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" 
                alt="Close up of healthy crops" 
                className={styles.impactImage}
              />
            </div>
            <div className={styles.impactContent}>
              <h2 className={styles.impactTitle}>Precision data for <br /><span>higher yields.</span></h2>
              <div className={styles.impactList}>
                <div className={styles.impactItem}>
                  <CheckCircle2 size={24} className={styles.check} />
                  <div>
                    <h4>98% Accuracy</h4>
                    <p>Verified field updates ensure data you can trust for seasonal planning.</p>
                  </div>
                </div>
                <div className={styles.impactItem}>
                  <CheckCircle2 size={24} className={styles.check} />
                  <div>
                    <h4>Zero Clutter</h4>
                    <p>Strict functional design means no distractions. Just your data, your fields, your agents.</p>
                  </div>
                </div>
                <div className={styles.impactItem}>
                  <CheckCircle2 size={24} className={styles.check} />
                  <div>
                    <h4>Mobile-Ready</h4>
                    <p>Agents can post updates directly from the field with our responsive agent portal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.stat}>
            <span className={styles.statValue}>12k+</span>
            <span className={styles.statLabel}>Fields Tracked</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>450+</span>
            <span className={styles.statLabel}>Active Agents</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>95%</span>
            <span className={styles.statLabel}>Harvest Success</span>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <h2>Ready to transform your farm management?</h2>
            <p>Join the thousands of coordinators using Smartseason to secure their harvests.</p>
            <div className={styles.ctaButtons}>
              <Link href="/register">
                <Button variant="primary" size="lg">Create Your Account</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            <span className={styles.footerBrand}>🌾 Smartseason</span>
            <p>Smart agriculture for a sustainable future.</p>
          </div>
          <div className={styles.footerGroups}>
            <div className={styles.footerGroup}>
              <h4>Product</h4>
              <Link href="#">Features</Link>
              <Link href="#">API</Link>
              <Link href="#">Security</Link>
            </div>
            <div className={styles.footerGroup}>
              <h4>Company</h4>
              <Link href="#">About</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Blog</Link>
            </div>
            <div className={styles.footerGroup}>
              <h4>Legal</h4>
              <Link href="#">Terms</Link>
              <Link href="#">Privacy</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          &copy; 2026 Smartseason. Built for field-tested performance.
        </div>
      </footer>
    </div>
  );
}
