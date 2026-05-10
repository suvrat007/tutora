import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    planType: 'free',
    status: 'none',
    currentPeriodEnd: null,
    paidCount: 0,
    isPro: false,
};

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        setSubscription: (state, action) => {
            const { planType, status, currentPeriodEnd, paidCount, isPro } = action.payload;
            state.planType = planType ?? 'free';
            state.status = status ?? 'none';
            state.currentPeriodEnd = currentPeriodEnd ?? null;
            state.paidCount = paidCount ?? 0;
            state.isPro = isPro ?? false;
        },
        clearSubscription: () => initialState,
    },
});

export const { setSubscription, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
