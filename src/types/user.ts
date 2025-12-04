export interface BookingConfig {
    themeColor: string;
    welcomeMessage: string;
    policies: string[];
    showSocialLinks: boolean;
    font?: 'sans' | 'serif' | 'mono';
    buttonStyle?: 'rounded' | 'pill' | 'square';

    // Contact Info Overrides
    publicPhone?: string;
    publicEmail?: string;
    instagramHandle?: string;
    tiktokHandle?: string;
}

export interface SalonUser {
    id: string;
    name: string;
    email: string;
    salonName?: string;
    bookingHandle?: string;
    logoUrl?: string;
    headerImageUrl?: string;
    brandColor?: string;
    currency?: string;
    stripeConnected?: boolean;
    bookingConfig?: BookingConfig;

    // Internal flags
    isAuthenticated?: boolean;
    onboardingComplete?: boolean;
}
