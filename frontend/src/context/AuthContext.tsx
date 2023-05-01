import type { Reducer } from "react";
import React, { createContext, useContext, useReducer } from "react";

import type { AxiosInstance } from "axios";
import useLocalStorageState from "use-local-storage-state";

import { useLoginMutation } from "@/hooks/api";
import type { LoginError } from "@/hooks/api";

type AuthStatus = "initial" | "authenticated" | "unauthorised";

interface AuthContextType {
  status: AuthStatus;
  login: ({ username, password }: { username: string; password: string }) => void;
  logout: (callback: VoidFunction) => void;
  isError: boolean;
  failureReason: LoginError | null;
}

export const AuthContext = createContext<AuthContextType>({
  status: "initial",
  login: () => null,
  logout: () => null,
  isError: false,
  failureReason: null,
});

export const actionTypes = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
} as const;

const status = {
  AUTHENTICATED: "authenticated",
  UNAUTHORISED: "unauthorised",
} as const;

type Status = (typeof status)[keyof typeof status];
type ActionType = (typeof actionTypes)[keyof typeof actionTypes];
type AuthToken = string | null;
type AuthState = {
  authToken: AuthToken;
  status: Status;
};
type AuthAction =
  | {
      type: typeof actionTypes.LOGIN_SUCCESS;
      payload: AuthToken;
    }
  | {
      type: Exclude<ActionType, "LOGIN_SUCCESS">;
    };

const authReducer: Reducer<AuthState, AuthAction> = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return { ...state, status: "authenticated", authToken: action.payload };
    case actionTypes.LOGIN_ERROR:
      return { ...state, status: "unauthorised", authToken: null };
    case actionTypes.LOGOUT:
      return { ...state, status: "unauthorised", authToken: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({
  apiClient,
  children,
}: {
  apiClient: AxiosInstance;
  children: React.ReactNode;
}) => {
  const [persistedAuthToken, setPersistedAuthToken, { removeItem: removePersistedAuthToken }] =
    useLocalStorageState<string>("jwtToken");
  const { mutateAsync, isError, failureReason } = useLoginMutation();

  const initialState: AuthState = {
    authToken: persistedAuthToken ? persistedAuthToken : null,
    status: persistedAuthToken ? "authenticated" : "unauthorised",
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.status === "authenticated") {
      apiClient.interceptors.request.use(function (config) {
        if (state.authToken) {
          config.headers.Authorization = `Bearer ${state.authToken}`;
        }
        return config;
      });
    }
  }, [apiClient.interceptors.request, state.authToken, state.status]);

  useEffect(() => {
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 || error?.status === 401) {
          dispatch({ type: actionTypes.LOGOUT });
          removePersistedAuthToken();
        }
        return Promise.reject(error);
      },
    );
  }, [apiClient, removePersistedAuthToken]);

  const login = async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await mutateAsync({ username, password });
      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.access_token });
      setPersistedAuthToken(response.access_token);
    } catch (error) {
      dispatch({ type: actionTypes.LOGIN_ERROR });
    }
  };

  const logout = (callback: VoidFunction) => {
    dispatch({ type: actionTypes.LOGOUT });
    removePersistedAuthToken();
    callback();
  };

  return (
    <AuthContext.Provider
      value={{
        status: state.status,
        login,
        logout,
        isError,
        failureReason,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
