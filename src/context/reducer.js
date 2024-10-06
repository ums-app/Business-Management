import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../constants/FirebaseConfig";
import i18n from "../locale/locale";

// export function getAuthInfoFromLocalStorage(dispatch) {
//   onAuthStateChanged(auth, (user) => {
//     if (user) {
//       const localStorageAuthObj = {
//         isAuthenticated: true,
//         name: localStorage.getItem("name"),
//         lastname: localStorage.getItem("lastname"),
//         email: localStorage.getItem("email"),
//         userId: localStorage.getItem("userId"),
//         originalEntityId: localStorage.getItem("originalEntityId"),
//         imageURL: localStorage.getItem("imageURL"),
//         userType: localStorage.getItem("userType"),
//         roles: localStorage.getItem("roles")?.split(","),
//       };

//       // Only dispatch if authentication object changes
//       dispatch({
//         type: "SET_AUTHENTICATION",
//         payload: localStorageAuthObj,
//       });
//     } else {
//       // Redirect to login if no user is found
//       window.location.href = '/login';
//     }
//   });
// }


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

// interface GlobalState {
//   authentication: AuthenticationType;  // Define these types as per your app structure
//   customerForSaleFactor: CustomerForSaleFactorType;
//   factor: FactorType;
// }

export const initialState = {
  term: null,
  authentication: {
    isAuthenticated: false,
    name: null,
    lastName: null,
    email: null,
    userId: null,
    imageURL: null,
    roles: [],
  },
  locale: getLocale(),
  askingModal: { show: false, message: "", btnAction: null, id: null },
  confirmModal: { show: false, message: "", iconType: "" },
  relations: [],
  globalLoading: false,
  navbarCollapse: false,
  customerForSaleFactor: null
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
  COLLAPSE_NAVBAR: 'COLLAPSE_NAVBAR',
  ADD_CUSTOMER_TO_SALE_FACTOR: 'ADD_CUSTOMER_TO_SALE_FACTOR',
  SET_FACTOR: 'SET_FACTOR',
  ADD_PURCHASE_FACTOR: "ADD_PURCHASE_FACTOR"
};

const reducer = (state, action) => {
  switch (action.type) {

    case actionTypes.COLLAPSE_NAVBAR:
      return {
        ...state,
        navbarCollapse: !state.navbarCollapse,
      };
    case actionTypes.SET_FACTOR:
      return {
        ...state,
        factor: action.payload
      }
    case actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR:
      return {
        ...state,
        customerForSaleFactor: action.payload
      }

    case actionTypes.ADD_PURCHASE_FACTOR:
      return {
        ...state,
        PurchaseFactor: action.payload
      }


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
