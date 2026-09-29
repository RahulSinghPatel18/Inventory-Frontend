import Spinner from "./Spinner";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex min-h-[250px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />

        <p className="text-sm theme-text-muted">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loader;