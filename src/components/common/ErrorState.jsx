import Button from "./Button";

const ErrorState = ({
  title = "Something went wrong",
  message = "Unable to load the data.",
  onRetry
}) => {
  return (
    <div className="flex min-h-[250px] items-center justify-center rounded-xl border theme-danger-border theme-surface">
      <div className="max-w-md px-6 text-center">
        <div className="text-4xl">⚠️</div>

        <h3 className="mt-3 text-lg font-semibold theme-text-primary">
          {title}
        </h3>

        <p className="mt-1 text-sm theme-text-muted">
          {message}
        </p>

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;