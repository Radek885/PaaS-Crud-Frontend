import { useEffect, useState } from "react";

const API_URL = "https://paas-blog.onrender.com"; // <- ZMIEŃ NA WŁAŚCIWY URL backendu

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
  title: "",
  content: "",
  username: "",
  image_url: "",
});


  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then(setPosts)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setForm({ title: "", content: "", username: "", image_url: ""});
  };

  return (
    <div style={{ padding: "2em", fontFamily: "sans-serif" }}>
      <h1>Blog</h1>

      <form onSubmit={handleSubmit}>
        <input className="input-wide"
          placeholder="Nazwa użytkownika"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <br />
        <input className="input-wide"
          placeholder="Link do zdjęcia"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <br />
        <input className="input-wide"
          placeholder="Tytuł"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <br />
        <textarea className="input-wide"
          placeholder="Treść"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <br />
        <button type="submit">Dodaj post</button>
      </form>

      <hr />

      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: "1em" }}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p><strong>Autor:</strong> {post.username || "Anonim"}</p>
          {post.image_url && (
            <img src={post.image_url} alt="Obrazek" style={{ maxWidth: "300px", maxHeight: "200px" }} />
          )}
          <br />
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}

    </div>
  );
}

export default App;
