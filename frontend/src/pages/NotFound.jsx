import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-indigo-600">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-slate-500 text-sm max-w-md mt-1 mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
        <Link to="/">Back to Home</Link>
      </Button>
    </main>
  );
};

export default NotFound;