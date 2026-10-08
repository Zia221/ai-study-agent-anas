import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "../components/GoogleButton";
export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log("REGISTER STATUS:", response.status);
      console.log("REGISTER DATA:", data);

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(data.detail.map((error) => error.msg).join(", "));
        }

        throw new Error(data.detail || "Registration failed.");
      }

      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-4xl">🎓</div>

            <h1 className="text-3xl font-bold text-white">StudyAI</h1>
          </div>

          <p className="text-zinc-400 text-sm">Your personal AI study tutor</p>
        </div>

        {/* Register Card */}
        <form
          onSubmit={handleRegister}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl"
        >
          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-white">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Start learning with your personal AI tutor.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-5">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
              required
            />
          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="w-full rounded-xl bg-white py-3.5 font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99]"
          >
            Create Account
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-sm text-gray-400">OR</span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleButton />

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-white hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Learn smarter. Study better. 🚀
        </p>
      </div>
    </div>
  );
}
