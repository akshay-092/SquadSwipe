import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axiosInstance';

const Register = () => {
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const handleCredentialResponse = async response => {
      try {
        const { data } = await axiosInstance.post('/userSignIn', {
          token: response.credential,
        });

        console.log('Google sign-in response:', data);
        if (data?.success && data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.token) {
            localStorage.setItem('token', data.user.token);
          }
          toast.success('Signed in successfully');
          window.location.assign('/dashboard');
        } else {
          toast.error('Sign-in failed. Please try again.');
        }
      } catch (error) {
        toast.error('Google sign-in failed');
      }
    };

    const renderGoogleButton = () => {
      if (!window.google || !window.google.accounts || !googleBtnRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id:
          '85189131742-usin46ddrfbi6kejbq9voks3q1r6v00j.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'continue_with',
        size: 'large',
        logo_alignment: 'left',
        width: 320,
      });

      return true;
    };

    if (renderGoogleButton()) {
      return;
    }

    const intervalId = setInterval(() => {
      if (renderGoogleButton()) {
        clearInterval(intervalId);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
          SS
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Welcome to Squad Swipe
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Decide together in minutes. Create a squad, drop options, and let
          everyone vote.
        </p>
        <div className="mt-3 w-full flex justify-center">
          <div ref={googleBtnRef}></div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Register;
