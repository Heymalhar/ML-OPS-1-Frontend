import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import styles from "../styles/Home.module.css";

interface FormValues {
  SPX: number;
  USO: number;
  SLV: number;
  EURUSD: number;
}

interface FormErrors {
  [key: string]: string;
}

export default function HomePage() {

  const [formValues, setFormValues] = useState<FormValues>({
    SPX: 0,
    USO: 0,
    SLV: 0,
    EURUSD: 0
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    Object.entries(formValues).forEach(([key, value]) => {
      if (isNaN(value) || value <= 0) {
        errors[key] = `${key} must be a positive number`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrediction(null);
    setError(null);
    
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post("https://ml-ops-1.onrender.com/predict", formValues);
      setPrediction(response.data.prediction);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "API Error Occurred.");
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    
      <Head>
        <title>Gold Price Prediction</title>
      </Head>

      <main className={styles.container}>

        <h1 className={styles.title}>Gold Price Prediction</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {Object.entries(formValues).map(([key, value]) => (
            <div className={styles.formGroup} key={key}>
              <label htmlFor={key} className={styles.label}>
                {key}
              </label>
              <input
                type="number"
                step="any"
                name={key}
                id={key}
                value={value}
                onChange={handleChange}
                className={`${styles.input} ${formErrors[key] ? styles.inputError : ""}`}
                required
                aria-describedby={`${key}-error`}
                aria-invalid={!!formErrors[key]}
              />
              {formErrors[key] && (
                <span id={`${key}-error`} className={styles.error}>
                  {formErrors[key]}
                </span>
              )}
            </div>
          ))}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? <span className={styles.loader}></span> : "Predict"}
          </button>

        </form>

        {error && <p className={styles.apiError}>{error}</p>}

        {prediction !== null && (
          <div className={styles.result}>
            <strong>Predicted GLD Price: </strong> ${prediction.toFixed(2)}
          </div>
        )}

      </main>
    
    </>
  );

}