import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: async (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // Ensure that `user` is defined and has the `blocked` property
    if (!currentUser) return;

    if (user && user.blocked) {
      // CHECK IF CURRENT USER IS BLOCKED
      if (user.blocked.includes(currentUser.id)) {
        return set({
          chatId,
          user: null,
          isCurrentUserBlocked: true,
          isReceiverBlocked: false,
        });
      }

      // CHECK IF RECEIVER IS BLOCKED
      else if (currentUser.blocked.includes(user.id)) {
        return set({
          chatId,
          user,
          isCurrentUserBlocked: false,
          isReceiverBlocked: true,
        });
      }
    } else {
      // Handle case when `user` is undefined or doesn't have `blocked` property
      console.error('User is undefined or does not have the blocked property.');
    }

    return set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
