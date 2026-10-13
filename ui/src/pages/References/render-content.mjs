import sanitizeHtml from "sanitize-html";

export const referencesTitle = "Northern Transportation Network Study | WRTDIP References";
export const referencesDescription = "Research on remoteness, seasonal transportation accessibility, and road accident severity in Canada's Northwest Territories.";

const escape = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

const richText = (value = "") => sanitizeHtml(value, {
  allowedTags: ["a", "strong", "b", "em", "i", "sup", "sub", "br", "li"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["https", "http", "mailto"],
  allowProtocolRelative: false,
}).replace(/\n/g, "<br>");

const textOnly = (value = "") => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
const coverOf = (document) => Object.values(document.nodes).find((node) => node.type.endsWith("cover")).data;
const articleId = (story) => `study-${story.id}`;
const sectionId = (story, nodeId) => `${articleId(story)}-${nodeId}`;

function renderTable(data, id) {
  const rows = Array.from({ length: data.numRows }, (_, rowIndex) => {
    const cells = Array.from({ length: data.numColumns }, (_, columnIndex) => {
      const isColumnHeader = rowIndex === 0 && data.shouldShowHeaderRow;
      const isRowHeader = columnIndex === 0 && data.shouldShowHeaderColumn;
      const tag = isColumnHeader || isRowHeader ? "th" : "td";
      const scope = isColumnHeader ? ' scope="col"' : isRowHeader ? ' scope="row"' : "";
      return `<${tag}${scope}>${richText(data.cells[rowIndex]?.[columnIndex]?.value)}</${tag}>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  });
  return `<figure class="references-table">
    <div class="u-scroll-x" role="region" tabindex="0" aria-labelledby="${id}-caption">
      <table>${data.shouldShowHeaderRow ? `<thead>${rows.shift()}</thead>` : ""}<tbody>${rows.join("")}</tbody></table>
    </div>
    <figcaption id="${id}-caption">${richText(data.caption)}</figcaption>
  </figure>`;
}

function renderNode(story, nodeId) {
  const node = story.nodes[nodeId];
  const data = node.data || {};
  const id = sectionId(story, nodeId);
  if (node.config?.isHidden) return "";
  switch (node.type) {
    case "text": {
      if (!data.text?.trim()) return "";
      if (data.type === "paragraph") {
        return `<p${data.textSize === "small" ? ' class="references-publication"' : ""}>${richText(data.text)}</p>`;
      }
      if (data.type === "bullet-list") return `<ul>${richText(data.text)}</ul>`;
      const heading = { h2: "h3", h3: "h4", h4: "h5" }[data.type];
      if (!heading) throw new Error(`Unsupported text type: ${data.type}`);
      return `<${heading} id="${id}" tabindex="-1">${richText(data.text)}</${heading}>`;
    }
    case "table": return renderTable(data, id);
    case "image": {
      const image = story.resources[data.image].data;
      return `<figure class="references-figure">
        <a href="${escape(image.localUrl)}" aria-label="${escape(`Open full-size figure: ${textOnly(data.caption)}`)}">
          <img src="${escape(image.localUrl)}" width="${image.width}" height="${image.height}" loading="lazy" alt="${escape(textOnly(data.alt || data.caption))}">
        </a><figcaption>${richText(data.caption)}</figcaption>
      </figure>`;
    }
    case "webmap": {
      const map = story.resources[data.map].data;
      return `<figure class="references-figure references-map" data-map-id="${escape(map.itemId)}">
        <div class="references-map__canvas" aria-label="${escape(data.caption)}" hidden></div>
        <button type="button" class="references-map__load">Explore map</button>
        <p class="references-map__status" role="status" hidden></p>
        <figcaption>${richText(data.caption)}<br><a href="https://www.arcgis.com/apps/mapviewer/index.html?webmap=${escape(map.itemId)}">Open full map on ArcGIS</a></figcaption>
      </figure>`;
    }
    case "credits": return (node.children || []).map((child) => renderNode(story, child)).join("");
    case "attribution": return data.content || data.attribution
      ? `<p class="references-credit">${richText(data.content)} ${richText(data.attribution)}</p>` : "";
    case "storycover":
    case "navigation": return "";
    default: throw new Error(`Unsupported story node: ${node.type}`);
  }
}

function renderArticle(story, index) {
  const cover = coverOf(story);
  const navigation = Object.values(story.nodes).find((node) => node.type === "navigation");
  return `<article class="references-article" id="${articleId(story)}" aria-labelledby="${articleId(story)}-title">
    <header class="references-article__header">
      <a class="references-back" href="#research-collection">Back to collection</a>
      <p class="references-eyebrow">Study ${String(index + 1).padStart(2, "0")}</p>
      <h2 id="${articleId(story)}-title" tabindex="-1">${escape(cover.title)}</h2>
      <p class="references-deck">${escape(cover.summary)}</p>
      <p class="references-keywords">${escape(cover.byline)}</p>
    </header>
    <div class="references-article__layout">
      <nav class="references-sections" aria-label="Sections in ${escape(cover.title)}">
        ${(navigation?.data.links || []).map(({ nodeId }) => `<a href="#${sectionId(story, nodeId)}">${richText(story.nodes[nodeId].data.text)}</a>`).join("")}
      </nav>
      <div class="references-prose">
        ${story.nodes[story.root].children.map((nodeId) => renderNode(story, nodeId)).join("\n")}
        <footer class="references-article__footer"><a href="https://storymaps.arcgis.com/stories/${story.id}">Original StoryMap</a><a href="#research-collection">Back to collection</a></footer>
      </div>
    </div>
  </article>`;
}

export function renderReferences({ collection, stories }) {
  const cover = coverOf(collection);
  const items = Object.values(collection.nodes).find((node) => node.type === "collection-ui").data.items;
  return `<div class="references-page">
    <section class="references-collection" id="research-collection" aria-labelledby="research-title">
      <header class="references-collection__header">
        <p class="references-eyebrow">References / Collection</p>
        <h1 id="research-title">${escape(cover.title)}</h1>
        <p class="references-deck">${escape(cover.summary)}</p>
      </header>
      <nav aria-label="Research articles"><ol class="references-studies">
        ${items.map((item, index) => {
          const storyId = collection.resources[item.resourceId].data.itemId;
          const story = stories.find((entry) => entry.id === storyId);
          if (!story) throw new Error(`Missing article: ${storyId}`);
          const image = collection.resources[item.customThumbnail].data;
          return `<li><a class="references-study" href="#${articleId(story)}">
            <img src="${escape(image.localUrl)}" width="${image.width}" height="${image.height}" alt="" ${index ? 'loading="lazy"' : 'fetchpriority="high"'}>
            <div><span class="references-eyebrow">Study ${String(index + 1).padStart(2, "0")}</span>
              <h2>${escape(coverOf(story).title)}</h2><p>${escape(item.customSummary)}</p>
            </div>
          </a></li>`;
        }).join("")}
      </ol></nav>
    </section>
    ${stories.map(renderArticle).join("\n")}
  </div>`;
}