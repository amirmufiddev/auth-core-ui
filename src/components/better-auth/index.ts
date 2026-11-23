export {
  AuthUIProvider,
  useAuthUI,
  type AuthUIBasePaths,
  type AuthUIContextValue,
  type AuthUILocalization,
  type AuthUIProviderProps,
} from "./auth-ui-provider";

export {
  AuthLoading,
  RedirectToSignIn,
  RedirectToSignUp,
  SignedIn,
  SignedOut,
} from "./guards";

export {
  AuthView,
  type AuthViewProps,
  type AuthViewType,
} from "./auth/AuthView";
export { EmailOTPForm } from "./auth/EmailOTPForm";
export { ForgotPasswordForm } from "./auth/ForgotPasswordForm";
export { MagicLinkForm } from "./auth/MagicLinkForm";
export { PasskeyButton } from "./auth/PasskeyButton";
export {
  ProviderButtons,
  SOCIAL_PROVIDER_CATALOG,
} from "./auth/ProviderButtons";
export { SignInForm } from "./auth/SignInForm";
export { SignUpForm } from "./auth/SignUpForm";
export { TwoFactorForm } from "./auth/TwoFactorForm";

export { UserAvatar, type UserAvatarProps } from "./user/UserAvatar";
export {
  UserButton,
  type UserButtonLink,
  type UserButtonProps,
} from "./user/UserButton";

export {
  AccountView,
  type AccountViewProps,
  type AccountViewTab,
} from "./account/AccountView";
export {
  ChangeEmailCard,
  UpdateAvatarCard,
  UpdateNameCard,
} from "./account/ProfileCards";
export {
  ChangePasswordCard,
  DeleteAccountCard,
  PasskeysCard,
  ProvidersCard,
  TwoFactorCard,
} from "./account/SecurityCards";
export { ApiKeysCard, SessionsCard } from "./account/SessionsAndKeysCards";
export { ThemePreferencesCard } from "./account/ThemePreferencesCard";

export {
  CreateOrganizationDialog,
  type CreateOrganizationDialogProps,
} from "./organization/CreateOrganizationDialog";
export { OrganizationInvitationsCard } from "./organization/OrganizationInvitationsCard";
export {
  OrganizationLogo,
  type OrganizationLogoProps,
} from "./organization/OrganizationLogo";
export { OrganizationMembersCard } from "./organization/OrganizationMembersCard";
export { OrganizationSettingsCards } from "./organization/OrganizationSettingsCards";
export {
  OrganizationSwitcher,
  type OrganizationSwitcherProps,
} from "./organization/OrganizationSwitcher";
export {
  OrganizationView,
  type OrganizationViewProps,
} from "./organization/OrganizationView";
