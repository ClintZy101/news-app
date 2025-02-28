import { create } from "zustand";

const useTagsStore = create((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
}));

export default useTagsStore;
