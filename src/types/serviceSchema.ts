export type SystemType = 'Acrylic' | 'Gel-X' | 'Hard Gel' | 'Structure Gel';
export type NailShape = 'Square' | 'Coffin' | 'Stiletto' | 'Almond';
export type NailLength = 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL';
export type FinishType = 'Glossy' | 'Matte';
export type SpecialtyEffect = 'None' | 'Chrome' | 'Holo' | 'Cat Eye';
export type ClassicDesign = 'None' | 'French Tip' | 'Ombre';
export type ArtLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
export type BlingDensity = 'None' | 'Minimal' | 'Moderate' | 'Heavy';
export type ForeignWork = 'None' | 'Foreign Fill' | 'Foreign Removal';
export type PedicureType = 'None' | 'Classic' | 'Gel' | 'Acrylic Toe Set';

// The "Bill of Materials" (BOM) - What the client wants
export interface ServiceSelection {
    base: {
        system: SystemType;
        shape: NailShape;
        length: NailLength;
    };
    addons: {
        finish: FinishType;
        specialtyEffect: SpecialtyEffect;
        classicDesign: ClassicDesign;
    };
    art: {
        level: ArtLevel | null; // null means no art (Level 0)
    };
    bling: {
        density: BlingDensity;
        xlCharmsCount: number;
        piercingsCount: number;
    };
    modifiers: {
        foreignWork: ForeignWork;
        repairsCount: number;
        soakOffOnly: boolean;
    };
    pedicure: {
        type: PedicureType;
        toeArtMatch: boolean;
    };
    visual_description?: string;
}

// The "Menu" - Prices for each option
export interface MasterServiceMenu {
    basePrices: Record<SystemType, number>;
    lengthSurcharges: Record<NailLength, number>;
    finishSurcharges: Record<FinishType, number>;
    specialtySurcharges: Record<SpecialtyEffect, number>;
    classicDesignSurcharges: Record<ClassicDesign, number>;
    artLevelPrices: Record<ArtLevel, number>;
    blingDensityPrices: Record<BlingDensity, number>;
    unitPrices: {
        xlCharms: number;
        piercings: number;
        repairs: number;
        soakOff: number;
    };
    modifierSurcharges: Record<ForeignWork, number>;
    pedicurePrices: Record<PedicureType, number>;
}

export const DEFAULT_MENU: MasterServiceMenu = {
    basePrices: {
        'Acrylic': 55,
        'Gel-X': 65,
        'Hard Gel': 60,
        'Structure Gel': 50
    },
    lengthSurcharges: {
        'Short': 0,
        'Medium': 5,
        'Long': 10,
        'XL': 15,
        'XXL': 20
    },
    finishSurcharges: {
        'Glossy': 0,
        'Matte': 5
    },
    specialtySurcharges: {
        'None': 0,
        'Chrome': 15,
        'Holo': 15,
        'Cat Eye': 15
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
        'Heavy': 50
    },
    unitPrices: {
        xlCharms: 5,
        piercings: 5,
        repairs: 5,
        soakOff: 20
    },
    modifierSurcharges: {
        'None': 0,
        'Foreign Fill': 15,
        'Foreign Removal': 25
    },
    pedicurePrices: {
        'None': 0,
        'Classic': 35,
        'Gel': 50,
        'Acrylic Toe Set': 65
    }
};

// Legacy types to keep build from exploding immediately (marked deprecated)
/** @deprecated */
export interface BaseService { id: string; name: string; category: any; tier: any; basePrice: number; durationMinutes: number; }
/** @deprecated */
export interface AddOn { id: string; name: string; price: number; durationMinutes: number; keywords: string[]; }
