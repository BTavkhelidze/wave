import { create } from 'zustand';

interface IMenu {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useMenu = create<IMenu>((set) => ({
  open: false,
  openMenu: () => set(() => ({ open: true })),
  closeMenu: () => set(() => ({ open: false })),
}));
