const ErrorMessage = ({ error }: { error: unknown }) => (
  <>{error instanceof Error ? error.message : typeof error === "string" ? error : "An unknown error has occured"}</>
);

export default ErrorMessage;
