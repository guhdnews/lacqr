import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_MENU } from '../types/serviceSchema';
import type {
    MasterServiceMenu,
    SystemType,
    NailLength,
    FinishType,
    SpecialtyEffect,
    ClassicDesign,
    ArtLevel,
    BlingDensity,
    ForeignWork,
    PedicureType
} from '../types/serviceSchema';

interface ServiceStore {
    menu: MasterServiceMenu;

    // Actions for Base Prices
    updateBasePrice: (system: SystemType, price: number) => void;
    updateLengthSurcharge: (length: NailLength, price: number) => void;

    // Actions for Add-ons
    updateFinishSurcharge: (finish: FinishType, price: number) => void;
    updateSpecialtySurcharge: (effect: SpecialtyEffect, price: number) => void;
    updateClassicDesignSurcharge: (design: ClassicDesign, price: number) => void;

    // Actions for Art & Bling
    updateArtLevelPrice: (level: ArtLevel, price: number) => void;
    updateBlingDensityPrice: (density: BlingDensity, price: number) => void;

    // Actions for Unit Prices
    updateUnitPrice: (item: 'xlCharms' | 'piercings' | 'repairs' | 'soakOff', price: number) => void;

    // Actions for Modifiers
    updateModifierSurcharge: (modifier: ForeignWork, price: number) => void;

    // Actions for Pedicure
    updatePedicurePrice: (type: PedicureType, price: number) => void;

    // Generic Actions for Dynamic Menu
    addItem: (
        category: keyof MasterServiceMenu,
        key: string,
        price: number,
        duration?: number
    ) => void;

    removeItem: (
        category: keyof MasterServiceMenu,
        key: string
    ) => void;

    reorderCategory: (
        category: keyof MasterServiceMenu,
        newItems: Record<string, number>
    ) => void;

    resetMenu: () => void;
}

export const useServiceStore = create<ServiceStore>()(
    persist(
        (set) => ({
            menu: DEFAULT_MENU,

            updateBasePrice: (system, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    basePrices: { ...state.menu.basePrices, [system]: price }
                }
            })),

            updateLengthSurcharge: (length, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    lengthSurcharges: { ...state.menu.lengthSurcharges, [length]: price }
                }
            })),

            updateFinishSurcharge: (finish, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    finishSurcharges: { ...state.menu.finishSurcharges, [finish]: price }
                }
            })),

            updateSpecialtySurcharge: (effect, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    specialtySurcharges: { ...state.menu.specialtySurcharges, [effect]: price }
                }
            })),

            updateClassicDesignSurcharge: (design, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    classicDesignSurcharges: { ...state.menu.classicDesignSurcharges, [design]: price }
                }
            })),

            updateArtLevelPrice: (level, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    artLevelPrices: { ...state.menu.artLevelPrices, [level]: price }
                }
            })),

            updateBlingDensityPrice: (density, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    blingDensityPrices: { ...state.menu.blingDensityPrices, [density]: price }
                }
            })),

            updateUnitPrice: (item, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    unitPrices: { ...state.menu.unitPrices, [item]: price }
                }
            })),

            updateModifierSurcharge: (modifier, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    modifierSurcharges: { ...state.menu.modifierSurcharges, [modifier]: price }
                }
            })),

            updatePedicurePrice: (type, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    pedicurePrices: { ...state.menu.pedicurePrices, [type]: price }
                }
            })),

            addItem: (category, key, price, duration = 0) => set((state) => {
                const newMenu = { ...state.menu };

                // 1. Add to the price map
                // @ts-ignore - Dynamic access is safe here due to relaxed types
                newMenu[category] = { ...newMenu[category], [key]: price };

                // 2. Add to durations if applicable
                // Map category to duration category
                const durationMap: Record<string, string> = {
                    'basePrices': 'base',
                    'fillPrices': 'fill',
                    'lengthSurcharges': 'length',
                    'shapeSurcharges': 'shape',
                    'artLevelPrices': 'art',
                    'blingDensityPrices': 'bling',
                    'pedicurePrices': 'pedicure'
                };

                const durationKey = durationMap[category];
                if (durationKey && newMenu.durations) {
                    // @ts-ignore
                    newMenu.durations[durationKey] = {
                        // @ts-ignore
                        ...newMenu.durations[durationKey],
                        [key]: duration
                    };
                }

                return { menu: newMenu };
            }),

            removeItem: (category, key) => set((state) => {
                const newMenu = { ...state.menu };

                // 1. Remove from price map
                // @ts-ignore
                const { [key]: _, ...rest } = newMenu[category];
                // @ts-ignore
                newMenu[category] = rest;

                // 2. Remove from durations if applicable
                const durationMap: Record<string, string> = {
                    'basePrices': 'base',
                    'fillPrices': 'fill',
                    'lengthSurcharges': 'length',
                    'shapeSurcharges': 'shape',
                    'artLevelPrices': 'art',
                    'blingDensityPrices': 'bling',
                    'pedicurePrices': 'pedicure'
                };

                const durationKey = durationMap[category];
                if (durationKey && newMenu.durations) {
                    // @ts-ignore
                    const { [key]: __, ...restDurations } = newMenu.durations[durationKey];
                    // @ts-ignore
                    newMenu.durations[durationKey] = restDurations;
                }

                return { menu: newMenu };
            }),

            reorderCategory: (category, newItems) => set((state) => ({
                menu: {
                    ...state.menu,
                    [category]: newItems
                }
            })),

            resetMenu: () => set({ menu: DEFAULT_MENU })
        }),
        {
            name: 'lacqr-service-menu-v3', // Bump version to force migration if needed, or just keep v2 if compatible
        }
    )
);
