'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OrgError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Organization page error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Error Loading Organization</CardTitle>
          </div>
          <CardDescription>
            We encountered an error while loading your organization data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} variant="default" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
