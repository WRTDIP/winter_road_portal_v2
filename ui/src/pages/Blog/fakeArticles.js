import img1 from "../../assets/homebg_1.png";
import img2 from "../../assets/homebg_2.png";
import img3 from "../../assets/homebg_3.png";
import img4 from "../../assets/homebg_4.png";
import img5 from "../../assets/northern_lights.png";
import img6 from "../../assets/transportation.png";

const LOREM_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const LOREM_2 =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const LOREM_3 =
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.";

// Placeholder content only. Every entry is a fake blog article.
const fakeArticles = [
  {
    id: 1,
    title: "Fake Blog Article #1 - Lorem Ipsum Dolor",
    author: "Fake Author One",
    date: "2026-08-28",
    views: 320,
    image: img1,
    summary: "Fake blog article summary. " + LOREM_1.slice(0, 120) + "...",
    content: [LOREM_1, LOREM_2, LOREM_3],
  },
  {
    id: 2,
    title: "Fake Blog Article #2 - Sit Amet Consectetur",
    author: "Fake Author Two",
    date: "2026-08-15",
    views: 1240,
    image: img2,
    summary: "Fake blog article summary. " + LOREM_2.slice(0, 120) + "...",
    content: [LOREM_2, LOREM_3, LOREM_1],
  },
  {
    id: 3,
    title: "Fake Blog Article #3 - Adipiscing Elit",
    author: "Fake Author Three",
    date: "2026-07-30",
    views: 875,
    image: img3,
    summary: "Fake blog article summary. " + LOREM_3.slice(0, 120) + "...",
    content: [LOREM_3, LOREM_1, LOREM_2],
  },
  {
    id: 4,
    title: "Fake Blog Article #4 - Tempor Incididunt",
    author: "Fake Author Four",
    date: "2026-07-12",
    views: 2010,
    image: img4,
    summary: "Fake blog article summary. " + LOREM_1.slice(0, 120) + "...",
    content: [LOREM_1, LOREM_3, LOREM_2],
  },
  {
    id: 5,
    title: "Fake Blog Article #5 - Labore et Dolore",
    author: "Fake Author Five",
    date: "2026-06-21",
    views: 560,
    image: img5,
    summary: "Fake blog article summary. " + LOREM_2.slice(0, 120) + "...",
    content: [LOREM_2, LOREM_1, LOREM_3],
  },
  {
    id: 6,
    title: "Fake Blog Article #6 - Magna Aliqua",
    author: "Fake Author Six",
    date: "2026-05-03",
    views: 1530,
    image: img6,
    summary: "Fake blog article summary. " + LOREM_3.slice(0, 120) + "...",
    content: [LOREM_3, LOREM_2, LOREM_1],
  },
];

export default fakeArticles;
