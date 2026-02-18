import { configureStore } from '@reduxjs/toolkit';
import profileSlice from  './profileSlice'
import Chats from './chat';
import Matches from './matches';
// 🔴 Empty reducer object for now
export const store = configureStore({
  reducer: {
    profileSlice:profileSlice,
    chats:Chats,
    matches:Matches
  },
   
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
