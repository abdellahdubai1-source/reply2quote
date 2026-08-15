import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

interface ButtonLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** A Next.js Link styled identically to <Button>. Use this instead of
 *  nesting a <button> inside a Link (invalid HTML) whenever a CTA
 *  needs to navigate rather than trigger an action. */
export function ButtonLink({ variant, size, fullWidth, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
