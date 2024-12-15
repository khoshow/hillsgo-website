import PushNotificationsList from "../../../components/notifications/PushNotificationsList";
import Admin from "@/components/auth/Admin";
import AdminLayout from "../../../components/layout/AdminLayout";
import Header from "@/components/Header";

export default function SendNotificationPage() {
  return (
    <Admin>
      <AdminLayout>
        <Header />
        <PushNotificationsList />
      </AdminLayout>
    </Admin>
  );
}
