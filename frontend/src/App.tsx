import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/context/AuthContext";

import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import Organizations from "@/pages/organization/Organizations";
import CreateOrganization from "@/pages/organization/CreateOrganization";
import OrganizationDetails from "@/pages/organization/OrganizationDetails";
import EditOrganization from "@/pages/organization/EditOrganization";
import Invitations from "@/pages/invitation/Invitations";
import AcceptInvitation from "@/pages/invitation/AcceptInvitation";
import RejectInvitation from "@/pages/invitation/RejectInvitation";
import Profile from "@/pages/profile/Profile";
import NotFound from "@/pages/misc/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route
              path="/organizations/create"
              element={<CreateOrganization />}
            />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route
              path="/organizations/:id/edit"
              element={<EditOrganization />}
            />
            <Route path="/invitations" element={<Invitations />} />
            <Route
              path="/accept-invitation/:token"
              element={<AcceptInvitation />}
            />
            <Route
              path="/reject-invitation/:token"
              element={<RejectInvitation />}
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  );
}

export default App;
