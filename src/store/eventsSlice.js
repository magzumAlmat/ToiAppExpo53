import { createSlice } from '@reduxjs/toolkit';

console.log('eventsSlice.js loaded!');

const initialState = {
  eventCategories: [],
  budgets: {}, // { [categoryId]: budgetValue }
  totalCosts: {},
  paidAmounts: {},
  remainingBalances: {},
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventCategories: (state, action) => {
      console.log('eventsSlice: setEventCategories', action.payload);
      state.eventCategories = action.payload;
      
      // Populate maps
      action.payload.forEach(category => {
        if (category.budget) {
          state.budgets[category.id] = category.budget;
        }
        if (category.total_cost) {
          state.totalCosts[category.id] = category.total_cost;
        }
        if (category.paid_amount) {
          state.paidAmounts[category.id] = category.paid_amount;
        }
        if (category.remaining_balance) {
          state.remainingBalances[category.id] = category.remaining_balance;
        }
      });
    },
    updateEventCategoryBudget: (state, action) => {
      console.log('eventsSlice: updateEventCategoryBudget', action.payload);
      const { id, budget } = action.payload;
      state.budgets[id] = budget;
      
      // Also update the budget in the eventCategories array if it exists there
      const category = state.eventCategories.find(c => c.id === id);
      if (category) {
        category.budget = budget;
      }
    },
    addEventCategory: (state, action) => {
      console.log('eventsSlice: addEventCategory', action.payload);
      state.eventCategories.push(action.payload);
      if (action.payload.budget) {
        state.budgets[action.payload.id] = action.payload.budget;
      }
      if (action.payload.total_cost) {
        state.totalCosts[action.payload.id] = action.payload.total_cost;
      }
      if (action.payload.paid_amount) {
        state.paidAmounts[action.payload.id] = action.payload.paid_amount;
      }
      if (action.payload.remaining_balance) {
        state.remainingBalances[action.payload.id] = action.payload.remaining_balance;
      }
    },
    updateEventCategory: (state, action) => {
      console.log('eventsSlice: updateEventCategory', action.payload);
      const index = state.eventCategories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.eventCategories[index] = action.payload;
        if (action.payload.budget) {
          state.budgets[action.payload.id] = action.payload.budget;
        }
        if (action.payload.total_cost) {
          state.totalCosts[action.payload.id] = action.payload.total_cost;
        }
        if (action.payload.paid_amount) {
          state.paidAmounts[action.payload.id] = action.payload.paid_amount;
        }
        if (action.payload.remaining_balance) {
          state.remainingBalances[action.payload.id] = action.payload.remaining_balance;
        }
      }
    },
    deleteEventCategory: (state, action) => {
      console.log('eventsSlice: deleteEventCategory', action.payload);
      state.eventCategories = state.eventCategories.filter(c => c.id !== action.payload);
      delete state.budgets[action.payload];
      delete state.totalCosts[action.payload];
      delete state.paidAmounts[action.payload];
      delete state.remainingBalances[action.payload];
    },
    updateEventCategoryTotalCost: (state, action) => {
      console.log('eventsSlice: updateEventCategoryTotalCost', action.payload);
      const { id, total_cost } = action.payload;
      state.totalCosts[id] = total_cost;
    },
    updateEventCategoryPaidAmount: (state, action) => {
      console.log('eventsSlice: updateEventCategoryPaidAmount', action.payload);
      const { id, paid_amount } = action.payload;
      state.paidAmounts[id] = paid_amount;
    },
    updateEventCategoryRemainingBalance: (state, action) => {
      console.log('eventsSlice: updateEventCategoryRemainingBalance', action.payload);
      const { id, remaining_balance } = action.payload;
      state.remainingBalances[id] = remaining_balance;
    },
  },
});

export const { 
  setEventCategories, 
  updateEventCategoryBudget, 
  addEventCategory, 
  updateEventCategory, 
  deleteEventCategory,
  updateEventCategoryTotalCost,
  updateEventCategoryPaidAmount,
  updateEventCategoryRemainingBalance
} = eventsSlice.actions;

export default eventsSlice.reducer;
