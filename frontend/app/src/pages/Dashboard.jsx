import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/userContext";

const FALLBACK_POSTER = "/placeholder.png";

export default function Dashboard({ videos = [], videosLoading = false }) {
  const { user } = useContext(UserContext);

  const featured = videos?.[0];

  return (
    <div className="nf">
      <header className="nfTopBar">
        <div className="nfBrand">StreamBox</div>
        <div className="nfUser">
          {user?.name ? <span>Hi, {user.name}</span> : null}
        </div>
      </header>

      {/* HERO */}
      <section className="nfHero">
        <div className="nfHeroBg" />
        <div className="nfHeroInner">
          <div className="nfHeroLeft">
            <div className="nfHeroLabel">FEATURED</div>
            <h1 className="nfHeroTitle">{featured?.title || "Pick something to watch"}</h1>
            <p className="nfHeroDesc">
              Jump back in, or find something new to watch.
            </p>

            <div className="nfHeroActions">
              {featured ? (
                <Link className="nfBtn nfBtnPrimary" to={`/video/${featured._id}`}>
                  ▶ Play
                </Link>
              ) : (
                <button className="nfBtn nfBtnPrimary" disabled>
                  ▶ Play
                </button>
              )}
            </div>
          </div>

          {featured ? (
            <img
              className="nfHeroPoster"
              src={featured.thumbnail || FALLBACK_POSTER}
              alt={featured.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_POSTER;
              }}
            />
          ) : null}
        </div>
      </section>

      {/* ROW */}
      <main className="nfMain">
        <h2 className="nfRowTitle">Trending Now</h2>

        {videosLoading ? (
          <div className="nfCard">Loading videos…</div>
        ) : videos.length === 0 ? (
          <div className="nfCard">No videos available.</div>
        ) : (
          <div className="nfRow">
            {videos.map((v) => (
              <Link key={v._id} to={`/video/${v._id}`} className="nfTile">
                <div className="nfTileImgWrap">
                  <img
                    className="nfTileImg"
                    src={v.thumbnail || FALLBACK_POSTER}
                    alt={v.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <div className="nfTileOverlay">
                    <div className="nfTileTitle">{v.title}</div>
                    <div className="nfTilePlay">Play</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
