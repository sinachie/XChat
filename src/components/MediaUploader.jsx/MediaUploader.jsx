import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export const MediaUploader = ({ onUploadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(pct);
      },
      (err) => {
        setError("Upload failed. Please try again.");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploading(false);
        if (onUploadComplete) onUploadComplete(downloadURL);
      }
    );
  };

  return (
    <div className="w-full bg-[#05080C] border border-[#0047AB]/30 rounded-xl p-4 my-2">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#00D2FF] hover:text-white transition">
          <UploadCloud className="w-5 h-5" />
          <span>{uploading ? "Uploading Attachment..." : "Attach Media File"}</span>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {progress === 100 && !uploading && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        )}
      </div>

      {uploading && (
        <div className="w-full bg-[#0A1118] rounded-full h-2 overflow-hidden border border-[#0047AB]/20">
          <div
            className="bg-gradient-to-r from-[#0047AB] to-[#00D2FF] h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
