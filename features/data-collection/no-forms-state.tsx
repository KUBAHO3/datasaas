"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Plus, Sparkles } from "lucide-react";
import { AutoImportDialog } from "./auto-import-dialog";
import Link from "next/link";

interface NoFormsStateProps {
  orgId: string;
}

export function NoFormsState({ orgId }: NoFormsStateProps) {
  const [showAutoImport, setShowAutoImport] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold">No forms yet</h2>
            <p className="text-muted-foreground mt-2">
              Create your first form to start collecting data
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Auto-Import Option */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">
                      Auto-Create from Excel/CSV
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your existing data file and we'll automatically create a
                      form and import your data
                    </p>
                    <Button
                      onClick={() => setShowAutoImport(true)}
                      className="mt-4"
                      size="sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Import & Auto-Create
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Manual Create Option */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="rounded-full bg-muted p-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">Create Form Manually</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Build your form from scratch with our drag-and-drop builder
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-4"
                      size="sm"
                    >
                      <Link href={`/org/${orgId}/forms/create`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Form
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auto Import Dialog */}
      <AutoImportDialog
        open={showAutoImport}
        onOpenChange={setShowAutoImport}
        companyId={orgId}
      />
    </>
  );
}
