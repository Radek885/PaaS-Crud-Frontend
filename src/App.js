import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://paas-crud-app.onrender.com";

const Tracker = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "", category: "", date: "" });
  const [editingId, setEditingId] = useState(null);
  const [budget, setBudget] = useState(0);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${API_URL}/expenses`, form, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setExpenses([...expenses, res.data]);
    setForm({ amount: "", description: "", category: "", date: "" });
  } catch (err) {
    alert("Błąd przy dodawaniu wydatku");
  }
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
  if (!user) {
    setExpenses([
      { id: 1, amount: 50, description: "Zakupy", category: "Spożywcze", date: "2025-06-01" },
      { id: 2, amount: 120, description: "Paliwo", category: "Transport", date: "2025-06-02" },
      { id: 3, amount: 30, description: "Netflix", category: "Rozrywka", date: "2025-06-03" }
    ]);
    setBudget(300); // przykładowy budżet
    return;
  }

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
          <div className="container py-4">
        <h2 className="mb-4">Tracker</h2>

        <div className="mb-3">
          <label className="form-label">
            Budżet:
            <input
              type="number"
              className="form-control d-inline-block w-auto ms-2"
              value={budget}
              disabled={!user}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={user ? handleBudgetBlur : undefined}
            />
            PLN
          </label>
        </div>

        {!user && (
          <div className="alert alert-secondary">
            <strong>Zaloguj się, aby kontrolować własne wydatki i zapisywać dane.</strong>
          </div>
        )}

        {user && (
          <form
            onSubmit={editingId ? handleUpdate : handleSubmit}
            className="mb-4 row g-2 align-items-end"
          >
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Kwota"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Opis"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Kategoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                {editingId ? "Zapisz" : "Dodaj"}
              </button>
            </div>
          </form>
        )}

        <ul className="list-group mb-4">
          {expenses.map((e) => (
            <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                {e.amount} PLN - {e.description} ({e.category}) - {e.date.slice(0, 10)}
              </div>
              {user && (
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(e)}>✏️</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)}>🗑</button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <h3>Podsumowanie</h3>
        <p><strong>Suma wydatków:</strong> {total.toFixed(2)} PLN</p>
        <p><strong>Pozostały budżet:</strong> {(budget - total).toFixed(2)} PLN</p>
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
    <form onSubmit={handleLogin} className="container mt-4">
      <h2>Logowanie</h2>
      <input className="form-control mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="form-control mb-2" placeholder="Hasło" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn btn-primary" type="submit">Zaloguj</button>
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
    <div className="container mt-4">
      <h2>Moje konto</h2>
      <button className="btn btn-warning me-2" onClick={deleteOnlyData}>🧹 Usuń wszystkie dane</button>
      <button className="btn btn-danger" onClick={deleteAccount}>❌ Usuń konto</button>
    </div>

  );
};

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 mb-4">
        <Link className="navbar-brand" to="/">Tracker</Link>
        <div className="collapse navbar-collapse">
          <div className="navbar-nav">
            {!user ? (
              <>
                <Link className="nav-link" to="/login">Logowanie</Link>
                <Link className="nav-link" to="/register">Rejestracja</Link>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/account">Moje konto</Link>
                <a className="nav-link" href="#" onClick={() => setUser(null)}>Wyloguj</a>
              </>
            )}
          </div>
        </div>
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