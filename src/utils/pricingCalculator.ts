import type { ServiceSelection, MasterServiceMenu } from '../types/serviceSchema';

export interface PriceResult {
    total: number;
    breakdown: {
        base: number;
        length: number;
        shape: number;
        addons: number;
        art: number;
        bling: number;
        modifiers: number;
        pedicure: number;
        extras: number;
        complexitySurcharge: number;
    };
}

export function calculatePrice(selection: ServiceSelection, menu: MasterServiceMenu): PriceResult {
    let breakdown = {
        base: 0,
        length: 0,
        shape: 0,
        addons: 0,
        art: 0,
        bling: 0,
        modifiers: 0,
        pedicure: 0,
        extras: 0,
        complexitySurcharge: 0
    };

    // 1. Base Price (Full Set vs Fill)
    if (selection.base.isFill) {
        breakdown.base += menu.fillPrices[selection.base.system] || 0;
    } else {
        breakdown.base += menu.basePrices[selection.base.system] || 0;
    }

    // 2. Length Surcharge
    breakdown.length += menu.lengthSurcharges[selection.base.length] || 0;

    // 3. Shape Surcharge
    breakdown.shape += menu.shapeSurcharges[selection.base.shape] || 0;

    // 4. Global Add-ons
    breakdown.addons += menu.finishSurcharges[selection.addons.finish] || 0;
    breakdown.addons += menu.specialtySurcharges[selection.addons.specialtyEffect] || 0;
    breakdown.addons += menu.classicDesignSurcharges[selection.addons.classicDesign] || 0;

    // 5. Art Complexity
    if (selection.art.level) {
        breakdown.art += menu.artLevelPrices[selection.art.level] || 0;
    }

    // 6. Bling & Hardware
    breakdown.bling += menu.blingDensityPrices[selection.bling.density] || 0;
    breakdown.bling += (selection.bling.xlCharmsCount || 0) * menu.unitPrices.xlCharms;
    breakdown.bling += (selection.bling.piercingsCount || 0) * menu.unitPrices.piercings;

    // 7. Modifiers
    breakdown.modifiers += menu.modifierSurcharges[selection.modifiers.foreignWork] || 0;
    breakdown.modifiers += (selection.modifiers.repairsCount || 0) * menu.unitPrices.repairs;

    if (selection.modifiers.soakOffOnly) {
        breakdown.modifiers += menu.unitPrices.soakOff;
    }

    // 8. Pedicure
    breakdown.pedicure += menu.pedicurePrices[selection.pedicure.type] || 0;

    // Pedicure Art Match Logic: (Hand_Art_Tier_Price * 0.5)
    if (selection.pedicure.type !== 'None' && selection.pedicure.toeArtMatch && selection.art.level) {
        const handArtPrice = menu.artLevelPrices[selection.art.level] || 0;
        breakdown.pedicure += handArtPrice * 0.5;
    }

    // 9. Extras
    if (selection.extras) {
        breakdown.extras = selection.extras.reduce((sum, item) => sum + item.price, 0);
    }

    let total = breakdown.base + breakdown.length + breakdown.shape + breakdown.addons + breakdown.art + breakdown.bling + breakdown.modifiers + breakdown.pedicure + breakdown.extras;

    // 10. Time-Based Sanity Check (Hourly Rate)
    const HOURLY_RATE = 45; // $45/hour
    if (selection.estimatedDuration) {
        const timeBasedPrice = (selection.estimatedDuration / 60) * HOURLY_RATE;
        if (timeBasedPrice > total) {
            breakdown.complexitySurcharge = timeBasedPrice - total;
            total = timeBasedPrice;
        }
    }

    return {
        total: Math.ceil(total),
        breakdown
    };
}

export function calculateDuration(selection: ServiceSelection, menu: MasterServiceMenu): number {
    let minutes = 0;

    // 1. Base Duration
    minutes += menu.durations.base[selection.base.system] || 0;

    // 2. Length Duration
    minutes += menu.durations.length[selection.base.length] || 0;

    // 3. Shape Duration
    minutes += menu.durations.shape[selection.base.shape] || 0;

    // 4. Art Duration
    if (selection.art.level) {
        minutes += menu.durations.art[selection.art.level] || 0;
    }

    // 5. Bling Duration
    minutes += menu.durations.bling[selection.bling.density] || 0;

    // 6. Pedicure Duration
    minutes += menu.durations.pedicure[selection.pedicure.type] || 0;

    // 7. Removal
    if (selection.modifiers.foreignWork === 'Foreign Removal' || selection.modifiers.soakOffOnly) {
        minutes += menu.durations.removal;
    }

    return minutes;
}

export const DEFAULT_MENU: MasterServiceMenu = {
    basePrices: {
        'Acrylic': 50,
        'Gel-X': 60,
        'Hard Gel': 65,
        'Structure Gel': 55
    },
    fillPrices: {
        'Acrylic': 40,
        'Gel-X': 50,
        'Hard Gel': 55,
        'Structure Gel': 45
    },
    lengthSurcharges: {
        'Short': 0,
        'Medium': 5,
        'Long': 10,
        'XL': 15,
        'XXL': 25
    },
    shapeSurcharges: {
        'Square': 0,
        'Coffin': 5,
        'Stiletto': 5,
        'Almond': 5,
        'Duck': 10,
        'Squoval': 0,
        'Ballerina': 5,
        'Lipstick': 5
    },
    finishSurcharges: {
        'Glossy': 0,
        'Matte': 5
    },
    specialtySurcharges: {
        'None': 0,
        'Chrome': 15,
        'Cat Eye': 15,
        'Holo': 15
    },
    classicDesignSurcharges: {
        'None': 0,
        'French Tip': 15,
        'Ombre': 15
    },
    artLevelPrices: {
        'Level 1': 10,
        'Level 2': 25,
        'Level 3': 45,
        'Level 4': 70
    },
    blingDensityPrices: {
        'None': 0,
        'Minimal': 10,
        'Moderate': 25,
        'Heavy': 45
    },
    modifierSurcharges: {
        'None': 0,
        'Foreign Fill': 15,
        'Foreign Removal': 20
    },
    pedicurePrices: {
        'None': 0,
        'Classic': 35,
        'Gel': 50,
        'Acrylic Toe Set': 65
    },
    unitPrices: {
        xlCharms: 5,
        piercings: 5,
        repairs: 5,
        soakOff: 15
    },
    durations: {
        base: { 'Acrylic': 60, 'Gel-X': 45, 'Hard Gel': 75, 'Structure Gel': 60 },
        fill: { 'Acrylic': 45, 'Gel-X': 45, 'Hard Gel': 45, 'Structure Gel': 30 },
        length: { 'Short': 0, 'Medium': 10, 'Long': 20, 'XL': 30, 'XXL': 45 },
        shape: { 'Square': 0, 'Coffin': 10, 'Stiletto': 15, 'Almond': 10, 'Duck': 20, 'Squoval': 0, 'Ballerina': 10, 'Lipstick': 10 },
        art: { 'Level 1': 15, 'Level 2': 30, 'Level 3': 60, 'Level 4': 90 },
        bling: { 'None': 0, 'Minimal': 10, 'Moderate': 20, 'Heavy': 30 },
        pedicure: { 'None': 0, 'Classic': 30, 'Gel': 45, 'Acrylic Toe Set': 60 },
        removal: 30
    }
};
