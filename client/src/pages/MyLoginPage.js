import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function MyLoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch("/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("user", JSON.stringify(data.user));
				navigate("/portal");
			} else {
				setError(data.error || "Login failed");
			}
		} catch (err) {
			setError("Network error. Please try again.");
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<h1>UT Hardware Portal</h1>
				<h2>Login</h2>

				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="username">Username:</label>
						<input
							type="text"
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password:</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>

					<button type="submit" className="login-btn">
						Login
					</button>
				</form>

				<p className="register-link">
					Don't have an account? <Link to="/register">Register here</Link>
				</p>
			</div>
		</div>
	);
}

export default MyLoginPage;
