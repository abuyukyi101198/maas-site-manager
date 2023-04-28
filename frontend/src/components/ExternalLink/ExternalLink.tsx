/* eslint-disable no-restricted-imports */
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";

const ExternalLink = ({ children, ...props }: LinkProps) => (
  <Link {...props} rel="noreferrer noopener" target="_blank">
    {children}
  </Link>
);

export default ExternalLink;
