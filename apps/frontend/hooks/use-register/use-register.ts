"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/auth-service";
import { TOKEN_KEY } from "../../config/env";

export default function useRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleRegister,
  };
}
