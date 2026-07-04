"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth/auth-service";
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
      // Set a lightweight session cookie so proxy.ts can do optimistic redirects.
      // This is NOT the JWT — just a presence flag. Real auth is enforced by the backend.
      document.cookie = "devforge_session=1; path=/; SameSite=Strict; max-age=604800";
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
