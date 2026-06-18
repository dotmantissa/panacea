'use client';

import { usePrivy } from '@privy-io/react-auth';
import Header from '@/components/Header';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardList, ShieldAlert, HeartPulse, CheckSquare } from 'lucide-react';

export default function Home() {
  const { login, authenticated } = usePrivy();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '30%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(190, 245, 66, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
          >
            <motion.span
              variants={itemVariants}
              style={{
                background: 'var(--card-background)',
                border: '1px solid var(--border)',
                padding: '8px 18px',
                borderRadius: '99px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--accent)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '24px',
              }}
            >
              Independent medical briefing, on-chain
            </motion.span>

            <motion.h1
              variants={itemVariants}
              style={{
                fontSize: '3.5rem',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-1px',
              }}
            >
              Your doctor gave you 8 minutes. <br />
              <span style={{ color: 'var(--accent)' }}>We have as long as you need.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{
                fontSize: '1.25rem',
                color: 'var(--foreground-muted)',
                lineHeight: '1.6',
                marginBottom: '40px',
                maxWidth: '680px',
                margin: '0 auto 40px auto',
              }}
            >
              Doctor mumbled some Latin, handed you a piece of paper, and vanished? 
              Do not spiral on search engines. Panacea cross-checks your diagnosis and 
              prescription with clinical literature, running the analysis through 
              consensus on-chain to give you a plain-English sanity check.
            </motion.p>

            <motion.div variants={itemVariants}>
              {authenticated ? (
                <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
                  Enter Your Briefing Locker
                </Link>
              ) : (
                <button onClick={login} className="btn-primary">
                  Start Your Free Briefing
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginTop: '80px',
            }}
          >
            <motion.div variants={itemVariants} className="card card-scan">
              <div
                style={{
                  background: 'rgba(190, 245, 66, 0.1)',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <CheckSquare size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Treatment Standard</h3>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                We search FDA guidelines and clinical literature to verify if the treatment is 
                truly standard for your specific condition.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-scan">
              <div
                style={{
                  background: 'rgba(190, 245, 66, 0.1)',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <ClipboardList size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Dosage Checks</h3>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                We cross-check the dosage mathematical limits against your unique age, weight, and 
                kidney/liver profile.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-scan">
              <div
                style={{
                  background: 'rgba(190, 245, 66, 0.1)',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <ShieldAlert size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Drug Interactions</h3>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                Submit what you already take. We flag severe drug-to-drug or drug-to-food 
                interactions before they happen.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-scan">
              <div
                className="heartbeat-pulse"
                style={{
                  background: 'rgba(190, 245, 66, 0.1)',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <HeartPulse size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Smart Questions</h3>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                We generate a non-obvious question list to ask your doctor, turning you from a 
                passive bystander into an equal partner.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--foreground-muted)',
          fontSize: '0.9rem',
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} panacea. Medical fact-checks, secured on-chain.</p>
        </div>
      </footer>
    </div>
  );
}
