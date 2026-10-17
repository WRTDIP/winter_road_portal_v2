/* The portal's navigation, grouped so the header stays readable on laptop
   widths. Shared by the header and the footer. */
export const NAV_GROUPS = [
  { name: "Home", link: "/" },
  { name: "Map", link: "/map" },
  {
    name: "Projects",
    items: [
      { name: "Projects", link: "/projects", hint: "Winter Road Watch and field studies" },
      { name: "Observation", link: "/observation", hint: "Citizen-science road observations" },
      { name: "Transportation", link: "/transportation", hint: "Northern transportation network study" },
    ],
  },
  {
    name: "Data",
    items: [
      { name: "Download", link: "/download", hint: "Export daily climate records as CSV" },
      { name: "API", link: "/api", hint: "Programmatic access to portal data" },
    ],
  },
  {
    name: "Resources",
    items: [
      { name: "References", link: "/references", hint: "StoryMap collection and publications" },
      { name: "Blog", link: "/blog", hint: "News and updates from the team" },
    ],
  },
  { name: "About", link: "/about" },
];
