import { create } from 'zustand';

// Estado efímero de interfaz (AGENTS.md: nunca datos del servidor aquí).
type UiState = {
  pendingInviteToken: string | null;
  pendingEmail: string | null;
  setPendingInviteToken: (token: string | null) => void;
  setPendingEmail: (email: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  pendingInviteToken: null,
  pendingEmail: null,
  setPendingInviteToken: (token) => set({ pendingInviteToken: token }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
