import {createSlice} from '@reduxjs/toolkit';
export const appSlice = createSlice({
    name: 'appSlice',
    initialState: {
        isDarkMode: false,
        blockChainLogs: [],
    },
    reducers: {
        setDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
        },
        addBlockChainLog: (state, action) => {
            state.blockChainLogs = [action.payload, ...state.blockChainLogs];
        },
    }
})
export const {setDarkMode, addBlockChainLog} = appSlice.actions;
export default appSlice.reducer;