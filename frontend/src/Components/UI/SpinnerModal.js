import Spinner from "react-bootstrap/Spinner";

function SpinnerModal() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "89vh",
      }}
    >
      <Spinner backdrop="static" animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default SpinnerModal;
