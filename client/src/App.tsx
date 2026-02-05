import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { Loading } from './components/ui/Loading';

// Lazy load all pages and layouts
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const CustomRoleLayout = lazy(() => import('./layouts/CustomRoleLayout'));
const TeacherLayout = lazy(() => import('./layouts/TeacherLayout'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const PublicTestResult = lazy(() => import('./pages/PublicTestResult'));
const BlockTestPrintAllPage = lazy(() => import('./pages/teacher/BlockTestPrintAllPage'));
const BlockTestPrintQuestionsPage = lazy(() => import('./pages/teacher/BlockTestPrintQuestionsPage'));
const BlockTestPrintAnswersPage = lazy(() => import('./pages/teacher/BlockTestPrintAnswersPage'));
const BlockTestAnswerKeysPage = lazy(() => import('./pages/teacher/BlockTestAnswerKeysPage'));
const BlockTestAllTestsPage = lazy(() => import('./pages/teacher/BlockTestAllTestsPage'));
const BlockTestAnswerSheetsViewPage = lazy(() => import('./pages/teacher/BlockTestAnswerSheetsViewPage'));

function App() {
  const { user } = useAuthStore();

  // Определяем layout для пользователя на основе его прав
  const getUserLayout = () => {
    if (!user) return null;
    
    // Системные роли
    if (user.role === 'SUPER_ADMIN') return 'admin';
    if (user.role === 'FIL_ADMIN') return 'custom';
    if (user.role === 'TEACHER') return 'teacher';
    
    // Для кастомных ролей всегда используем custom layout
    return 'custom';
  };

  const layout = getUserLayout();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/p/:token" element={<PublicProfile />} />
          <Route path="/profile/:token" element={<PublicProfile />} />
          <Route path="/test-result/:resultId/:token" element={<PublicTestResult />} />
          
          {user?.role === 'SUPER_ADMIN' && (
            <Route path="/admin/*" element={<SuperAdminLayout />} />
          )}
          
          {(user?.role === 'FIL_ADMIN' || layout === 'custom') && (
            <Route path="/custom/*" element={<CustomRoleLayout />} />
          )}
          
          {/* Print pages - no layout - MUST BE BEFORE /teacher/* */}
          {(user?.role === 'TEACHER' || layout === 'teacher') && (
            <>
              <Route path="/teacher/block-tests/:id/print-all" element={<BlockTestPrintAllPage />} />
              <Route path="/teacher/block-tests/:id/print-questions" element={<BlockTestPrintQuestionsPage />} />
              <Route path="/teacher/block-tests/:id/print-answers" element={<BlockTestPrintAnswersPage />} />
              <Route path="/teacher/block-tests/:id/answer-keys" element={<BlockTestAnswerKeysPage />} />
              <Route path="/teacher/block-tests/:id/all-tests" element={<BlockTestAllTestsPage />} />
              <Route path="/teacher/block-tests/:id/answer-sheets" element={<BlockTestAnswerSheetsViewPage />} />
              <Route path="/teacher/*" element={<TeacherLayout />} />
            </>
          )}
          
          <Route path="/" element={
            user ? (
              layout === 'admin' ? <Navigate to="/admin" /> :
              layout === 'custom' ? <Navigate to="/custom" /> :
              <Navigate to="/teacher" />
            ) : <LandingPage />
          } />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
