// pages/index.js
import { useState } from "react";
import axios from "axios";
import styles from "./styles/Home.module.css";

export default function Home() {
  const [imageBase64, setImageBase64] = useState("");
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setImageBase64(reader.result);
    } else {
      setImageBase64("");
    }
  };

  const generateHTMLFromImage = async () => {
    if (!imageBase64) {
      alert("Te rog să încarci o imagine.");
      return;
    }
    setLoading(true);
    setGeneratedHTML("");

    try {
      const res = await axios.post("/api/generate-html", { imageBase64 });
      const processedHTML = res.data.generatedHTML.replace(/```+/g, "");
      setGeneratedHTML(processedHTML);
    } catch (error) {
      setGeneratedHTML("Alege altă imagine sau încearcă din nou mai târziu.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h1 className={styles.title}>
          🌱 Evaluare Sănătate Plante
        </h1>
        <div className={styles.fileInput}>
          <label>
            Încarcă imaginea plantei sau a grupului de plante pentru evaluare:
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button className={styles.button} onClick={generateHTMLFromImage} disabled={loading}>
          {loading ? "Se evaluează..." : "Evaluează starea"}
        </button>
      </div>

      <div className={styles.bottomSection}>
        {imageBase64 && (
          <div className={styles.leftColumn}>
            <div className={styles.imagePreview}>
              <img src={imageBase64} alt="Imagine încărcată pentru evaluare" />
            </div>
          </div>
        )}
        {generatedHTML && (
          <div className={styles.rightColumn}>
            <div className={styles.descriptionBox}>
              <h2>📄 Raport de evaluare:</h2>
              <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
