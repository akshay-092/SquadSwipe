import Register from './components/auth/register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <Register />
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
};

export default App;
