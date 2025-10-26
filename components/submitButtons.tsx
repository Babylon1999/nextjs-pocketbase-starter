import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export function SubmitButton({
  isLoading,
  canSubmit,
  label = "Continue",
  fullWidth = true,
}: {
  isLoading: boolean;
  canSubmit: boolean;
  label?: string;
  fullWidth?: boolean;
}) {
  if (isLoading) {
    return (
      <Button disabled className={fullWidth ? "w-full" : ""}>
        <Spinner size="sm" className="mr-2" />
        Please wait
      </Button>
    );
  }

  return (
    <Button
      className={fullWidth ? "w-full" : ""}
      disabled={!canSubmit}
      type="submit"
    >
      {label}
    </Button>
  );
}

export function LoginButton({
  isLoading,
  canSubmit,
  label = "Continue",
}: {
  isLoading: boolean;
  canSubmit: boolean;
  label?: string;
}) {
  return (
    <SubmitButton isLoading={isLoading} canSubmit={canSubmit} label={label} />
  );
}

export function SignUpButton({
  isLoading,
  canSubmit,
  label = "Create Account",
}: {
  isLoading: boolean;
  canSubmit: boolean;
  label?: string;
}) {
  return (
    <SubmitButton isLoading={isLoading} canSubmit={canSubmit} label={label} />
  );
}

export function UpdateUserButton({ isLoading }: { isLoading: boolean }) {
  return (
    <SubmitButton
      isLoading={isLoading}
      canSubmit={true}
      label="Update"
      fullWidth={false}
    />
  );
}
