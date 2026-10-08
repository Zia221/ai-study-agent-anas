import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { removeToken } from "../services/auth";
import PageHeader from "../components/PageHeader";
const DEFAULT_SETTINGS = {
  difficulty: "medium",
  test_question_count: 10,
  learning_style: "balanced",
  tutor_response_length: "balanced",
  tutor_examples: true,
  tutor_follow_up_questions: true,
  theme: "dark",
};

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  const root = document.documentElement;
  const actualTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(actualTheme === "light" ? "theme-light" : "theme-dark");
  root.dataset.theme = actualTheme;
}

function Section({ icon, title, description, children, danger = false }) {
  return (
    <section
      className={`settings-card ${danger ? "settings-card-danger" : ""}`}
    >
      <div className="settings-section-title">
        <div className="settings-section-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SelectField({ label, value, onChange, options, hint }) {
  return (
    <label className="settings-field">
      <span className="settings-label">{label}</span>
      <select value={value} onChange={onChange} className="settings-input">
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="settings-hint">{hint}</span>}
    </label>
  );
}

function Toggle({ title, description, checked, onChange }) {
  return (
    <label className="settings-toggle">
      <span className="settings-toggle-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="settings-switch">
        <span />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    const handleSystemThemeChange = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener?.("change", handleSystemThemeChange);

    return () => {
      media.removeEventListener?.("change", handleSystemThemeChange);
    };
  }, [settings.theme]);

  async function loadUser() {
    try {
      setError("");

      const response = await apiFetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load profile.");
      }

      setUser(data);
      setUsername(data.username || "");
      setEmail(data.email || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const response = await apiFetch("/api/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load settings.");
      }

      const merged = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      applyTheme(merged.theme);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSettingsMessage("");

    if (key === "theme") {
      applyTheme(value);
    }
  }

  async function handleSaveProfile() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Username cannot be empty.");
      setSuccess("");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const response = await apiFetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not update profile.");
      }

      setUser(data);
      setUsername(data.username || "");
      setEmail(data.email || "");
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiFetch("/api/auth/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not change password.");
      }

      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSaveSettings() {
    try {
      setSavingSettings(true);
      setSettingsMessage("");
      setError("");

      const response = await apiFetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not save settings.");
      }

      const merged = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      applyTheme(merged.theme);
      setSettingsMessage("Preferences saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  function handleLogout() {
    removeToken();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-loading">
          <div className="settings-spinner" />
          <p>Loading your settings...</p>
        </div>
      </main>
    );
  }

  const displayName = user?.username || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="settings-page">
      <div className="settings-shell">
        {/* Top navigation */}
        <header className="settings-header">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="back-home-button"
          >
            <span>←</span>
            Back to Home
          </button>

          <div className="settings-user-chip">
            <span className="settings-user-avatar">{initial}</span>
            <div>
              <small>Signed in as</small>
              <strong>{displayName}</strong>
            </div>
          </div>
        </header>

        {/* Page hero */}
        <div className="settings-hero">
          <div>
            <div className="settings-eyebrow">
              <span />
              STUDYAI SETTINGS
            </div>

            <h1>Settings</h1>

            <p>
              Personalize your account, learning experience, AI tutor, and
              appearance.
            </p>
          </div>

          <div className="settings-hero-icon">⚙️</div>
        </div>

        {error && (
          <div className="settings-alert settings-alert-error">
            <span>!</span>
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="settings-alert settings-alert-success">
            <span>✓</span>
            <div>
              <strong>Profile saved</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Profile */}
        <Section
          icon="👤"
          title="Profile"
          description="Manage your basic account information."
        >
          <div className="profile-banner">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-info">
              <h3>{displayName}</h3>
              <p>AI Study Agent Student</p>
            </div>
            <div className="profile-badge">Active</div>
          </div>

          <div className="settings-grid">
            <label className="settings-field">
              <span className="settings-label">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="settings-input"
                placeholder="Your username"
              />
            </label>

            <label className="settings-field">
              <span className="settings-label">Email address</span>
              <input
                value={email}
                disabled
                className="settings-input settings-disabled"
              />
              <span className="settings-hint">
                Email changes are disabled for account security.
              </span>
            </label>
          </div>

          <div className="settings-actions">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="primary-button"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </Section>

        {/* Security */}
        <Section
          icon="🛡️"
          title="Security"
          description="Protect your account and manage authentication."
        >
          <div className="security-heading">
            <div>
              <h3>Change password</h3>
              <p>Use a strong password with at least 8 characters.</p>
            </div>
            <span className="status-badge">Protected</span>
          </div>

          <div className="settings-grid">
            <label className="settings-field">
              <span className="settings-label">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="settings-input"
                placeholder="Enter current password"
              />
            </label>

            <label className="settings-field">
              <span className="settings-label">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="settings-input"
                placeholder="At least 8 characters"
              />
            </label>

            <label className="settings-field settings-field-full">
              <span className="settings-label">Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="settings-input"
                placeholder="Repeat your new password"
              />
            </label>
          </div>

          {passwordError && (
            <div className="inline-message error">{passwordError}</div>
          )}

          {passwordMessage && (
            <div className="inline-message success">{passwordMessage}</div>
          )}

          <div className="settings-actions">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="secondary-button"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>

          <div className="security-list">
            <div className="security-item">
              <div className="security-item-icon google-icon">G</div>
              <div>
                <strong>Google Account</strong>
                <p>Use Google to securely sign in.</p>
              </div>
              <span className="status-badge green">Connected</span>
            </div>

            <div className="security-item">
              <div className="security-item-icon">🔐</div>
              <div>
                <strong>Authentication</strong>
                <p>Your account is protected by secure authentication.</p>
              </div>
              <span className="status-badge">Secure</span>
            </div>
          </div>
        </Section>

        {/* Learning */}
        <Section
          icon="🎯"
          title="Learning Preferences"
          description="Customize the defaults used when you practice and learn."
        >
          <div className="settings-grid">
            <SelectField
              label="Default difficulty"
              value={settings.difficulty}
              onChange={(event) =>
                updateSetting("difficulty", event.target.value)
              }
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
              hint="Default difficulty for generated tests."
            />

            <SelectField
              label="Default test questions"
              value={settings.test_question_count}
              onChange={(event) =>
                updateSetting("test_question_count", Number(event.target.value))
              }
              options={[
                { value: 5, label: "5 questions" },
                { value: 10, label: "10 questions" },
                { value: 15, label: "15 questions" },
                { value: 20, label: "20 questions" },
              ]}
            />

            <SelectField
              label="Learning style"
              value={settings.learning_style}
              onChange={(event) =>
                updateSetting("learning_style", event.target.value)
              }
              options={[
                { value: "beginner", label: "Beginner friendly" },
                { value: "balanced", label: "Balanced" },
                { value: "advanced", label: "Advanced" },
              ]}
              hint="Controls the level of explanation."
            />
          </div>

          {settingsMessage && (
            <div className="inline-message success">{settingsMessage}</div>
          )}

          <div className="settings-actions">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="primary-button"
            >
              {savingSettings ? "Saving..." : "Save Learning Preferences"}
            </button>
          </div>
        </Section>

        {/* AI Tutor */}
        <Section
          icon="🤖"
          title="AI Tutor"
          description="Customize how your AI tutor teaches and checks your understanding."
        >
          <div className="settings-grid">
            <SelectField
              label="Response length"
              value={settings.tutor_response_length}
              onChange={(event) =>
                updateSetting("tutor_response_length", event.target.value)
              }
              options={[
                { value: "short", label: "Short" },
                { value: "balanced", label: "Balanced" },
                { value: "detailed", label: "Detailed" },
              ]}
              hint="Choose how much detail the tutor normally gives."
            />
          </div>

          <div className="toggle-list">
            <Toggle
              title="Use examples"
              description="Ask the tutor to include practical examples while teaching."
              checked={settings.tutor_examples}
              onChange={(event) =>
                updateSetting("tutor_examples", event.target.checked)
              }
            />

            <Toggle
              title="Follow-up questions"
              description="Let the tutor ask questions to check your understanding."
              checked={settings.tutor_follow_up_questions}
              onChange={(event) =>
                updateSetting("tutor_follow_up_questions", event.target.checked)
              }
            />
          </div>

          <div className="settings-actions">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="primary-button"
            >
              {savingSettings ? "Saving..." : "Save AI Preferences"}
            </button>
          </div>
        </Section>

        {/* Appearance */}
        <Section
          icon="✨"
          title="Appearance"
          description="Choose how StudyAI looks on your device."
        >
          <div className="theme-grid">
            {[
              {
                value: "dark",
                icon: "🌙",
                title: "Dark",
                description: "Focused and easy on the eyes.",
              },
              {
                value: "light",
                icon: "☀️",
                title: "Light",
                description: "Bright, clean, and simple.",
              },
              {
                value: "system",
                icon: "💻",
                title: "System",
                description: "Follow your device preference.",
              },
            ].map((theme) => (
              <button
                type="button"
                key={theme.value}
                onClick={() => updateSetting("theme", theme.value)}
                className={`theme-option ${
                  settings.theme === theme.value ? "active" : ""
                }`}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-copy">
                  <strong>{theme.title}</strong>
                  <small>{theme.description}</small>
                </span>
                <span className="theme-check">
                  {settings.theme === theme.value ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="theme-preview">
            <div>
              <span className="preview-dot" />
              <span>Current appearance</span>
            </div>

            <strong>
              {settings.theme === "system"
                ? `System • ${getSystemTheme()}`
                : settings.theme === "light"
                  ? "Light mode"
                  : "Dark mode"}
            </strong>
          </div>

          <div className="settings-actions">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="primary-button"
            >
              {savingSettings ? "Saving..." : "Save Appearance"}
            </button>
          </div>
        </Section>

        {/* Account */}
        <Section
          icon="⚙️"
          title="Account"
          description="Manage your current session and account actions."
          danger
        >
          <div className="account-row">
            <div>
              <h3>Sign out</h3>
              <p>Sign out of StudyAI on this device.</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              Log out
            </button>
          </div>

          <div className="danger-zone">
            <div>
              <h3>Danger Zone</h3>
              <p>
                Account deletion permanently removes your account and associated
                data.
              </p>
            </div>

            <button type="button" disabled className="delete-button">
              Delete Account
            </button>
          </div>
        </Section>

        <footer className="settings-footer">
          <span>StudyAI</span>
          <span>Your preferences are saved securely to your account.</span>
        </footer>
      </div>
    </main>
  );
}
