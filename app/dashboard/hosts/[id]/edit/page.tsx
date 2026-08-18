'use client';

import { useHostStore } from '@/hooks/useHostStore';
import { useAuth } from '@/components/auth/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Step1Identity } from '@/components/host/Step1Identity';
import { Step2Appearance } from '@/components/host/Step2Appearance';
import { Step3Personality } from '@/components/host/Step3Personality';
import { Step4Speaking } from '@/components/host/Step4Speaking';
import { Step5Voice } from '@/components/host/Step5Voice';
import { Step6Behavior } from '@/components/host/Step6Behavior';
import clsx from 'clsx';
import { Host } from '@/types/host';

const STEPS = [
  { id: 1, name: 'Identity' },
  { id: 2, name: 'Appearance' },
  { id: 3, name: 'Personality' },
  { id: 4, name: 'Speaking Style' },
  { id: 5, name: 'Voice' },
  { id: 6, name: 'Behavior' },
];

export default function EditHostWizard() {
  const params = useParams();
  const id = params.id as string;
  
  const { currentStep, hostData, updateData, nextStep, prevStep, reset, setStep } = useHostStore();
  const { user, isFirebaseConfigured } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHost = async () => {
      if (!id || !user) return;
      try {
        const docRef = doc(db, 'hosts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Host;
          if (data.ownerId !== user.uid) {
            setError('You do not have permission to edit this host.');
          } else {
            // Load host data into store
            updateData(data);
            setStep(1); // start at step 1
          }
        } else {
          setError('Host not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch host data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHost();
    
    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [id, user, updateData, setStep, reset]);

  const handleSave = async () => {
    if (!user) return;
    
    // Basic validation
    if (!hostData.name || !hostData.avatarUrl || !hostData.voice.voiceId) {
      setError('Please ensure Name, Avatar, and Voice are selected before saving.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const now = new Date().toISOString();
      const hostRef = doc(db, 'hosts', id);
      await updateDoc(hostRef, {
        ...hostData,
        updatedAt: now,
      });

      reset();
      router.push('/dashboard/hosts');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save host.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-600 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Edit AI Host</h1>
        <p className="text-neutral-400">Update configuration for {hostData.name || 'your virtual host'}.</p>
      </div>

      {!isFirebaseConfigured && (
        <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
          <div>
            <h3 className="text-yellow-500 font-semibold mb-1">Firebase is not connected!</h3>
            <p className="text-sm text-yellow-200/70 mb-3">You are in Bypass Mode. You can preview this form, but saving hosts will fail because there is no database connection.</p>
            <Link href="/dashboard/settings" className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-4">
              Connect Firebase in Settings &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-between">
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center cursor-pointer" onClick={() => setStep(step.id)}>
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                currentStep === step.id
                  ? 'border-white bg-white text-black'
                  : currentStep > step.id
                  ? 'border-white bg-white/10 text-white'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-500'
              )}
            >
              {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
            </div>
            <span
              className={clsx(
                'mt-2 text-xs font-medium',
                currentStep >= step.id ? 'text-white' : 'text-neutral-600'
              )}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Wizard Content */}
      <div className="min-h-[400px] rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-2xl backdrop-blur-sm md:p-10">
        {currentStep === 1 && <Step1Identity />}
        {currentStep === 2 && <Step2Appearance />}
        {currentStep === 3 && <Step3Personality />}
        {currentStep === 4 && <Step4Speaking />}
        {currentStep === 5 && <Step5Voice />}
        {currentStep === 6 && <Step6Behavior />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-transparent px-5 py-2.5 font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {currentStep < 6 ? (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSubmitting || !isFirebaseConfigured}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-transparent px-6 py-2.5 font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSubmitting || !isFirebaseConfigured}
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'} <Save className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
