import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://paas-crud-app.onrender.com";

const Tracker = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", category: "", date: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/expenses`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Błąd podczas pobierania wydatków:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/expenses`, form, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      setExpenses([res.data, ...expenses]);
      setForm({ amount: "", description: "", category: "", date: "" });
    } catch (err) {
      alert("Błąd przy dodawaniu wydatku");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Na pewno usunąć ten wydatek?")) return;
    await axios.delete(`${API_URL}/expenses/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    fetchExpenses();
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date.split("T")[0] // Upewnij się że data ma format YYYY-MM-DD
    });
  };

  const handleUpdate = async () => {
    await axios.put(`${API_URL}/expenses/${editingId}`, form, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setEditingId(null);
    setForm({ amount: "", description: "", category: "", date: "" });
    fetchExpenses();
  };

  return (
    <div>
      <h2>Tracker</h2>
      <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
        <input placeholder="Kwota" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        <input placeholder="Opis" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Kategoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <button type="submit">{editingId ? "Zapisz zmiany" : "Dodaj"}</button>
        {editingId && <button onClick={() => { setEditingId(null); setForm({ amount: "", description: "", category: "", date: "" }); }}>Anuluj</button>}
      </form>
      <ul>
        {expenses.map(e => (
          <li key={e.id}>
            {e.amount} PLN - {e.description} ({e.category}) - {e.date.slice(0, 10)}{" "}
            <button onClick={() => handleEdit(e)}>✏️</button>
            <button onClick={() => handleDelete(e.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
};


const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setUser({ token: res.data.token });
    } catch {
      alert("Błędne dane logowania");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Logowanie</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Hasło" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Zaloguj</button>
    </form>
  );
};

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert("Zarejestrowano! Możesz się teraz zalogować.");
    } catch {
      alert("Email już istnieje");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Rejestracja</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Hasło" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Zarejestruj</button>
    </form>
  );
};

const Account = ({ user, setUser }) => {
  const deleteOnlyData = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć wszystkie swoje wydatki?")) return;
    await axios.delete(`${API_URL}/me/expenses`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    alert("Wszystkie dane zostały usunięte.");
  };

  const deleteAccount = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć konto? Tej operacji nie można cofnąć.")) return;
    await axios.delete(`${API_URL}/me/account`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    alert("Konto zostało usunięte.");
    setUser(null);
  };

  return (
    <div>
      <h2>Moje konto</h2>
      <button onClick={deleteOnlyData}>🧹 Usuń wszystkie dane</button>
      <button onClick={deleteAccount}>❌ Usuń konto</button>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <nav style={{ display: "flex", gap: "1em", padding: "1em", background: "#eee" }}>
        <Link to="/">Tracker</Link>
        {!user ? (
          <>
            <Link to="/login">Logowanie</Link>
            <Link to="/register">Rejestracja</Link>
          </>
        ) : (
          <>
            <Link to="/account">Moje konto</Link>
            <a href="#" onClick={() => setUser(null)}>Wyloguj</a>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Tracker user={user} />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/account" element={user ? <Account user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;