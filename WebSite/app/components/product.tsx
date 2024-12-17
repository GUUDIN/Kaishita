import { useEffect, useState } from "react";


interface ProductProps {
  name: string;
  image_href: string;
}

export default function ProductComponent({ name, image_href }: ProductProps) {
  let [quantityValue, setQuantityValue] = useState(0);

  function ChangeQuantityBy(value: number) {
    setQuantityValue((prev) => Math.max(0, prev + value));
  }

  const AddButton = () => <button
    type="button"
    style={{ ...styles.btn, ...styles.btnMore, ...styles.btnHover }}
    onMouseOver={(e) =>
      (e.currentTarget.style.backgroundColor = "#388e3c")
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.backgroundColor = "#4caf50")
    }
    onClick={(e) => {
      e.preventDefault();
      ChangeQuantityBy(1)
    }}
  >+</button>

  const SubtractButton = () =>  <button
    type="button"
    style={{ ...styles.btn, ...styles.btnLess, ...styles.btnHover }}
    onMouseOver={(e) =>
      (e.currentTarget.style.backgroundColor = "#d32f2f")
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.backgroundColor = "#f44336")
    }
    onClick={() => {
      ChangeQuantityBy(-1)
    }}
  >-</button>;

  return (
    <div className="Product" style={styles.productCard}>
      <img src={image_href} alt={name} style={styles.productImage} />
      <h2 style={styles.productName}>{name}</h2>
      <div style={styles.productControls}>
        <SubtractButton />
        <input
          inputMode="numeric"
          name={`quantity_${name}`}
          style={styles.quantityInput}
          min="0"
          placeholder="0"
          value={quantityValue}

          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setQuantityValue(isNaN(value) ? 0 : Math.max(0, value));
          }}
        />
        <AddButton />
      </div>
    </div>
  );
}

const styles = {
  productCard: {
    width: "300px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center" as "center",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  productImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as "cover",
    borderRadius: "4px",
  },
  productName: {
    fontSize: "1.25rem",
    fontWeight: "bold" as "bold",
    color: "#333",
    margin: "16px 0",
  },
  productControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  quantityInput: {
    width: "60px",
    height: "36px",
    textAlign: "center" as "center",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  btn: {
    padding: "8px 16px",
    fontSize: "1rem",
    fontWeight: "bold" as "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#fff",
  },
  btnLess: {
    backgroundColor: "#f44336",
  },
  btnMore: {
    backgroundColor: "#4caf50",
  },
  btnHover: {
    transition: "background-color 0.3s ease",
  },
};