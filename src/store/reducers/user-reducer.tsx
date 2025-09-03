import {createSlice} from '@reduxjs/toolkit';

type Props = {
  userInfo: any;
  language: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notifications: any[];
  wallet: any;
  configData: any;
  role: string;
  unreadNotification: number;
  countries: any[];
};
const initialState: Props = {
  userInfo: null,
  language: 'en',
  location: undefined,
  notifications: [],
  wallet: {},
  configData: {},
  role: '',
  unreadNotification: 0,
  countries: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    reset: (state, action) => {
      state = initialState;
    },
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadNotification = action.payload?.filter(
        (x: any) => x?.is_read=='0',
      )?.length;
    },
    setWallet: (state, action) => {
      state.wallet = action.payload;
    },
    setConfigData: (state, action) => {
      state.configData = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    resetUser: (state, action) => {
      return initialState;
    },
    // demoAsync: (state, action) => {
    //   state.userInfo = action.payload
    // },
  },
});
// Action creators are generated for each case reducer function
export const {
  setUserInfo,
  reset,
  setLanguage,
  setLocation,
  setNotifications,
  setWallet,
  setRole,
  setConfigData,
  setCountries,
  resetUser,
  // demoAsync
} = userSlice.actions;

// export const demoAsyncFun = (amount) => (dispatch) => {
//   setTimeout(() => {
//     dispatch(demoAsync(amount))
//   }, 1000)
// }
export default userSlice.reducer;
