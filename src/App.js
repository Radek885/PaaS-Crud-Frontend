import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://paas-crud-app.onrender.com";

const Tracker = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", category: "", date: "" });
  const [editingId, setEditingId] = useState(null);
  const [budget, setBudget] = useState(0);

  const fetchExpensesAndBudget = async () => {
    try {
      const [expensesRes, budgetRes] = await Promise.all([
        axios.get(`${API_URL}/expenses`, {
          headers: user ? { Authorization: `Bearer ${user.token}` } : {}
        }),
        axios.get(`${API_URL}/me/budget`, {
          headers: user ? { Authorization: `Bearer ${user.token}` } : {}
        })
      ]);
      setExpenses(expensesRes.data);
      setBudget(parseFloat(budgetRes.data.budget) || 0);
    } catch (err) {
      console.error("Błąd przy pobieraniu danych:", err);
    }
  };

  useEffect(() => {
    fetchExpensesAndBudget();
  }, [user]);

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const handleBudgetBlur = async () => {
    try {
      await axios.put(
        `${API_URL}/me/budget`,
        { budget: parseFloat(budget) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      alert("Błąd przy zapisie budżetu");
    }
  };

  return (
    <div>
      <h2>Tracker</h2>
      <div style={{ marginBottom: "1em" }}>
        <label>
          Budżet: <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onBlur={handleBudgetBlur}
            style={{ width: "100px" }}
          /> PLN
        </label>
      </div>

      <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
        {/* ... (formularz jak wcześniej) */}
      </form>

      <ul>
        {expenses.map(e => (
          <li key={e.id}>
            {e.amount} PLN - {e.description} ({e.category}) - {e.date.slice(0, 10)}
            <button onClick={() => handleEdit(e)}>✏️</button>
            <button onClick={() => handleDelete(e.id)}>🗑</button>
          </li>
        ))}
      </ul>

      <h3>Podsumowanie</h3>
      <p>Suma wydatków: {total.toFixed(2)} PLN</p>
      <p>Pozostały budżet: {(budget - total).toFixed(2)} PLN</p>
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