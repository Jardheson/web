"use client";

import Link from "next/link";
import { Tv } from "lucide-react";
import { useState } from "react";
import { gql } from "@apollo/client/core";
import { useMutation as useApolloMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

const REGISTER_MUTATION = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [registerMutation, { loading }] = useApolloMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      // Redireciona para o login após o cadastro
      router.push("/login");
    },
    onError: () => {
      setError("Erro ao criar conta. Email pode já estar em uso.");
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation({ variables: { name, email, password } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070')] bg-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-black/80 rounded-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="text-3xl font-bold flex items-center gap-2 text-primary mb-2">
            <Tv className="w-10 h-10" />
            GlobePlay<span className="text-white">+</span>
          </Link>
          <p className="text-gray-400">Crie sua conta gratuita</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-500 text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition mt-2 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta? <Link href="/login" className="text-white hover:underline">Fazer login.</Link>
        </p>
      </div>
    </div>
  );
}
