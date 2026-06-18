'use client';

import { usePrivy } from '@privy-io/react-auth';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface Briefing {
  id: string;
  drug_name: string;
  dosage: string;
  diagnosis: string;
  profile: {
    age: number;
    weight: number;
    other_medications: string;
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
  created_at: string;
}

const CONSENSUS_STEPS = [
  'Encrypting health details...',
  'Dispatching transaction to GenLayer studionet...',
  'Querying clinical databases (OpenFDA)...',
  'Validators performing independent clinical reviews...',
  'Reaching consensus on treatment safety...',
  'Storing finalized analysis on-chain...',
];

export default function Dashboard() {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  const [history, setHistory] = useState<Briefing[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form states
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [otherMedications, setOtherMedications] = useState('');
  const [allergies, setAllergies] = useState('');

  // Consensus states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consensusStep, setConsensusStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const fetchHistory = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch('/api/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchHistory();
    }
  }, [authenticated]);

  // Simulate progress steps for consensus
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setConsensusStep((prev) => {
          if (prev < CONSENSUS_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 5000); // 5 seconds per step
    } else {
      setConsensusStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName || !dosage || !diagnosis || !age || !weight) {
      setErrorMessage('Please fill out all the fields. We need this data for accurate checks.');
      return;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setConsensusStep(0);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('You must be logged in to verify treatments.');
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drugName,
          dosage,
          diagnosis,
          profile: {
            age: parseInt(age),
            weight: parseInt(weight),
            otherMedications: otherMedications || 'none',
            allergies: allergies || 'none',
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'The on-chain consensus failed to complete.');
      }

      const report = await res.json();
      // Add new briefing to history and navigate to details
      setHistory((prev) => [report, ...prev]);
      router.push(`/briefing/${report.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong during validation.');
      setIsAnalyzing(false);
    }
  };

  if (!ready || !authenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Activity size={28} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '2rem' }}>Prescription Sanity Checker</h1>
        </div>

        <div className="dashboard-grid">
          {/* Left Column: Form */}
          <div className="card card-scan">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} style={{ color: 'var(--accent)' }} />
              Request New Briefing
            </h2>

            {errorMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Prescribed Drug</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Ibuprofen"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    disabled={isAnalyzing}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Dosage</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 400mg twice daily"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    disabled={isAnalyzing}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Diagnosis / Condition</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Acute lower back pain"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  disabled={isAnalyzing}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Patient Age</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isAnalyzing}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Patient Weight (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={isAnalyzing}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Other Medications You Take (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Aspirin 81mg, Multivitamins"
                  value={otherMedications}
                  onChange={(e) => setOtherMedications(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Known Allergies (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Penicillin"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="spin" size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
                    Running On-Chain Consensus...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Verify Treatment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: History */}
          <div className="card card-scan" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Past Briefings</h2>

            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <RefreshCw className="spin" size={24} style={{ color: 'var(--accent)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--foreground-muted)' }}>
                <ClipboardList size={40} style={{ strokeWidth: '1.5', marginBottom: '12px' }} />
                <p>No briefings saved. Verify a treatment to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto' }}>
                {history.map((item) => {
                  const result = item.result;
                  const isSafe = result.is_appropriate === 'standard' && result.interactions === 'none';
                  const isWarning = result.is_appropriate === 'uncertain' || result.interactions === 'moderate';
                  const isSevere = result.is_appropriate === 'non-standard' || result.interactions === 'severe';

                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/briefing/${item.id}`)}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'border-color 0.2s ease, transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isSafe ? (
                          <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                        ) : isWarning ? (
                          <HelpCircle size={20} style={{ color: 'var(--warning)' }} />
                        ) : (
                          <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                        )}
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.drug_name}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                            For {item.diagnosis}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--foreground-muted)' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Consensus Animation Modal */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(1, 21, 8, 0.95)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: '32px' }}>
                <svg viewBox="0 0 300 100" style={{ width: '100%', height: '80px', stroke: 'var(--accent)', fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                  <path className="ecg-path" d="M0,50 L80,50 L90,30 L100,70 L110,10 L120,90 L130,50 L140,50 L150,40 L160,50 L300,50" />
                </svg>
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>On-Chain Medical Consensus</h2>
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '40px' }}>
                Validators are independently checking FDA databases and evaluating treatment safety. 
                Please do not close this window.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                {CONSENSUS_STEPS.map((step, idx) => {
                  const isDone = idx < consensusStep;
                  const isActive = idx === consensusStep;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        opacity: isDone || isActive ? 1 : 0.3,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                      ) : isActive ? (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid var(--border)',
                          }}
                        />
                      )}
                      <span style={{ fontSize: '0.95rem', fontWeight: isActive ? 500 : 400 }}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
