import { Link } from "react-router-dom";

import buildManagerLogo from "@/public/buildmanager.png";

export default function Login() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-8'>
      <section
        className='w-full max-w-md rounded-2xl border border-slate-300 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-12'
        aria-labelledby='login-title'>
        <header className='flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>
          <span className='grid size-12 z-10 overflow-hidden place-items-center rounded-xl border border-slate-400 bg-slate-100 text-slate-600'>
            <img
              src={buildManagerLogo}
              alt='BuildManager Logo'
              className='w-full h-full'
            />
          </span>
          BuildManager
        </header>

        <div className='my-8'>
          <h1 id='login-title' className='text-2xl font-bold text-slate-900'>
            Prijava
          </h1>
          <p className='mt-2 text-sm text-slate-600'>
            Prijavite se z računom zaposlenega.
          </p>
        </div>

        <form
          className='space-y-5'
          onSubmit={(event) => event.preventDefault()}>
          <label className='block text-sm font-semibold text-slate-900'>
            E-poštni naslov
            <input
              className='mt-2 h-12 w-full rounded-lg border border-slate-400 bg-white px-3 font-normal outline-none transition focus:border-slate-800 focus:ring-3 focus:ring-slate-800/15'
              name='email'
              type='email'
              autoComplete='email'
              placeholder='ime@podjetje.si'
              required
            />
          </label>

          <label className='block text-sm font-semibold text-slate-900'>
            Geslo
            <input
              className='mt-2 h-12 w-full rounded-lg border border-slate-400 bg-white px-3 font-normal outline-none transition focus:border-slate-800 focus:ring-3 focus:ring-slate-800/15'
              name='password'
              type='password'
              autoComplete='current-password'
              placeholder='Vnesite geslo'
              required
            />
          </label>

          <button
            className='h-12 w-full rounded-lg bg-slate-800 font-bold text-white transition hover:bg-slate-950 focus:outline-none focus-visible:ring-3 focus-visible:ring-slate-800/25'
            type='submit'>
            Prijava
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-600'>
          Še nimate računa?{" "}
          <Link
            className='font-semibold text-slate-900 underline-offset-4 hover:underline'
            to='/register'>
            Registracija
          </Link>
        </p>
      </section>
    </main>
  );
}
