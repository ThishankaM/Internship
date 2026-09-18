import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "@/components/states/loading-state";
import { AuthProvider } from "@/providers/auth-provider";
import { AdminRoute, ProtectedRoute } from "@/protected-route";

const AdminPage = lazy(() => import("@/pages/AdminPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const MyTasksView = lazy(() => import("@/components/views/my-tasks-view"));
const ProjectsView = lazy(() => import("@/components/views/projects-view"));
const ScheduleView = lazy(() => import("@/components/views/schedule-view"));
const MyDayView = lazy(() => import("@/components/views/my-day-view"));

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoadingState message="Loading..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<AuthPage key="login" />} />
            <Route
              path="/forgot-password"
              element={<AuthPage key="forgot" mode="forgot" />}
            />
            <Route
              path="/reset-password"
              element={<AuthPage key="reset" mode="reset" />}
            />

            {/* Dashboard shell with the workspace views nested inside it */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/tasks" replace />} />
              <Route path="tasks" element={<MyTasksView />} />
              <Route path="projects" element={<ProjectsView />} />
              <Route path="schedule" element={<ScheduleView />} />
              <Route path="my-day" element={<MyDayView />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
