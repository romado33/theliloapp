import { useCallback, useState } from "react";
import { Database, Loader2, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SeedStatus = "idle" | "running" | "success" | "error";

const DEV_SEED_ENDPOINT = "/api/dev/seed";

const DevDataSeederInner = () => {
  const [status, setStatus] = useState<SeedStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = useCallback(async () => {
    setStatus("running");
    setMessage(null);

    try {
      const response = await fetch(DEV_SEED_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to seed developer data");
      }

      const payload = await response.json().catch(() => null);
      const successMessage =
        (typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : null) ?? "Developer data seeded successfully.";

      setMessage(successMessage);
      setStatus("success");
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : "Unknown error while seeding data";
      setMessage(fallbackMessage);
      setStatus("error");
    }
  }, []);

  const isRunning = status === "running";

  return (
    <Card className="border-dashed border-primary/40 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" /> Developer data seeder
          </CardTitle>
          <CardDescription>Quickly populate Supabase with demo experiences and hosts.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleSeed} disabled={isRunning}>
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This action inserts curated sample data that mirrors the Ottawa area experiences showcased in the marketing
          screens.
        </p>

        {status === "idle" && (
          <Alert>
            <AlertTitle>Ready to seed</AlertTitle>
            <AlertDescription>
              Click the button above to populate the development database. The operation is idempotent—existing sample
              rows will be updated when possible.
            </AlertDescription>
          </Alert>
        )}

        {status === "running" && (
          <Alert>
            <AlertTitle>Seeding in progress</AlertTitle>
            <AlertDescription>Hold tight while we populate the development data.</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-500/60 bg-green-500/10">
            <AlertTitle>All set!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Seeding failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export const DevDataSeeder = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  return <DevDataSeederInner />;
};

export default DevDataSeeder;
