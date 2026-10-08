import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../services/auth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export default function GoogleButton() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.google || !buttonRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

      callback: async (response) => {
        try {
          setError("");

          const backendResponse = await fetch(
            `${API_URL}/api/auth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                credential: response.credential,
              }),
            }
          );

          const data = await backendResponse.json();

          if (!backendResponse.ok) {
            throw new Error(
              data.detail || "Google authentication failed."
            );
          }

          saveToken(data.access_token);

          navigate("/");
        } catch (error) {
          setError(error.message);
        }
      },
    });

    window.google.accounts.id.renderButton(
      buttonRef.current,
      {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
      }
    );
  }, [navigate]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className="flex justify-center"
      />

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}