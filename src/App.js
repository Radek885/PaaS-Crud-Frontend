import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://paas-crud-app.onrender.com";

const Tracker = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", category: "", date: "" });
  const [editingId, setEditingId] = useState(null);
  const [budget, setBudget] = useState(0);

  // Przykładowe dane demo
  const demoExpenses = [
    { id: 1, amount: 50, description: "Zakupy", category: "Spożywcze", date: "2025-06-01" },
    { id: 2, amount: 120, description: "Paliwo", category: "Transport", date: "2025-06-02" },
    { id: 3, amount: 30, description: "Netflix", category: "Rozrywka", date: "2025-06-03" }
  ];

  const fetchExpensesAndBudget = async () => {
    if (!user || !user.token) return;
    try {
      const [expensesRes, budgetRes] = await Promise.all([
        axios.get(`${API_URL}/expenses`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${API_URL}/me/budget`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);
      setExpenses(expensesRes.data);
      setBudget(parseFloat(budgetRes.data.budget) || 0);
    } catch (err) {
      console.error("Błąd przy pobieraniu danych:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpensesAndBudget();
    } else {
      setExpenses(demoExpenses);
      setBudget(300); // przykładowy budżet demo
    }
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

      {!user && (
        <p style={{ color: "gray", marginBottom: "1em" }}>
          <strong>Zaloguj się, aby kontrolować własne wydatki</strong>
        </p>
      )}

      <div style={{ marginBottom: "1em" }}>
        <label>
          Budżet:{" "}
          <input
            type="number"
            value={budget}
            disabled={!user}
            onChange={(e) => setBudget(e.target.value)}
            onBlur={handleBudgetBlur}
            style={{ width: "100px" }}
          />{" "}
          PLN
        </label>
      </div>

      {user && (
        <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
          {/* Formularz tylko dla zalogowanych */}
        </form>
      )}

      <ul>
        {expenses.map(e => (
          <li key={e.id}>
            {e.amount} PLN - {e.description} ({e.category}) - {e.date.slice(0, 10)}
            {user && (
              <>
                <button onClick={() => handleEdit(e)}>✏️</button>
                <button onClick={() => handleDelete(e.id)}>🗑</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <h3>Podsumowanie</h3>
      <p>Suma wydatków: {total.toFixed(2)} PLN</p>
      <p>Pozostały budżet: {(budget - total).toFixed(2)} PLN</p>
    </div>
  );
};

const handleUpdate = async () => {
  try {
    await axios.put(`${API_URL}/expenses/${editingId}`, form, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setExpenses(expenses.map(e => e.id === editingId ? { ...form, id: editingId } : e));
    setForm({ amount: "", description: "", category: "", date: "" });
    setEditingId(null);
  } catch (err) {
    alert("Błąd przy aktualizacji");
  }
};

const handleEdit = (e) => {
  setForm({
    amount: e.amount,
    description: e.description,
    category: e.category,
    date: e.date.slice(0, 10)
  });
  setEditingId(e.id);
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`${API_URL}/expenses/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setExpenses(expenses.filter(e => e.id !== id));
  } catch (err) {
    alert("Błąd przy usuwaniu wydatku");
  }
};

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

      <form onSubmit={editingId ? handleUpdate : handleSubmit}>
  <input
    type="number"
    placeholder="Kwota"
    value={form.amount}
    onChange={(e) => setForm({ ...form, amount: e.target.value })}
  />
  <input
    placeholder="Opis"
    value={form.description}
    onChange={(e) => setForm({ ...form, description: e.target.value })}
  />
  <input
    placeholder="Kategoria"
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
  />
  <input
    type="date"
    value={form.date}
    onChange={(e) => setForm({ ...form, date: e.target.value })}
  />
  <button type="submit">{editingId ? "Zapisz" : "Dodaj"}</button>
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