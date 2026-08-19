export interface HeaderLink {
  href: string;
  text: string;
  customClasses: string;
}

export const HEADER_LINKS: HeaderLink[] = [
  {
    href: "/ensayos",
    text: "/ensayos",
    customClasses: "hover:text-cz-neon-blue text-cz-neon-blue",
  },
  {
    href: "/biblioteca",
    text: "/biblioteca",
    customClasses: "hover:text-cz-neon-lime text-cz-neon-lime",
  },
  {
    href: "/behavior",
    text: "/behavior",
    customClasses: "hover:text-cz-neon-pink text-cz-neon-pink",
  },
];
