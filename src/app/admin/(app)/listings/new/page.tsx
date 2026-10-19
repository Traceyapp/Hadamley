import { areas, topics } from "@/lib/repo";
import { AdminHeader } from "@/components/admin/ui";
import { ListingForm } from "../ListingForm";

export const metadata = { title: "Add listing" };

export default function NewListing() {
  return (
    <>
      <AdminHeader title="Add a listing" back={{ href: "/admin/listings", label: "All listings" }} description="New listings stay hidden until you mark them Approved for publication." />
      <ListingForm topics={topics()} areas={areas()} />
    </>
  );
}
