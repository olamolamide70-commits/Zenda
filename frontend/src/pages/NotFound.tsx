import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] relative overflow-hidden">
       <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] -z-10" />
      <div className="text-center p-12 bg-white rounded-[3rem] border border-border shadow-sm max-w-md w-full">
        <h1 className="mb-6 text-9xl font-black text-primary/10 tracking-tighter">404</h1>
        <p className="mb-8 text-xl font-medium text-slate-500 uppercase tracking-widest text-[12px]">Page Not Found</p>
        <p className="mb-10 text-slate-500 italic">We can't find the page you're looking for. It might have been moved or doesn't exist.</p>
        <a href="/" className="inline-flex h-16 items-center justify-center px-10 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all shadow-xl uppercase tracking-widest text-[10px]">
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
