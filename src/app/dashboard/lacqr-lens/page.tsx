/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Camera, X, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, HelpCircle, ArrowRight, ArrowLeft, ThumbsUp, ThumbsDown, History, RefreshCw, Scan, Sparkles, CheckCircle2, BrainCircuit } from 'lucide-react';
import { AI_SERVICE } from '@/services/ai';
import { isImageBlurry, compressImage } from '@/utils/imageProcessing';
import { collection, addDoc, doc, getDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceSelection } from '@/types/serviceSchema';
import type { Client } from '@/types/client';
import ScanningOverlay from '@/components/ScanningOverlay';
import { useCooldown } from '@/hooks/useCooldown';
import HelpModal from '@/components/HelpModal';
import { useServiceStore } from '@/store/useServiceStore';
import { useAppStore } from '@/store/useAppStore';
import ServiceConfigurator from '@/components/ServiceConfigurator';
import { calculatePrice } from '@/utils/pricingCalculator';
import { ReceiptBuilder } from '@/components/admin/ReceiptBuilder';
import ClientModal from '@/components/ClientModal';
import FeedbackModal from '@/components/FeedbackModal';
import GettingStartedWidget from '@/components/GettingStartedWidget';

type LensStep = 'scan' | 'configure' | 'receipt';

function LacqrLensContent() {
    const { menu } = useServiceStore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [image, setImage] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('lacqr_lens_image');
        return null;
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lacqr_lens_result');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [step, setStep] = useState<LensStep>(() => {
        if (typeof window !== 'undefined') return (localStorage.getItem('lacqr_lens_step') as LensStep) || 'scan';
        return 'scan';
    });
    const [mode, setMode] = useState<'diagnostics' | 'design'>('design');

    // History State
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const { user } = useAppStore();

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const q = query(
                    collection(db, 'quotes'),
                    where('userId', '==', user.id),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const snapshot = await getDocs(q);
                const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentScans(scans);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, [user?.id, step]); // Re-fetch when step changes (e.g. after saving a quote)

    // Persistence Effects
    useEffect(() => {
        try {
            if (image) localStorage.setItem('lacqr_lens_image', image);
            else localStorage.removeItem('lacqr_lens_image');
        } catch (e) {
            <LacqrLensContent />
        </Suspense >
    );
}
