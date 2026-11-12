import { Route, Routes } from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import Layout from "./components/Layout";
import Accounts from "./pages/Accounts";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Hours from "./pages/Hours";
import ProjectDetails from "./pages/ProjectDetails";
import Register from "./pages/Register";
import { Projects } from "./pages/Projects";

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route
        element={
          <AuthProvider>
            <Layout />
          </AuthProvider>
        }>
        <Route index element={<Dashboard />} />
        <Route path='racuni' element={<Accounts />} />
        <Route path='stranke' element={<Clients />} />
        <Route path='ure' element={<Hours />} />
        <Route path='projekti' element={<Projects />} />
        <Route path='projekti/:id/detajli' element={<ProjectDetails />} />
      </Route>
    </Routes>
  );
}
