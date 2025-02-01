import SendNotificationForm from "../../../components/notifications/SendNotificationForm";
import Admin from "@/components/auth/Admin";
import AdminLayout from "../../../components/layout/AdminLayout";
import Header from "@/components/Header";

export default function SendNotificationPage() {
  return (
    <Admin>
      <AdminLayout>
        <Header />
        <SendNotificationForm />
      </AdminLayout>
    </Admin>
  );
}
