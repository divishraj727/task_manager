import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../stores/authStore";
import Footer from "@/components/Footer";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    const result = await login(values);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      const err = result.error;
      if (err?.detail) {
        toast.error(err.detail);
      } else {
        setError("email", { message: "Invalid email or password." });
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">

      {/* Left — 3D Robot (hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden h-full">
        <InteractiveRobotSpline
          scene={ROBOT_SCENE_URL}
          className="absolute inset-0 w-full h-full"
        />
        {/* Branding overlay bottom-left */}
        <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Task Manager</h2>
          <p className="text-gray-300 text-sm mt-1 drop-shadow">Stay organised. Get things done.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-full overflow-y-auto flex flex-col items-center justify-center bg-gray-900 px-6 py-8 md:px-10 lg:px-16">

        {/* Logo */}
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/40">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Sign in</h1>
            <p className="text-sm text-gray-400 mt-1">to your Task Manager account</p>
          </div>

          {/* Mobile robot preview (small banner, mobile only) */}
          <div className="md:hidden relative h-48 rounded-2xl overflow-hidden mb-8 bg-gray-950">
            <InteractiveRobotSpline
              scene={ROBOT_SCENE_URL}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Your password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300 hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
