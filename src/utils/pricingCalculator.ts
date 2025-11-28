import type { ServiceSelection, MasterServiceMenu } from '../types/serviceSchema';

export interface PriceResult {
    total: number;
    breakdown: {
        base: number;
        length: number;
        shape: number; // Added Shape
        addons: number;
        art: number;
        bling: number;
        modifiers: number;
        pedicure: number;
        extras: number; // Added Extras
        complexitySurcharge: number;
    };
}

export function calculatePrice(selection: ServiceSelection, menu: MasterServiceMenu): PriceResult {
    let breakdown = {
        base: 0,
        length: 0,
        shape: 0, // Added Shape
        addons: 0,
        art: 0,
        bling: 0,
        modifiers: 0,
        pedicure: 0,
        extras: 0, // Added Extras
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
    // User Note: Techs are "faster", user requested $45/hr base rate.
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

    // 3. Art Duration
    if (selection.art.level) {
        minutes += menu.durations.art[selection.art.level] || 0;
    }

    // 4. Bling Duration
    minutes += menu.durations.bling[selection.bling.density] || 0;

    // 5. Pedicure Duration
    minutes += menu.durations.pedicure[selection.pedicure.type] || 0;

    // 6. Removal
    if (selection.modifiers.foreignWork === 'Foreign Removal' || selection.modifiers.soakOffOnly) {
        minutes += menu.durations.removal;
    }

    return minutes;
}
