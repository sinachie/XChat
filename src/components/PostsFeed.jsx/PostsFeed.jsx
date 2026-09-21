import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { MediaUploader } from "./MediaUploader";
import { MessageSquare, Heart, RefreshCw } from "lucide-react";

const PAGE_SIZE = 5;

export const PostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const fetchInitialPosts = async () => {
    setLoading(true);
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const fetchNextPosts = async () => {
    if (!lastVisible || loading) return;
    setLoading(true);

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setPosts((prev) => [
        ...prev,
        ...snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      ]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    const user = auth.currentUser;
    const batch = writeBatch(db);
    const newPostRef = doc(collection(db, "posts"));

    batch.set(newPostRef, {
      authorId: user ? user.uid : "anonymous",
      authorName: user ? user.displayName || "XChat User" : "Anonymous User",
      content,
      mediaUrl,
      likeCount: 0,
      createdAt: serverTimestamp()
    });

    await batch.commit();
    setContent("");
    setMediaUrl("");
    fetchInitialPosts();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Atomic Post Editor */}
      <form
        onSubmit={handleCreatePost}
        className="bg-[#0A1118] border border-[#0047AB]/30 rounded-2xl p-4 mb-6 shadow-xl"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something across boundaries..."
          className="w-full bg-transparent border-none text-white focus:outline-none resize-none placeholder-slate-500 text-sm"
          rows={3}
        />
        <MediaUploader onUploadComplete={(url) => setMediaUrl(url)} />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-[#0047AB] to-[#00D2FF] text-white font-bold text-xs rounded-full hover:opacity-90 transition"
          >
            Post Message
          </button>
        </div>
      </form>

      {/* Cursor-Paginated Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#0A1118] border border-[#0047AB]/20 rounded-xl p-4 transition hover:border-[#0047AB]/50"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-white">
                {post.authorName}
              </span>
            </div>
            <p className="text-slate-200 text-sm mb-3">{post.content}</p>
            {post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="Post Media"
                className="w-full rounded-lg mb-3 object-cover max-h-80 border border-[#0047AB]/20"
              />
            )}
            <div className="flex items-center gap-6 text-slate-400 text-xs">
              <button className="flex items-center gap-1 hover:text-[#00D2FF]">
                <Heart className="w-4 h-4" /> {post.likeCount || 0}
              </button>
              <button className="flex items-center gap-1 hover:text-[#00D2FF]">
                <MessageSquare className="w-4 h-4" /> Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={fetchNextPosts}
            disabled={loading}
            className="px-6 py-2.5 bg-[#0A1118] border border-[#0047AB] text-[#00D2FF] font-semibold text-xs rounded-full hover:bg-[#0047AB]/20 transition flex items-center gap-2 mx-auto"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Loading..." : "Load More Posts"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
feed