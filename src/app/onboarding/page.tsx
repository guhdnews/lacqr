'use client';

import { Suspense } from 'react';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function Onboarding() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OnboardingWizard />
        </Suspense>
    );
}
