import LoadingSpinner from "@/components/ui/loading-spinner";
import DocumentView from "@/components/view/document-view";
import { useLink } from "@/lib/swr/use-link";
import NotFound from "@/pages/404";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ViewPage() {
  const { link, error } = useLink();
  const { data: session, status } = useSession();
  const [isArchived, setIsArchived] = useState(false);

  const checkIfArchived = async () => {
    const response = await fetch(`/api/links/${link?.id}/archive`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.isArchived) {
        setIsArchived(true);
      }
    }
  };

  checkIfArchived();
  if (isArchived) {
    return <NotFound />;
  }

  if (error && error.status === 404) {
    return <NotFound />;
  }

  if (!link || status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner className="h-20 w-20" />
      </div>
    );
  }

  const { expiresAt, emailProtected, password: linkPassword } = link;

  const { email: userEmail } = session?.user || {};

  // If the link is expired, show a 404 page
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return <NotFound />;
  }

  if (emailProtected || linkPassword) {
    return (
      <DocumentView link={link} userEmail={userEmail} isProtected={true} />
    );
  }

  return <DocumentView link={link} userEmail={userEmail} isProtected={false} />;
}
