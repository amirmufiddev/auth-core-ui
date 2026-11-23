import { createContext, useContext, useState, type ReactNode } from "react";
import { LayoutGroup } from "framer-motion";

export type AuthStage = "default" | "otp" | "two-factor" | "verified";

interface AuthStageContextValue {
  stage: AuthStage;
  setStage: (stage: AuthStage) => void;
}

const AuthStageContext = createContext<AuthStageContextValue>({
  stage: "default",
  setStage: () => {},
});

export function AuthStageProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<AuthStage>("default");

  return (
    <AuthStageContext.Provider value={{ stage, setStage }}>
      <LayoutGroup id="authcore-split-stage">{children}</LayoutGroup>
    </AuthStageContext.Provider>
  );
}

export function useAuthStage() {
  return useContext(AuthStageContext);
}
