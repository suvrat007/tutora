import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = ({ children, className, ...props }) => {
  return (
      <AccordionPrimitive.Root
          type="single"
          collapsible
          className={cn("space-y-2 bg-background rounded-xl shadow-soft border border-border", className)}
          {...props}
      >
        {children}
      </AccordionPrimitive.Root>
  );
};

const AccordionItem = ({ className, value, ...props }) => {
  return (
      <AccordionPrimitive.Item
          value={value}
          className={cn("border-b border-border last:border-b-0", className)}
          {...props}
      />
  );
};

const AccordionTrigger = ({ className, children, ...props }) => {
  return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            className={cn(
                "focus-visible:ring-primary/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 px-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 text-text hover:text-primary",
                className
            )}
            {...props}
        >
          {children}
          <ChevronDownIcon className="text-text-light pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
  );
};

const AccordionContent = ({ className, children, ...props }) => {
  return (
      <AccordionPrimitive.Content
          className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
          {...props}
      >
        <div className={cn("pt-0 pb-4 px-4 text-text-light", className)}>{children}</div>
      </AccordionPrimitive.Content>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
