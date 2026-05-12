import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './layouts/DashboardLayout';

// Lazy load pages for performance
const DashboardOverview = lazy(() => import('./pages/Dashboard/DashboardOverview'));
const QuestionBankManager = lazy(() => import('./pages/QuestionBank/QuestionBankManager'));
const StudentAnalytics = lazy(() => import('./pages/Students/StudentAnalytics'));
const MockTestManager = lazy(() => import('./pages/MockTests/MockTestManager'));
const RevenueManager = lazy(() => import('./pages/Revenue/RevenueManager'));

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/questions" element={<QuestionBankManager />} />
              <Route path="/students" element={<StudentAnalytics />} />
              <Route path="/mock-tests" element={<MockTestManager />} />
              <Route path="/revenue" element={<RevenueManager />} />
              {/* Fallback */}
              <Route path="*" element={<DashboardOverview />} />
            </Routes>
          </Suspense>
        </DashboardLayout>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
