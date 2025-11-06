import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/components/Pages/Dashboard/Dashboard';
import App from './App';
import Leaderboard from '@/components/Pages/Leaderboard/Leaderboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path:'/leaderboard',
        element: <Leaderboard />
      }
      // Add more routes here as needed
    ]
  }
]);