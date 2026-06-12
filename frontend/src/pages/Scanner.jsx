import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import api from "../services/api";
import { categories, suggestCategory } from "../utils/budgetUtils";

const blank = { merchant: "", receipt_date: new Date().toISOString().slice(0, 10), amount: "", category: "Miscellaneous", raw_text: "" };

function detect(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const amount = text.match(/(?:total|amount|rs\.?|lkr)\D*(\d{2,}(?:[,.]\d{2,3})*(?:\.\d{2})?)/i)?.[1]?.replace(/,/g, "") || "";
  const date = text.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/)?.[1]?.replaceAll("/", "-") || blank.receipt_date;
  return { merchant: lines[0] || "", receipt_date: date, amount, category: suggestCategory(text), raw_text: text };
}

export default function Scanner() {
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => stopCamera(), []);

  async function scan(file) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setMessage("");
    try {
      const result = await Tesseract.recognize(file, "eng");
      setForm(detect(result.data.text));
    } catch (error) {
      setMessage("Could not read this image. Please try a clearer photo or use manual entry.");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    setCameraError("");
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (error) {
      setCameraError("Camera permission was blocked or no camera was found.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  async function captureBill() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return setMessage("Could not capture photo. Please try again.");
      const file = new File([blob], `bill-${Date.now()}.jpg`, { type: "image/jpeg" });
      await scan(file);
    }, "image/jpeg", 0.92);
  }

  async function save() {
    setMessage("");
    if (!form.amount || Number(form.amount) <= 0) return setMessage("Please enter a valid total amount before saving.");
    if (!form.merchant.trim()) return setMessage("Please enter the merchant name before saving.");

    try {
      const duplicate = await api.post("/receipts/check-duplicate", { merchant: form.merchant, date: form.receipt_date, amount: form.amount });
      if (duplicate.data.duplicate && !confirm(duplicate.data.message)) return setMessage(duplicate.data.message);
      await api.post("/receipts", form);
      setMessage("Verified bill saved as an expense.");
      setForm(blank);
      setPreview("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save scanned bill. Please login again or check the fields.");
    }
  }

  return (
    <div>
      <h1>OCR Bill Scanner</h1>
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="app-card p-3">
            <label className="form-label fw-semibold">Upload bill image</label>
            <input className="form-control mb-3" type="file" accept="image/*" onChange={(e) => scan(e.target.files[0])} />
            <div className="scanner-camera mb-3">
              <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                <label className="form-label fw-semibold mb-0">Camera scan</label>
                <span className="badge text-bg-light">Back camera preferred</span>
              </div>
              <video ref={videoRef} className={`scanner-video ${cameraActive ? "" : "d-none"}`} playsInline muted />
              {!cameraActive && <div className="scanner-placeholder">Open camera and place the bill inside the frame.</div>}
              <canvas ref={canvasRef} className="d-none" />
              {cameraError && <div className="alert alert-danger mt-2 mb-0">{cameraError}</div>}
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {!cameraActive ? (
                  <button className="btn btn-primary" type="button" onClick={startCamera}>Open Camera</button>
                ) : (
                  <>
                    <button className="btn btn-primary" type="button" onClick={captureBill} disabled={loading}>Capture Bill</button>
                    <button className="btn btn-outline-primary" type="button" onClick={stopCamera}>Stop Camera</button>
                  </>
                )}
              </div>
            </div>
            {preview && <img className="scanner-preview" src={preview} alt="Uploaded bill preview" />}
            {loading && <div className="alert alert-info mt-3">Extracting bill text...</div>}
            <div className="alert alert-secondary mt-3 mb-0">If the bill is handwritten or unclear, use the editable fields as a manual entry fallback.</div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="app-card p-3">
            {message && <div className="alert alert-warning">{message}</div>}
            <div className="row g-2">
              <div className="col-md-6"><label className="form-label">Merchant</label><input className="form-control" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={form.receipt_date} onChange={(e) => setForm({ ...form, receipt_date: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Total amount</label><input className="form-control" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Suggested category</label><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="col-12"><label className="form-label">Extracted raw text</label><textarea className="form-control" rows="8" value={form.raw_text} onChange={(e) => setForm({ ...form, raw_text: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary mt-3" onClick={save}>Save Verified Result as Expense</button>
          </div>
        </div>
      </div>
    </div>
  );
}
