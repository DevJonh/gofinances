import React, { createContext, useContext, useState, useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  storageLoading: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>({} as User);
  const [storageLoading, setStorageLoading] = useState(true);
  const userStorageKey = "@gofinances:user";

  const signInWithGoogle = async () => {
    try {
      const RESPONSE_TYPE = "token";
      const SCOPE = encodeURI("profile email");

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
      const { type, params } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (type === "success") {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );

        const userInfo = await response.json();
        const userLogged = {
          email: userInfo.email,
          id: userInfo.id,
          name: userInfo.given_name,
          photo: userInfo.picture,
        };

        if (userInfo) {
          setUser(userLogged);
          await AsyncStorage.setItem(
            userStorageKey,
            JSON.stringify(userLogged)
          );
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        const userLogged = {
          email: credential.email,
          id: credential.user,
          name: credential.fullName.givenName,
          photo: `https://ui-avatars.com/api/?name=${credential.fullName.givenName}&length=1`,
        };

        setUser(userLogged);

        await AsyncStorage.setItem(userStorageKey, JSON.stringify(credential));
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const loadStorageData = async () => {
    const userStorage = await AsyncStorage.getItem(userStorageKey);

    if (userStorage) {
      const userLogged = JSON.parse(userStorage) as User;
      setUser(userLogged);
    }

    setStorageLoading(false);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(userStorageKey);
    setUser({} as User);
  };

  useEffect(() => {
    loadStorageData();
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithApple,
        signOut,
        storageLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
