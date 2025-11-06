import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/Pages/Dashboard';
import App from './App';
import Leaderboard from '@/Pages/Leaderboard';

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