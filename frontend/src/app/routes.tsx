import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import AskPage from './pages/AskPage';
import BrowseQuestionsPage from './pages/BrowseQuestionsPage';
import QuestionThreadPage from './pages/QuestionThreadPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import InstitutionPage from './pages/InstitutionPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
import InstitutionsListPage from './pages/InstitutionsListPage';
import NotFoundPage from './pages/NotFoundPage';
import ForbiddenPage from './pages/ForbiddenPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'register', Component: RegisterPage },
      { path: 'verify-email', Component: VerifyEmailPage },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'ask', Component: AskPage },
      { path: 'questions', Component: BrowseQuestionsPage },
      { path: 'questions/:id', Component: QuestionThreadPage },
      { path: 'admin', Component: AdminPanel },
      { path: 'profile/:userId', Component: ProfilePage },
      { path: 'institutions', Component: InstitutionsListPage },
      { path: 'institutions/:id', Component: InstitutionPage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'messages/:id', Component: ConversationPage },
      { path: '403', Component: ForbiddenPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

