import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { db } from "../../../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const BlogEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await addDoc(collection(db, "blogs"), {
        title,
        imageUrl,
        content,

        createdAt: new Date(),
      });

      setMessage({ type: "success", text: "Blog successfully created!" });
      setTitle("");
      setContent("");
    } catch (err) {
      setMessage({ type: "error", text: "Error: " + err.message });
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="container">
        <h2 className="title">Create a New Blog Post</h2>
        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
          <input
            type="text"
            placeholder="Image Url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="input"
          />

          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="editor"
          />

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>

        <style jsx>{`
          .container {
            max-width: 750px;
            margin: 40px auto;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          .title {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .message {
            text-align: center;
            padding: 10px;
            border-radius: 5px;
          }
          .success {
            background: #d4edda;
            color: #155724;
          }
          .error {
            background: #f8d7da;
            color: #721c24;
          }
          .form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .input {
            padding: 12px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 100%;
          }
          .editor {
            height: 250px;
          }
          .button {
            padding: 12px;
            font-size: 16px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .button:hover {
            background-color: #005bb5;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
  "image",
];

export default BlogEditor;
