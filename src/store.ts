import {Action} from "@ngrx/store";
import {DataState, ApplicationState, MonthOverview, DayWithAppointments, Appointment} from "./stateTypes";
import {
    SET_SELECTEDDAY,
    SET_SELECTEDWEEK,
    SET_SELECTEDMONTH,
    ADD_APPOINTMENT,
    UPDATE_APPOINTMENT,
    REMOVE_APPOINTMENT,
    SET_VIEWMODE
} from "./actions";
import {ViewMode} from "./enums";
export const store = {
    data: dataReducer,
    application: applicationReducer
};


function dataReducer(state: DataState = {monthOverviews: []}, action: Action): DataState {
    switch (action.type) {
        case ADD_APPOINTMENT:
        case REMOVE_APPOINTMENT:
        case UPDATE_APPOINTMENT:
            return {
                monthOverviews: monthOverviewsReducer(state.monthOverviews, action)
            };
        default:
            return state;
    }
}

// Handles the array of months, if a single action should be taken on a month, it delegates the action to the montOverviewReducer
function monthOverviewsReducer(state: Array<MonthOverview> = [], action: Action): Array<MonthOverview> {
    switch (action.type) {
        case ADD_APPOINTMENT:
        case UPDATE_APPOINTMENT:
        case REMOVE_APPOINTMENT:
            // could be a pattern right here? Check if the monthOverview exists, if it does, create a new one, otherwise switch the reference in the array
            let monthOverview = state.filter((monthOverview: MonthOverview) =>
                monthOverview.month === action.payload.day.month && monthOverview.year === action.payload.day.year
            )[0];
            if (!monthOverview) {
                monthOverview = new MonthOverview(action.payload.day.year, action.payload.day.month, []);
                return [...state,
                    monthOverviewReducer(monthOverview, action)];
            }
            else {
                return [...state.slice(0, state.indexOf(monthOverview)),
                    monthOverviewReducer(monthOverview, action),
                    ...state.slice(state.indexOf(monthOverview) + 1, state.length)];
            }
        default:
            return state;

    }
}


function monthOverviewReducer(state: MonthOverview, action: Action): MonthOverview {
    switch (action.type) {
        case ADD_APPOINTMENT:
        case UPDATE_APPOINTMENT:
        case REMOVE_APPOINTMENT:
            state.daysWithAppointments = dayWithAppointmentsReducer(state.daysWithAppointments, action);
            return state;
        default:
            return state;
    }
}

function dayWithAppointmentsReducer(state: Array<DayWithAppointments> = [], action: Action): Array<DayWithAppointments> {
    switch (action.type) {
        case REMOVE_APPOINTMENT:
        case ADD_APPOINTMENT:
        case UPDATE_APPOINTMENT:
            // could be a pattern right here? Check if the dayWithAppointments exists, if it does, create a new one, otherwise switch the reference in the array
            let dayWithAppointment = state.filter((dayWithAppointments: DayWithAppointments) =>
                dayWithAppointments.day.day === action.payload.day.day
            )[0];
            if (!dayWithAppointment) {
                dayWithAppointment = new DayWithAppointments(action.payload.day, []);
                return [...state,
                    dayWithAppointmentReducer(dayWithAppointment, action)];
            }
            else {
                return [...state.slice(0, state.indexOf(dayWithAppointment)),
                    dayWithAppointmentReducer(dayWithAppointment, action),
                    ...state.slice(state.indexOf(dayWithAppointment) + 1, state.length)];
            }
        default:
            return state;
    }
}

// Every change to the events for a day are handled here.
function dayWithAppointmentReducer(state: DayWithAppointments, action: Action): DayWithAppointments {
    switch (action.type) {
        case REMOVE_APPOINTMENT:
            return {
                day: state.day,
                appointments: state.appointments.filter((appointment: Appointment) => {
                    return appointment.id !== action.payload.id;
                })
            };
        case ADD_APPOINTMENT:
            return {
                day: state.day,
                appointments: [...state.appointments, action.payload.appointment]
            };
        case UPDATE_APPOINTMENT:
            return {
                day: state.day,
                appointments: state.appointments.map((appointment: Appointment) => {
                    let {description, date} = action.payload.appointment;
                    return appointment.id === action.payload.appointment.id ?
                        Object.assign({}, appointment, {description, date}) : appointment;
                })

            }
        default:
            return state;
    }
}

function applicationReducer(state: ApplicationState = {
    viewMode: ViewMode.Month, selectedDay: null, selectedWeek: null,
    selectedMonth: null
}, action: Action): ApplicationState {
    switch (action.type) {
        case SET_VIEWMODE:
            return Object.assign({}, state, {viewMode: action.payload.viewMode});
        case SET_SELECTEDDAY:
            return Object.assign({}, state, {selectedDay: action.payload});
        case SET_SELECTEDWEEK:
            return Object.assign({}, state, {selectedWeek: action.payload});
        case SET_SELECTEDMONTH:
            return Object.assign({}, state, {selectedMonth: action.payload});
        default:
            return state;
    }
}
