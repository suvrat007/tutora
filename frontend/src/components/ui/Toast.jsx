import { Toaster, toast } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#4a3a2c',
          color: '#f8ede3',
        },
        success: {
          iconTheme: {
            primary: '#f8ede3',
            secondary: '#4a3a2c',
          },
        },
        error: {
          iconTheme: {
            primary: '#f8ede3',
            secondary: '#4a3a2c',
          },
        },
      }}
    />
  );
};

export const notify = (message, type = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warn(message);
      break;
    default:
      toast.info(message);
      break;
  }
};

export default ToastProvider;