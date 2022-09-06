// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.common = {
  'Content-Type': 'application/json',
};

export const fetchEvents = createAsyncThunk(
  'appCalendar/fetchEvents',
  async (identifier) => {
    const response = await axios.get(
      `/api/v1/meeting/fetch-meetings/${identifier}`
    );
    return response.data;
  }
);

export const addEvent = createAsyncThunk(
  'appCalendar/addEvent',
  async (event, { dispatch, getState }) => {
    const options = {
      url: '/api/v1/meeting/create',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: event,
    };
    await axios(options);
    await dispatch(fetchEvents(getState().calendar.selectedCalendars));
    return event;
  }
);

export const updateEvent = createAsyncThunk(
  'appCalendar/updateEvent',
  async (event, { dispatch, getState }) => {
    await axios.post('/apps/calendar/update-event', { event });
    await dispatch(fetchEvents(getState().calendar.selectedCalendars));
    return event;
  }
);

export const updateFilter = createAsyncThunk(
  'appCalendar/updateFilter',
  async (filter, { dispatch, getState }) => {
    if (getState().calendar.selectedCalendars.includes(filter)) {
      await dispatch(
        fetchEvents(
          getState().calendar.selectedCalendars.filter((i) => i !== filter)
        )
      );
    } else {
      await dispatch(
        fetchEvents([...getState().calendar.selectedCalendars, filter])
      );
    }
    return filter;
  }
);

export const updateAllFilters = createAsyncThunk(
  'appCalendar/updateAllFilters',
  async (value, { dispatch }) => {
    if (value === true) {
      await dispatch(
        fetchEvents(['Personal', 'Business', 'Family', 'Holiday', 'ETC'])
      );
    } else {
      await dispatch(fetchEvents([]));
    }
    return value;
  }
);

export const removeEvent = createAsyncThunk(
  'appCalendar/removeEvent',
  async (id) => {
    await axios.delete('/apps/calendar/remove-event', { id });
    return id;
  }
);

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState: {
    events: [],
    selectedEvent: {},
    selectedCalendars: ['Personal', 'Business', 'Family', 'Holiday', 'ETC'],
  },
  reducers: {
    selectEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      .addCase(updateFilter.fulfilled, (state, action) => {
        if (state.selectedCalendars.includes(action.payload)) {
          state.selectedCalendars.splice(
            state.selectedCalendars.indexOf(action.payload),
            1
          );
        } else {
          state.selectedCalendars.push(action.payload);
        }
      })
      .addCase(updateAllFilters.fulfilled, (state, action) => {
        const value = action.payload;
        let selected = [];
        if (value === true) {
          selected = ['Personal', 'Business', 'Family', 'Holiday', 'ETC'];
        } else {
          selected = [];
        }
        state.selectedCalendars = selected;
      });
  },
});

export const { selectEvent } = appCalendarSlice.actions;

export default appCalendarSlice.reducer;
