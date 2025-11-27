import type { ServiceSelection, MasterServiceMenu } from '../types/serviceSchema';

export function calculatePrice(selection: ServiceSelection, menu: MasterServiceMenu): number {
    let total = 0;

    // 1. Base Price
    total += menu.basePrices[selection.base.system] || 0;

    // 2. Length Surcharge
    total += menu.lengthSurcharges[selection.base.length] || 0;

    // 3. Global Add-ons
    total += menu.finishSurcharges[selection.addons.finish] || 0;
    total += menu.specialtySurcharges[selection.addons.specialtyEffect] || 0;
    total += menu.classicDesignSurcharges[selection.addons.classicDesign] || 0;

    // 4. Art Complexity
    if (selection.art.level) {
        total += menu.artLevelPrices[selection.art.level] || 0;
    }

    // 5. Bling & Hardware
    total += menu.blingDensityPrices[selection.bling.density] || 0;
    total += (selection.bling.xlCharmsCount || 0) * menu.unitPrices.xlCharms;
    total += (selection.bling.piercingsCount || 0) * menu.unitPrices.piercings;

    // 6. Modifiers
    total += menu.modifierSurcharges[selection.modifiers.foreignWork] || 0;
    total += (selection.modifiers.repairsCount || 0) * menu.unitPrices.repairs;

    if (selection.modifiers.soakOffOnly) {
        total += menu.unitPrices.soakOff;
    }

    // 7. Pedicure
    total += menu.pedicurePrices[selection.pedicure.type] || 0;

    // Pedicure Art Match Logic: (Hand_Art_Tier_Price * 0.5)
    if (selection.pedicure.type !== 'None' && selection.pedicure.toeArtMatch && selection.art.level) {
        const handArtPrice = menu.artLevelPrices[selection.art.level] || 0;
        total += handArtPrice * 0.5;
    }

    return total;
}
