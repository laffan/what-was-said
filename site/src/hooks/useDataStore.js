import { create } from 'zustand'

const useDataStore = create((set) => ({
  texts: [],
  addText: (text) => set((state) => ({ texts: [...state.texts, text] })),

}))

export default useDataStore;