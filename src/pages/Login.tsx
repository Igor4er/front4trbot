import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="text-4xl font-bold text-center mb-4">Trading bot</div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
