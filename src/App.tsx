import { Route, Switch } from 'wouter';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

/* Public pages */
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

/* Auth required pages */
import PackagesPage from '@/pages/PackagesPage';
import PackageDetailPage from '@/pages/PackageDetailPage';
import QuizPage from '@/pages/QuizPage';
import MixedQuizPage from '@/pages/MixedQuizPage';
import WrongQuestionsPage from '@/pages/WrongQuestionsPage';
import FavoriteQuestionsPage from '@/pages/FavoriteQuestionsPage';
import SimulationSettingsPage from '@/pages/SimulationSettingsPage';
import SimulationPage from '@/pages/SimulationPage';
import SimulationResultPage from '@/pages/SimulationResultPage';
import StatsPage from '@/pages/StatsPage';
import ProfilePage from '@/pages/ProfilePage';

/* Admin pages */
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminQuestionsPage from '@/pages/AdminQuestionsPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminSubscriptionsPage from '@/pages/AdminSubscriptionsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Switch>
            {/* Public routes */}
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/admin/login" component={AdminLoginPage} />

            {/* Auth required routes */}
            <Route path="/packages">
              <ProtectedRoute>
                <PackagesPage />
              </ProtectedRoute>
            </Route>
            <Route path="/packages/:id">
              <ProtectedRoute>
                <PackageDetailPage />
              </ProtectedRoute>
            </Route>
            <Route path="/packages/:id/quiz">
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            </Route>
            <Route path="/packages/:id/mixed">
              <ProtectedRoute>
                <MixedQuizPage />
              </ProtectedRoute>
            </Route>
            <Route path="/packages/:id/wrong">
              <ProtectedRoute>
                <WrongQuestionsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/packages/:id/fav">
              <ProtectedRoute>
                <FavoriteQuestionsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/simulation">
              <ProtectedRoute>
                <SimulationSettingsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/simulation/:id">
              <ProtectedRoute>
                <SimulationPage />
              </ProtectedRoute>
            </Route>
            <Route path="/simulation/:id/result">
              <ProtectedRoute>
                <SimulationResultPage />
              </ProtectedRoute>
            </Route>
            <Route path="/stats">
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/profile">
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </Route>

            {/* Admin routes */}
            <Route path="/admin">
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            </Route>
            <Route path="/admin/questions">
              <AdminRoute>
                <AdminQuestionsPage />
              </AdminRoute>
            </Route>
            <Route path="/admin/users">
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            </Route>
            <Route path="/admin/subscriptions">
              <AdminRoute>
                <AdminSubscriptionsPage />
              </AdminRoute>
            </Route>

            {/* 404 */}
            <Route>
              <div className="min-h-[100dvh] flex items-center justify-center bg-navy-900">
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
                  <p className="text-gray-400">Sayfa bulunamadi.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
