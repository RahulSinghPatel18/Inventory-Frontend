import Spinner from "./Spinner";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="grid min-h-dvh place-items-center p-6" aria-busy="true">
      <Spinner size="lg" label={message} />
    </div>
  );
};

export default Loader;