"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth/auth-service";
import { TOKEN_KEY } from "../../config/env";

export default function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () => authService.register(name, email, password),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token);
      // Invalidate profile query to boot session immediately
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      router.push("/");
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    registerMutation.mutate();
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading: registerMutation.isPending,
    handleRegister,
  };
}
