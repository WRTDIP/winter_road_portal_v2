import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import content from "./content.json";
import { referencesDescription, referencesTitle, renderReferences } from "./render-content.mjs";
import "./styles.css";

const articleHtml = renderReferences(content);

function References() {
  const container = useRef(null);

  useEffect(() => {
    const figure = container.current.querySelector("[data-map-id]");
    if (!figure) return;
    const button = figure.querySelector("button");
    const canvas = figure.querySelector(".references-map__canvas");
    const status = figure.querySelector('[role="status"]');
    let disposed = false;
    let view;

    const openMap = async () => {
      button.disabled = true;
      status.hidden = false;
      status.textContent = "Loading map...";
      canvas.hidden = false;
      try {
        const [WebMap, MapView, Legend, Expand, LayerList] = await loadModules([
          "esri/WebMap", "esri/views/MapView", "esri/widgets/Legend",
          "esri/widgets/Expand", "esri/widgets/LayerList",
        ], { css: true });
        if (disposed) return;
        const mapData = content.stories[0].nodes;
        const mapNode = Object.values(mapData).find((node) => node.type === "webmap");
        const map = new WebMap({ portalItem: { id: figure.dataset.mapId } });
        view = new MapView({
          container: canvas,
          map,
          extent: mapNode.data.extent,
          constraints: { snapToZoom: false },
          navigation: { mouseWheelZoomEnabled: false, browserTouchPanEnabled: true },
        });
        await view.when();
        if (disposed) return;
        view.ui.add(new Expand({ view, content: new Legend({ view }), group: "references" }), "top-right");
        view.ui.add(new Expand({ view, content: new LayerList({ view }), group: "references" }), "top-right");
        button.hidden = true;
        status.hidden = true;
      } catch {
        if (disposed) return;
        view?.destroy();
        view = null;
        canvas.hidden = true;
        button.disabled = false;
        status.textContent = "The map could not be loaded. Try again or open the full map on ArcGIS.";
      }
    };

    button.addEventListener("click", openMap);
    return () => {
      disposed = true;
      button.removeEventListener("click", openMap);
      view?.destroy();
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = referencesTitle;
    if (description) description.content = referencesDescription;
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
    return () => {
      document.title = previousTitle;
      if (description) description.content = previousDescription;
    };
  }, []);

  return <div ref={container} dangerouslySetInnerHTML={{ __html: articleHtml }} />;
}

export default References;
