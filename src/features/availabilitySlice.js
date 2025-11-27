import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchBlockedDays = createAsyncThunk(
  'availability/fetchBlockedDays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchAllBlockedDays();
      const blockedDaysData = {};
      response.data.forEach((entry) => {
        const { date, restaurantId, restaurantName } = entry;
        if (!blockedDaysData[date]) {
          blockedDaysData[date] = { marked: true, dots: [], disabled: true, disableTouchEvent: true };
        }
        blockedDaysData[date].dots.push({ key: restaurantId.toString(), restaurantId, restaurantName, color: 'red' });
      });
      return blockedDaysData;
    } catch (error) {
      console.error("Ошибка при загрузке заблокированных дней из thunk:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    blockedDays: {},
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockedDays.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchBlockedDays.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.blockedDays = action.payload;
      })
      .addCase(fetchBlockedDays.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export default availabilitySlice.reducer;
