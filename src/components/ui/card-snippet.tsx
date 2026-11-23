import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

const CardSnippet = ({
  title,
  code,
  children,
}: {
  title?: React.ReactNode;
  code?: string;
  children?: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        {title && (
          <CardTitle className="flex-1 leading-normal">{title}</CardTitle>
        )}
        {code && (
          <div className="flex-none">
            <Switch
              aria-label="Toggle code snippet"
              checked={show}
              onCheckedChange={setShow}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
        <Collapsible open={show}>
          <CollapsibleContent className="CollapsibleContent">
            <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-xs text-default-900">
              <code>{code ?? ""}</code>
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CardSnippet;
