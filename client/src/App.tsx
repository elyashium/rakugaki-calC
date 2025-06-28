import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '@/screens/home'
import '@mantine/core/styles.css'
import '@/index.css'
import { MantineProvider } from '@mantine/core'

const paths = [
  {
    path: "/",
    element: <Home />,
  },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
  return (
  <MantineProvider>
    <RouterProvider router={BrowserRouter} />
  </MantineProvider>
  )
};

export default App;

