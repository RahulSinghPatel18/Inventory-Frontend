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
    <div className="px-6 py-2 flex items-center justify-between">

      <Button
        variant="outline"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </Button>

      <span className="text-sm theme-text-secondary">
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
      >
        Next →
      </Button>

    </div>
  );
};

export default Pagination;