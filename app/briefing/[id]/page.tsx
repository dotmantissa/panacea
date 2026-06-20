'use client';

import { usePrivy } from '@privy-io/react-auth';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ClipboardList,
  User,
  Heart,
  MessageSquare,
  Network,
  Info,
} from 'lucide-react';

interface Briefing {
  id: string;
  drug_name: string;
  dosage: string;
  diagnosis: string;
  profile: {
    age: number;
    weight: number;
    otherMedications: string;
    allergies: string;
  };
  result: {
    is_appropriate: 'standard' | 'non-standard' | 'uncertain';
    is_appropriate_reason: string;
    dosage_check: 'appropriate' | 'inappropriate' | 'uncertain';
    dosage_check_reason: string;
    interactions: 'none' | 'moderate' | 'severe';
    interactions_reason: string;
    questions: string[];
    summary: string;
  };
  tx_hash: string;
  contract_address: string;
  created_at: string;
}

export default function BriefingDetail({ params }: { params: { id: string } }) {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const res = await fetch(`/api/briefing/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Could not find this briefing. Check if it is yours.');
        }

        const data = await res.json();
        setBriefing(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load briefing.');
      } finally {
        setLoading(false);
      }
    };

    if (authenticated) {
      fetchBriefing();
    }
  }, [authenticated, params.id]);

  if (!ready || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="container" style={{ flex: 1, padding: '80px 24px', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h2>Briefing Error</h2>
          <p style={{ color: 'var(--foreground-muted)', margin: '12px 0 24px 0' }}>{error || 'Briefing could not be loaded.'}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const { result } = briefing;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-secondary"
          style={{
            marginBottom: '32px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={16} />
          Back to Locker
        </button>

        {/* Prescription Overview Header */}
        <div
          className="card"
          style={{
            marginBottom: '32px',
            background: 'linear-gradient(135deg, var(--card-background) 0%, rgba(0, 67, 24, 0.2) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}
              >
                <ClipboardList size={14} />
                Prescription Briefing
              </span>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{briefing.drug_name}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--foreground-muted)' }}>
                Prescribed for: <strong>{briefing.diagnosis}</strong>
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                width: '100%',
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground-muted)' }}>
                <User size={16} style={{ color: 'var(--accent)' }} />
                <span>
                  Profile: {briefing.profile.age} yrs | {briefing.profile.weight} kg
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground-muted)' }}>
                <Heart size={16} style={{ color: 'var(--accent)' }} />
                <span>Other meds: {briefing.profile.otherMedications || 'None'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--foreground-muted)' }}>
                <Calendar size={16} style={{ color: 'var(--accent)' }} />
                <span>Checked: {new Date(briefing.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Briefing Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Clinical Appropriateness */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Treatment Guideline Review
              </h3>
              {result.is_appropriate === 'standard' ? (
                <span
                  style={{
                    color: 'var(--success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Standard Protocol
                </span>
              ) : result.is_appropriate === 'uncertain' ? (
                <span
                  style={{
                    color: 'var(--warning)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--warning)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Uncertain Guideline
                </span>
              ) : (
                <span
                  style={{
                    color: 'var(--danger)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--danger)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Atypical Guideline
                </span>
              )}
            </div>
            <p style={{ lineHeight: '1.6', color: 'var(--foreground-muted)' }}>{result.is_appropriate_reason}</p>
          </div>

          {/* 2. Dosage Audit */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Dosage Configuration Audit
              </h3>
              {result.dosage_check === 'appropriate' ? (
                <span
                  style={{
                    color: 'var(--success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Appropriate Dosage
                </span>
              ) : result.dosage_check === 'uncertain' ? (
                <span
                  style={{
                    color: 'var(--warning)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--warning)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Uncertain Dosage
                </span>
              ) : (
                <span
                  style={{
                    color: 'var(--danger)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--danger)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Atypical Dosage
                </span>
              )}
            </div>
            <p style={{ lineHeight: '1.6', color: 'var(--foreground-muted)' }}>{result.dosage_check_reason}</p>
          </div>

          {/* 3. Drug Interactions */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Interaction Warnings
              </h3>
              {result.interactions === 'none' ? (
                <span
                  style={{
                    color: 'var(--success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  No Severe Interactions
                </span>
              ) : result.interactions === 'moderate' ? (
                <span
                  style={{
                    color: 'var(--warning)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--warning)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Moderate Warnings
                </span>
              ) : (
                <span
                  style={{
                    color: 'var(--danger)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--danger)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Severe Interaction Risk
                </span>
              )}
            </div>
            <p style={{ lineHeight: '1.6', color: 'var(--foreground-muted)' }}>{result.interactions_reason}</p>
          </div>

          {/* 4. Questions for Doctor */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <MessageSquare style={{ color: 'var(--accent)' }} size={22} />
              Crucial Questions For Your Next Visit
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.1)',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    lineHeight: '1.4',
                  }}
                >
                  <strong>{idx + 1}.</strong> {q}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Plain-English Summary */}
          <div className="card" style={{ background: 'var(--primary)', border: 'none' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#bef542' }}>
              Plain English Briefing Summary
            </h3>
            <p style={{ lineHeight: '1.6', color: '#e0f4e7', fontSize: '1.05rem' }}>{result.summary}</p>
          </div>

          {/* 6. On-Chain Audit Trail */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Network size={20} style={{ color: 'var(--accent)' }} />
              On Chain Audit Records
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>Smart Contract Address:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--foreground)' }}>{briefing.contract_address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>Transaction Hash:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--foreground)' }}>{briefing.tx_hash}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                }}
              >
                <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>
                  This second opinion was validated by independent validators on the GenLayer Studio Network. 
                  This briefing is not medical advice, but data driven intelligence to support your healthcare conversations.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--foreground-muted)',
          fontSize: '0.9rem',
          marginTop: '60px',
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} panacea. Medical fact checks, secured on chain.</p>
        </div>
      </footer>
    </div>
  );
}
