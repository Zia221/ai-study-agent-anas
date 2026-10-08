import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./services/auth";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ChatPage from "./pages/ChatPage";
import TestsPage from "./pages/TestsPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import LearningAgentPage from "./pages/LearningAgentPage";
import SettingsPage from "./pages/SettingsPage";
import ProgressPage from "./pages/ProgressPage";
import NotesPage from "./pages/NotesPage";
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DocumentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TestsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FlashcardsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
    path="/learning-agent"
    element={
        <ProtectedRoute>
          <DashboardLayout>
            <LearningAgentPage />
          </DashboardLayout>

        </ProtectedRoute>
    }
/>

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProgressPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
