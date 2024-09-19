import { auth } from "../constants/FirebaseConfig";
import i18n from "../locale/locale";

function getAuthInfoFromLocalStorage() {
  if (localStorage.length > 0) {
    return {
      isAuthenticated: localStorage.getItem("token") ? true : false,
      name: localStorage.getItem("name"),
      lastname: localStorage.getItem("lastname"),
      email: localStorage.getItem("email"),
      token: localStorage.getItem("token"),
      userId: localStorage.getItem("userId"),
      originalEntityId: localStorage.getItem("originalEntityId"),
      imageUrl: localStorage.getItem("imageUrl"),
      roles: localStorage.getItem("roles")?.split(","),
    };
  }
}

function getLocale() {
  document.body.classList.add("rtl");
  let locale = "fa";
  if (localStorage.length > 0) {
    locale = localStorage.getItem("locale");
    i18n.changeLanguage(locale);
    if (locale === "en") {
      document.body.classList.remove("rtl");
      document.body.classList.toggle("ltr");
    }
  }
  document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
  document.documentElement.lang = locale === "en" ? "en" : "fa";
  return locale;
}

export const initialState = {
  term: null,
  authentication: getAuthInfoFromLocalStorage()
    ? getAuthInfoFromLocalStorage()
    : {
      isAuthenticated: false,
      name: null,
      lastName: null,
      email: null,
      token: null,
      userId: null,
      profileImage: null,
      roles: [],
    },
  locale: getLocale(),
  askingModal: { show: false, message: "", btnAction: null, id: null },
  confirmModal: { show: false, message: "", iconType: "" },
  relations: [],
  globalLoading: false,
  navbarCollapse: false

};

export const actionTypes = {
  SET_AUTHENTICATION: "SET_AUTHENTICATION",
  LOGOUT: "LOGOUT",
  CHANGE_LOCALE: "CHANGE_LOCALE",
  SHOW_ASKING_MODAL: "SHOW_ASKING_MODAL",
  HIDE_ASKING_MODAL: "HIDE_ASKING_MODAL",
  SHOW_CONFIRM_MODAL: "SHOW_CONFIRM_MODAL",
  HIDE_CONFIRM_MODAL: "HIDE_CONFIRM_MODAL",
  SET_GLOBAL_LOADING: "SET_GLOBAL_LOADING",
  HIDE_RESTRICT_WARNING: "HIDE_RESTRICT_WARNING",
  SHOW_RESTRICT_WARNING: "SHOW_RESTRICT_WARNING",
  SET_SMALL_LOADING: "SET_SMALL_LOADING",
  COLLAPSE_NAVBAR: 'COLLAPSE_NAVBAR'
};

const reducer = (state, action) => {
  switch (action.type) {

    case actionTypes.COLLAPSE_NAVBAR:
      return {
        ...state,
        navbarCollapse: !state.navbarCollapse,
      };

    case actionTypes.SET_AUTHENTICATION:
      return {
        ...state,
        authentication: {
          ...action.payload,
          isAuthenticated: true,
        },
      };
    case actionTypes.LOGOUT:
      let locale = localStorage.getItem("locale");
      localStorage.clear();
      localStorage.setItem("locale", locale);
      auth.signOut()
      return {
        ...state,
        authentication: {
          isAuthenticated: false,
          name: null,
          lastName: null,
          email: null,
          token: null,
          userId: null,
          profileImage: null,
          roles: [],
        },
      };


    case actionTypes.CHANGE_LOCALE:
      i18n.changeLanguage(action.payload.lang);
      if (action.payload.lang === "fa") {
        document.body.classList.remove("ltr");
        document.body.classList.toggle("rtl");
      } else if (action.payload.lang === "en") {
        document.body.classList.remove("rtl");
        document.body.classList.toggle("ltr");
      }
      localStorage.setItem("locale", action.payload.lang);
      return {
        ...state,
        locale: action.payload.lang,
      };
    case actionTypes.SHOW_ASKING_MODAL:
      return {
        ...state,
        askingModal: {
          show: action.payload.show,
          message: action.payload.message,
          iconType: action.payload?.iconType,
          btnAction: action.payload.btnAction,
          id: action.payload.id,
        },
      };
    case actionTypes.HIDE_ASKING_MODAL:
      return {
        ...state,
        askingModal: {
          show: false,
          message: "",
          btnAction: null,
        },
      };
    case actionTypes.SHOW_CONFIRM_MODAL:
      return {
        ...state,
        confirmModal: {
          show: true,
          message: action.payload.message,
          iconType: action.payload.iconType,
        },
      };
    case actionTypes.HIDE_CONFIRM_MODAL:
      return {
        ...state,
        confirmModal: {
          show: false,
          message: null,
          iconType: null,
        },
      };
    case actionTypes.SET_GLOBAL_LOADING:
      return {
        ...state,
        globalLoading: action.payload.value,
      };
    case actionTypes.SHOW_RESTRICT_WARNING:
      return {
        ...state,
        restrictWarning: {
          show: action.payload.show,
          confirmHandler: action.payload.confirmHandler,
        },
      };
    case actionTypes.HIDE_RESTRICT_WARNING:
      return {
        ...state,
        restrictWarning: {
          show: false,
        },
      };
    case actionTypes.SET_SMALL_LOADING:
      return {
        ...state,
        smallLoading: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
