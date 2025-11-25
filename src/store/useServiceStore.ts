import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_MENU } from '../types/serviceSchema';
import type { MasterServiceMenu, BaseService, AddOn, NailLength, NailShape } from '../types/serviceSchema';

interface ServiceStore {
    menu: MasterServiceMenu;

    // Actions
    updateService: (id: string, updates: Partial<BaseService>) => void;
    addService: (service: BaseService) => void;
    deleteService: (id: string) => void;

    updateAddOn: (id: string, updates: Partial<AddOn>) => void;
    addAddOn: (addOn: AddOn) => void;
    deleteAddOn: (id: string) => void;

    updateLengthUpcharge: (length: NailLength, price: number) => void;
    updateShapeUpcharge: (shape: NailShape, price: number) => void;

    resetMenu: () => void;
}

export const useServiceStore = create<ServiceStore>()(
    persist(
        (set) => ({
            menu: DEFAULT_MENU,

            updateService: (id, updates) => set((state) => ({
                menu: {
                    ...state.menu,
                    services: state.menu.services.map(s => s.id === id ? { ...s, ...updates } : s)
                }
            })),

            addService: (service) => set((state) => ({
                menu: {
                    ...state.menu,
                    services: [...state.menu.services, service]
                }
            })),

            deleteService: (id) => set((state) => ({
                menu: {
                    ...state.menu,
                    services: state.menu.services.filter(s => s.id !== id)
                }
            })),

            updateAddOn: (id, updates) => set((state) => ({
                menu: {
                    ...state.menu,
                    addOns: state.menu.addOns.map(a => a.id === id ? { ...a, ...updates } : a)
                }
            })),

            addAddOn: (addOn) => set((state) => ({
                menu: {
                    ...state.menu,
                    addOns: [...state.menu.addOns, addOn]
                }
            })),

            deleteAddOn: (id) => set((state) => ({
                menu: {
                    ...state.menu,
                    addOns: state.menu.addOns.filter(a => a.id !== id)
                }
            })),

            updateLengthUpcharge: (length, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    lengthUpcharges: state.menu.lengthUpcharges.map(l => l.length === length ? { ...l, price } : l)
                }
            })),

            updateShapeUpcharge: (shape, price) => set((state) => ({
                menu: {
                    ...state.menu,
                    shapeUpcharges: state.menu.shapeUpcharges.map(s => s.shape === shape ? { ...s, price } : s)
                }
            })),

            resetMenu: () => set({ menu: DEFAULT_MENU })
        }),
        {
            name: 'lacqr-service-menu', // unique name for localStorage key
        }
    )
);
