import EditNotification from "../../../components/notifications/EditNotification";
import Admin from "@/components/auth/Admin";
import AdminLayout from "../../../components/layout/AdminLayout";
import Header from "@/components/Header";

export default function SendNotificationPage() {
  return (
    <Admin>
      <AdminLayout>
        <Header />
        <EditNotification />
      </AdminLayout>
    </Admin>
  );
}
