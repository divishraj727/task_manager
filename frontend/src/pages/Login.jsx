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

      {/* ── MOBILE: robot fills screen, form floats over it ── */}
      <div className="md:hidden absolute inset-0 z-0">
        <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="w-full h-full" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* ── DESKTOP LEFT: robot panel ── */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden h-full">
        <InteractiveRobotSpline
          scene={ROBOT_SCENE_URL}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute bottom-10 left-10 z-10 pointer-events-none">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Task Manager</h2>
          <p className="text-gray-300 text-sm mt-1 drop-shadow">Stay organised. Get things done.</p>
        </div>
      </div>

      {/* ── RIGHT / MOBILE OVERLAY: form panel ── */}
      <div className="
        relative z-10 w-full
        md:w-1/2 lg:w-2/5
        h-full flex flex-col
        md:bg-gray-900
        px-5 md:px-10 lg:px-16
      ">
        {/* Centre the form vertically, push footer to bottom */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xs">

            {/* Logo + heading */}
            <div className="text-center mb-4 md:mb-6">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg shadow-primary-600/40">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-lg md:text-2xl font-bold text-white">Sign in</h1>
              <p className="text-xs text-gray-400 mt-0.5">to your Task Manager account</p>
            </div>

            {/* Form card — glass on mobile, flat on desktop */}
            <div className="bg-white/10 md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-none border border-white/15 md:border-0 p-5 md:p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/80 text-white px-3 py-1.5 text-xs placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="you@example.com"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/80 text-white px-3 py-1.5 text-xs placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Your password"
                    {...register("password", { required: "Password is required" })}
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-3">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300 hover:underline">
                  Register
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Footer — always visible at bottom */}
        <div className="shrink-0 pb-3 md:pb-4">
          <Footer />
        </div>
      </div>

    </div>
  );
}
