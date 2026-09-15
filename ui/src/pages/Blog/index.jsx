import React, { useState } from "react";
import { Modal } from "antd";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import fakeArticles from "./fakeArticles";
import "./styles.css";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function Blog() {
  const [selected, setSelected] = useState(null);

  const latest = [...fakeArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
  const newest = latest.slice(0, 3);
  const mostPopular = [...fakeArticles].sort((a, b) => b.views - a.views).slice(0, 3);

  const sidebarList = (items) => (
    <ul className="blogSidebarList">
      {items.map((a) => (
        <li key={a.id} className="blogSidebarItem" onClick={() => setSelected(a)}>
          <div className="blogSidebarItemTitle">{a.title}</div>
          <div className="blogSidebarItemMeta">
            {formatDate(a.date)} &middot; {a.author}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <CoverBanner title="Blog" />
      <div className="blogPage">
        <div className="blogContainer">
          <div className="blogNotice">
            <h3>Under construction</h3>
            <p style={{ margin: 0 }}>
              This page is currently under construction and will be available soon. The
              articles shown below are fake blog articles used as placeholders.
            </p>
          </div>

          <div className="blogLayout">
            <div className="blogMain">
              <h3 className="blogSectionTitle">Latest Articles</h3>
              {latest.map((a) => (
                <div key={a.id} className="blogCard" onClick={() => setSelected(a)}>
                  <img src={a.image} alt="" className="blogCardImage" />
                  <div className="blogCardBody">
                    <div className="blogCardTitle">{a.title}</div>
                    <div className="blogMeta">
                      {formatDate(a.date)} &middot; {a.author}
                    </div>
                    <p className="blogCardSummary">{a.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="blogSidebar">
              <div className="blogSidebarBox">
                <h4>New</h4>
                {sidebarList(newest)}
              </div>
              <div className="blogSidebarBox">
                <h4>Most Popular</h4>
                {sidebarList(mostPopular)}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Modal
        visible={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selected && (
          <div>
            <h2 className="blogPreviewTitle">{selected.title}</h2>
            <div className="blogMeta">
              {formatDate(selected.date)} &middot; By {selected.author}
            </div>
            <img src={selected.image} alt="" className="blogPreviewImage" />
            <div className="blogPreviewContent">
              {selected.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Blog;
