"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth-service";
import { TOKEN_KEY } from "../../config/env";

export default function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token);
      // Invalidate user-profile query cache to load fresh sessions
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      router.push("/");
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading: loginMutation.isPending,
    handleLogin,
  };
}
