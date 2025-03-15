// hooks/useActiveList.ts
import { create } from 'zustand';

// hooks/useActiveList.ts
interface Member {
  id: string;
  email: string;  // Add email
  lastSeen: Date;
  activeStatus: boolean;
}

interface ActiveListStore {
  members: Member[];
  add: (member: Member) => void;
  remove: (id: string) => void;
  set: (members: Member[]) => void;
  updateStatus: (id: string, status: Partial<Member>) => void;
}

const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (member) => set((state) => ({
    members: [...state.members, member]
  })),
  remove: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id)
  })),
  set: (members) => set({ members }),
  updateStatus: (id, status) => set((state) => ({
    members: state.members.map((m) => 
      m.id === id ? { ...m, ...status } : m
    )
  }))
}));

export default useActiveList;