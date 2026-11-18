import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./styles.css";

/* The three ways into the portal: the map, the data, and the research behind
   them. Each column says what is there and links straight to it. */
const ENTRIES = [
  {
    label: "Interactive map",
    title: "Explore winter roads and community climate",
    text:
      "Where can you find the winter roads? How is climate change affecting these winter roads? Our interactive map provides an opportunity to explore Northern transportation networks, climate change impacts, and socio-economic information.",
    items: [
      "Freezing degree days for each community",
      "Precipitation, snowfall and temperature trends",
      "Winter road opening and closing trends",
    ],
    link: { to: "/map", label: "Open the map" },
  },
  {
    label: "Climate data",
    title: "Download daily station records",
    text:
      "Export a month of daily climate observations as a CSV file, from weather stations in Yukon, the Northwest Territories and Nunavut.",
    items: [
      "Temperature, precipitation and snowfall",
      "Homogenized datasets where available",
      "Preview rows before you download",
    ],
    link: { to: "/download", label: "Download data" },
  },
  {
    label: "Research",
    title: "Studies and field observations",
    text:
      "We present studies and data related to Northern transportation, and invite citizen scientists in the North to report winter road conditions.",
    items: [
      { to: "/transportation", label: "Northern Transportation Network Study" },
      { to: "/observation", label: "Winter Road Watch observations" },
      { to: "/projects", label: "Winter Road Profile and other projects" },
    ],
    link: { to: "/projects", label: "All projects" },
  },
];

const Explore = () => (
  <section className="ui-section" aria-labelledby="explore-title">
    <div className="ui-container">
      <div className="ui-section-head">
        <span className="ui-eyebrow">Explore the portal</span>
        <h2 id="explore-title">Maps, data and research on northern winter roads</h2>
      </div>
      <div className="exploreGrid">
        {ENTRIES.map((entry) => (
          <article key={entry.label} className="exploreItem">
            <span className="exploreItem__label">{entry.label}</span>
            <h3 className="exploreItem__title">{entry.title}</h3>
            <p className="exploreItem__text">{entry.text}</p>
            <ul className="exploreItem__list">
              {entry.items.map((item) =>
                typeof item === "string" ? (
                  <li key={item}>{item}</li>
                ) : (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                )
              )}
            </ul>
            <Link to={entry.link.to} className="ui-link exploreItem__link">
              {entry.link.label}
              <ArrowRightOutlined aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Explore;
