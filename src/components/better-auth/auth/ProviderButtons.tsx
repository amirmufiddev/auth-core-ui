import { Github, Globe, Sparkles, UserCheck, Wallet } from "lucide-react";
import { type BetterAuthFeatureId } from "@/config/better-auth.config";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthUI } from "@/components/better-auth/auth-ui-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SOCIAL_PROVIDER_CATALOG: Array<{
  id: BetterAuthFeatureId;
  provider: string;
  label: string;
}> = [
  { id: "socialGoogle", provider: "google", label: "Google" },
  { id: "socialGithub", provider: "github", label: "GitHub" },
  { id: "socialMicrosoft", provider: "microsoft", label: "Microsoft" },
  { id: "socialApple", provider: "apple", label: "Apple" },
  { id: "socialDiscord", provider: "discord", label: "Discord" },
  { id: "socialGitlab", provider: "gitlab", label: "GitLab" },
  { id: "socialSlack", provider: "slack", label: "Slack" },
  { id: "socialLinkedin", provider: "linkedin", label: "LinkedIn" },
  { id: "socialTwitter", provider: "twitter", label: "X / Twitter" },
  { id: "socialFigma", provider: "figma", label: "Figma" },
  { id: "socialNotion", provider: "notion", label: "Notion" },
  { id: "socialLinear", provider: "linear", label: "Linear" },
  { id: "socialVercel", provider: "vercel", label: "Vercel" },
];

export function ProviderButtons({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const { features, navigate } = useAuthUI();
  const signInWithSocial = useAuthStore((s) => s.signInWithSocial);
  const signInAnonymous = useAuthStore((s) => s.signInAnonymous);

  const activeSocials = SOCIAL_PROVIDER_CATALOG.filter(
    (s) => features[s.id]?.enabled
  );
  const oneTapEnabled = Boolean(features.oneTap?.enabled);
  const siweEnabled = Boolean(features.siwe?.enabled);
  const anonymousEnabled = Boolean(features.anonymous?.enabled);

  if (
    activeSocials.length === 0 &&
    !oneTapEnabled &&
    !siweEnabled &&
    !anonymousEnabled
  ) {
    return null;
  }

  const handleSocial = async (provider: string, id: BetterAuthFeatureId) => {
    try {
      await signInWithSocial(provider, id);
      toast.success(`Berhasil masuk via ${provider}.`);
      navigate(redirectTo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth sign-in gagal.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {activeSocials.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {activeSocials.map((social) => (
            <Button
              key={social.id}
              type="button"
              variant="outline"
              color="secondary"
              onClick={() => void handleSocial(social.provider, social.id)}
            >
              {social.provider === "github" ? (
                <Github className="mr-2 h-4 w-4" />
              ) : (
                <Globe className="mr-2 h-4 w-4" />
              )}
              {social.label}
            </Button>
          ))}
        </div>
      )}

      {oneTapEnabled && (
        <Button
          type="button"
          variant="soft"
          color="info"
          onClick={() => void handleSocial("google", "socialGoogle")}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Google One Tap
        </Button>
      )}

      {siweEnabled && (
        <Button
          type="button"
          variant="outline"
          color="secondary"
          onClick={() => void handleSocial("ethereum", "siwe")}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Sign In With Ethereum (SIWE)
        </Button>
      )}

      {anonymousEnabled && (
        <Button
          type="button"
          variant="ghost"
          color="secondary"
          onClick={async () => {
            await signInAnonymous();
            toast.success("Masuk sebagai tamu (Anonymous).");
            navigate(redirectTo);
          }}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Lanjut sebagai Guest (Anonymous)
        </Button>
      )}
    </div>
  );
}
