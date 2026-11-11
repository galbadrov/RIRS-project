import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <h1 className="text-2xl font-bold text-slate-900">Registracija</h1>
        <p className="mt-3 text-slate-600">Nov uporabniški račun ustvari administrator.</p>
        <Link
          className="mt-6 inline-block font-semibold text-slate-900 underline underline-offset-4"
          to="/login"
        >
          Nazaj na prijavo
        </Link>
      </section>
    </main>
  )
}
