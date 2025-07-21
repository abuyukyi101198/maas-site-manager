import type { Reducer } from "react";
import React, { createContext, useContext, useReducer } from "react";

import useLocalStorageState from "use-local-storage-state";

import type { AccessTokenResponse, MutationErrorResponse } from "@/app/api";
import { OpenAPI } from "@/app/api/client";
import { useLogin } from "@/app/api/query/auth";
import type { PostV1LoginPostData } from "@/app/apiclient";
import { client } from "@/app/apiclient/client.gen";
type AuthStatus = "authenticated" | "initial" | "unauthorised";

interface AuthContextType {
  status: AuthStatus;
  login: ({}: Pick<PostV1LoginPostData["body"], "password" | "username">) => Promise<AccessTokenResponse>;
  logout: () => Promise<void>;
  isError: boolean;
  error: MutationErrorResponse | null;
}

export const AuthContext = createContext<AuthContextType>({
  status: "initial",
  login: () => new Promise(() => {}),
  logout: () => new Promise(() => {}),
  isError: false,
  error: null,
});

export const actionTypes = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
} as const;

type Status = "authenticated" | "unauthorised";

type ActionType = (typeof actionTypes)[keyof typeof actionTypes];
type AuthToken = string | null;
type AuthState = {
  authToken: AuthToken;
  status: Status;
};
type AuthAction =
  | {
      type: Exclude<ActionType, "LOGIN_SUCCESS">;
    }
  | {
      type: typeof actionTypes.LOGIN_SUCCESS;
      payload: AuthToken;
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

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [persistedAuthToken, setPersistedAuthToken] = useLocalStorageState<string>("jwtToken");
  const removePersistedAuthToken = useCallback(() => {
    localStorage.removeItem("jwtToken");
  }, []);

  const loginQuery = useLogin();

  const initialState: AuthState = {
    authToken: persistedAuthToken ? persistedAuthToken : null,
    status: persistedAuthToken ? "authenticated" : "unauthorised",
  };

  const clearAuthToken = useCallback(() => {
    OpenAPI.TOKEN = undefined;
    removePersistedAuthToken();
  }, [removePersistedAuthToken]);

  const updateAuthToken = useCallback(
    (authToken: AuthToken) => {
      if (authToken) {
        setPersistedAuthToken(authToken);
        OpenAPI.TOKEN = authToken;
      }
    },
    [setPersistedAuthToken],
  );
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Add a response interceptor to handle logout on 401 status
    client.instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        if (error?.status === 401) {
          dispatch({ type: actionTypes.LOGOUT });
          clearAuthToken();
        }
        return Promise.reject(error);
      },
    );
  }, [clearAuthToken]);

  const login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<AccessTokenResponse> => {
    try {
      if (!username || !password) {
        throw Error("Missing required fields");
      }
      const response = await loginQuery.mutateAsync({ body: { username, password } });
      updateAuthToken(response.access_token);
      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.access_token });
      return response;
    } catch {
      dispatch({ type: actionTypes.LOGIN_ERROR });
      return Promise.reject();
    }
  };

  const logout = (): Promise<void> =>
    new Promise((resolve) => {
      clearAuthToken();
      dispatch({ type: actionTypes.LOGOUT });
      resolve();
    });

  return (
    <AuthContext.Provider
      value={{
        status: state.status,
        login,
        logout,
        isError: loginQuery.isError,
        error: loginQuery.error as MutationErrorResponse | null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
