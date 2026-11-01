import { useNavigate } from "react-router";
import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div>
        <EmptyState
          icon={Compass}
          title="Page not found"
          hint="The page you're looking for doesn't exist or moved."
        />
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => navigate("/", { replace: true })}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
