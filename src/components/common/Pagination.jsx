import Button from "./Button";

const Pagination = ({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange
}) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">

      <Button
        variant="outline"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        className="w-full sm:w-auto"
      >
        ← Previous
      </Button>

      <span className="text-center text-sm theme-text-secondary">
        Page{" "}
        <span className="font-semibold theme-text-primary">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold theme-text-primary">
          {totalPages}
        </span>
      </span>

      <Button
        variant="outline"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        className="w-full sm:w-auto"
      >
        Next →
      </Button>

    </div>
  );
};

export default Pagination;