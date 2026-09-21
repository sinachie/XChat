import React, { useState, useEffect } from "react";
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage
} from "../lib/crypto";
import { ShieldCheck, Lock, Send } from "lucide-react";

export const EncryptedChat = () => {
  const [keys, setKeys] = useState(null);
  const [remotePubKeyInput, setRemotePubKeyInput] = useState("");
  const [sharedSecret, setSharedSecret] = useState(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    async function initKeys() {
      const pair = await generateKeyPair();
      const exportedPub = await exportPublicKey(pair.publicKey);
      setKeys({ pair, exportedPub });
    }
    initKeys();
  }, []);

  const handleHandshake = async () => {
    if (!remotePubKeyInput.trim() || !keys) return;
    try {
      const importedRemoteKey = await importPublicKey(remotePubKeyInput.trim());
      const derived = await deriveSharedSecret(
        keys.pair.privateKey,
        importedRemoteKey
      );
      setSharedSecret(derived);
    } catch (err) {
      alert("Invalid Public Key input.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !sharedSecret) return;

    const encrypted = await encryptMessage(sharedSecret, message);
    const decryptedText = await decryptMessage(
      sharedSecret,
      encrypted.ciphertext,
      encrypted.iv
    );

    setChatLog((prev) => [
      ...prev,
      {
        id: Date.now(),
        ciphertext: encrypted.ciphertext,
        plaintext: decryptedText
      }
    ]);
    setMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#0A1118] border border-[#0047AB]/30 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#0047AB]/20 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00D2FF]" />
          <h2 className="text-white font-bold text-sm tracking-wide">
            PFS Encrypted Tunnel
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          {sharedSecret ? "SECURE HANDSHAKE ESTABLISHED" : "AWAITING HANDSHAKE"}
        </span>
      </div>

      {!sharedSecret ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-mono">
              Your Ephemeral Public Key:
            </label>
            <textarea
              readOnly
              value={keys?.exportedPub || "Generating keys..."}
              className="w-full bg-[#05080C] text-[10px] font-mono text-[#00D2FF] p-2 border border-[#0047AB]/30 rounded-lg resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-mono">
              Enter Peer's Public Key:
            </label>
            <textarea
              value={remotePubKeyInput}
              onChange={(e) => setRemotePubKeyInput(e.target.value)}
              placeholder="Paste remote public key base64 string..."
              className="w-full bg-[#05080C] text-[10px] font-mono text-white p-2 border border-[#0047AB]/30 rounded-lg resize-none focus:outline-none focus:border-[#00D2FF]"
              rows={2}
            />
          </div>
          <button
            onClick={handleHandshake}
            className="w-full py-2 bg-[#0047AB] hover:bg-[#0066FF] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Derive Shared AES-256 Key
          </button>
        </div>
      ) : (
        <div>
          <div className="h-64 overflow-y-auto space-y-3 p-2 bg-[#05080C] rounded-xl border border-[#0047AB]/20 mb-4">
            {chatLog.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-[#0A1118] border border-[#0047AB]/30 rounded-lg"
              >
                <div className="text-[9px] font-mono text-slate-500 truncate mb-1">
                  RAW ENCRYPTED: {item.ciphertext}
                </div>
                <div className="text-xs text-white font-sans">
                  {item.plaintext}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type encrypted message..."
              className="flex-1 bg-[#05080C] border border-[#0047AB]/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00D2FF]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#0047AB] to-[#00D2FF] text-white rounded-xl hover:opacity-90 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
