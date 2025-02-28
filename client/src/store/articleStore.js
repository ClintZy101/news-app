import {create} from 'zustand';

const useArticleStore = create((set) => ({
  article: {},
  setArticleData: (article) => set({ article }),
}));

export default useArticleStore;
