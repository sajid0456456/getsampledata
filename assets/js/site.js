// SampleFiles Hub — progressive-enhancement only.
// This file NEVER renders page content (that's baked directly into the
// HTML by build.py, so crawlers and no-JS visitors see everything). It
// only adds a small UX nicety on top of already-complete markup.

document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  // "More" nav overflow menu — opens on hover via CSS alone (works with no
  // JS at all); this just adds click/tap support and closes it when you
  // click elsewhere, since hover isn't available on touch devices.
  var moreItem = document.querySelector(".nav-more");
  var moreToggle = document.querySelector(".nav-more-toggle");

  if (moreItem && moreToggle) {
    moreToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = moreItem.classList.toggle("open");
      moreToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!moreItem.contains(e.target)) {
        moreItem.classList.remove("open");
        moreToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        moreItem.classList.remove("open");
        moreToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  initSearch();
  initBundleDownloads();
});

// ---------------------------------------------------------------- bundle downloads
//
// A handful of formats (glTF, Shapefile, VMDK, ...) need more than the one
// file a "sample" row tracks to actually work once downloaded — a .gltf
// needs its .bin buffers, a .shp needs its .dbf/.shx, a .vmdk needs its
// -flat.vmdk. build.py detects these companion files purely by filename
// convention (see is_companion_filename() in builder.py) and marks that
// row's Download link with data-bundle-files — nothing else about the row
// changes: same URL, same FORMAT/SIZE columns, same button text. Only a
// click on THAT specific button behaves differently.
//
// There's no server running on GitHub Pages to zip anything ahead of time,
// so this happens entirely in the visitor's browser, at the moment of the
// click: fetch the primary file plus every companion (all just ordinary
// static files, so this works fine on GitHub Pages), zip them together
// with JSZip (loaded from a CDN only the first time a bundle download is
// actually clicked — most pages never need it), and hand the browser the
// resulting .zip to save. A sample with no companions is never touched by
// any of this; its Download link works exactly as a plain link always has,
// with or without JavaScript.

var JSZIP_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
var jsZipLoadPromise = null;

function loadJsZip() {
  if (window.JSZip) {
    return Promise.resolve();
  }
  if (jsZipLoadPromise) {
    return jsZipLoadPromise;
  }
  jsZipLoadPromise = new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = JSZIP_CDN_URL;
    script.onload = function () { resolve(); };
    script.onerror = function () {
      jsZipLoadPromise = null; // let a later click try again (e.g. after a flaky connection)
      reject(new Error("Couldn't load the zip library — check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return jsZipLoadPromise;
}

// Companion filenames are relative to the primary file's own folder — the
// primary file's real href already tells us that folder, so nothing about
// the link's URL has to change for this to work.
function bundlePlan(link) {
  var primaryUrl = link.getAttribute("href");
  var dir = primaryUrl.slice(0, primaryUrl.lastIndexOf("/") + 1);
  var primaryName = primaryUrl.slice(primaryUrl.lastIndexOf("/") + 1);
  var companions = (link.getAttribute("data-bundle-files") || "")
    .split(",")
    .map(function (f) { return f.trim(); })
    .filter(Boolean);

  return {
    zipName: primaryName.replace(/\.[^.]+$/, "") + "-bundle.zip",
    files: [{ name: primaryName, url: primaryUrl }].concat(
      companions.map(function (name) { return { name: name, url: dir + name }; })
    ),
  };
}

function triggerBlobDownload(blob, filename) {
  var blobUrl = URL.createObjectURL(blob);
  var tempLink = document.createElement("a");
  tempLink.href = blobUrl;
  tempLink.download = filename;
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 4000);
}

function handleBundleDownloadClick(e) {
  var link = e.currentTarget;
  if (link.classList.contains("is-zipping")) {
    e.preventDefault();
    return; // already in progress -- ignore repeat clicks
  }
  e.preventDefault();

  var originalText = link.textContent;
  link.classList.add("is-zipping");
  link.setAttribute("aria-busy", "true");
  link.textContent = "Zipping…";

  var plan = bundlePlan(link);

  loadJsZip()
    .then(function () {
      return Promise.all(
        plan.files.map(function (f) {
          return fetch(f.url).then(function (res) {
            if (!res.ok) {
              throw new Error("Couldn't fetch " + f.name + " (" + res.status + ")");
            }
            return res.blob();
          }).then(function (blob) {
            return { name: f.name, blob: blob };
          });
        })
      );
    })
    .then(function (fetched) {
      var zip = new window.JSZip();
      fetched.forEach(function (f) {
        zip.file(f.name, f.blob);
      });
      return zip.generateAsync({ type: "blob" });
    })
    .then(function (zipBlob) {
      triggerBlobDownload(zipBlob, plan.zipName);
    })
    .catch(function (err) {
      // Still gets them the main file even if the bundling failed for some
      // reason (e.g. offline, CDN blocked) -- a dead end is worse than an
      // incomplete-but-useful download.
      console.error("Bundle download failed, falling back to the primary file alone:", err);
      window.location.href = link.getAttribute("href");
    })
    .finally(function () {
      link.classList.remove("is-zipping");
      link.removeAttribute("aria-busy");
      link.textContent = originalText;
    });
}

function initBundleDownloads() {
  if (!window.fetch || !window.Promise || !window.URL || !URL.createObjectURL) {
    return; // no-JS-equivalent fallback: links just behave as plain single-file downloads
  }
  var links = document.querySelectorAll("a.bundle-download[data-bundle-files]");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", handleBundleDownloadClick);
  }
}

// ---------------------------------------------------------------- search
//
// window.SEARCH_INDEX (written by builder.py into search-index.js, loaded
// just before this file) is a flat list of every category + format page:
//   { title, sub, url, kw }
// kw is a lowercased blob of the title/format code/category/broad type
// words (e.g. "image", "audio") and description — so typing "image" finds
// jpg/png/webp/gif even though none of those titles contain that word.
//
// This is the one deliberate exception to "everything is in the raw HTML":
// there's no server on GitHub Pages to run a real search on, so matching
// happens entirely client-side. The dedicated results page is marked
// noindex for that reason (see builder.py's build_search_page).

function siteUrl(path) {
  // window.SEARCH_INDEX entries carry root-absolute URLs ("/media-jpg/") —
  // correct for the real deployed site (see builder.py's module docstring).
  // The Manager's local preview mounts the whole site under a "/preview/"
  // prefix instead; the server-rendered HTML already gets that prefix
  // glued back onto its own links (see app.py's preview route), but any
  // link built here in JS from a raw index URL needs the same treatment
  // to stay inside the preview instead of escaping it.
  var prefix = window.location.pathname.indexOf("/preview/") === 0 ? "/preview" : "";
  return prefix + path;
}

function searchEscapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

function searchMatches(query) {
  var index = window.SEARCH_INDEX || [];
  var q = String(query || "").trim().toLowerCase();
  if (!q) {
    return [];
  }

  var scored = [];
  for (var i = 0; i < index.length; i++) {
    var entry = index[i];
    var title = (entry.title || "").toLowerCase();
    var kw = entry.kw || "";
    var score = 0;

    if (title.indexOf(q) === 0) {
      score = 4; // title starts with the query — strongest match ("jp" -> "JPG...")
    } else if (title.indexOf(q) !== -1) {
      score = 3; // query appears somewhere in the title
    } else if ((" " + kw).indexOf(" " + q) !== -1) {
      score = 2; // query matches a whole keyword ("image", "audio", "pdf"...)
    } else if (kw.indexOf(q) !== -1) {
      score = 1; // query is a substring of the keyword blob
    }

    if (score > 0) {
      scored.push({ entry: entry, score: score });
    }
  }

  scored.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.title.localeCompare(b.entry.title);
  });

  return scored.map(function (s) {
    return s.entry;
  });
}

function initSearch() {
  initSearchSuggestions();
  initSearchResultsPage();
}

function initSearchSuggestions() {
  var form = document.querySelector(".search-form");
  var input = document.getElementById("site-search-input");
  var list = document.getElementById("search-suggestions");
  if (!form || !input || !list) {
    return;
  }

  var activeIndex = -1;

  function closeSuggestions() {
    list.hidden = true;
    list.innerHTML = "";
    activeIndex = -1;
  }

  function renderSuggestions(matches) {
    if (!matches.length) {
      list.innerHTML = '<li class="search-suggestion-empty">No matching pages yet — try a format like "jpg" or "pdf".</li>';
      list.hidden = false;
      activeIndex = -1;
      return;
    }

    var top = matches.slice(0, 8);
    list.innerHTML = top
      .map(function (entry) {
        return (
          '<li class="search-suggestion"><a href="' + searchEscapeHtml(siteUrl(entry.url)) + '">' +
          '<span class="search-suggestion-title">' + searchEscapeHtml(entry.title) + "</span>" +
          '<span class="search-suggestion-sub">' + searchEscapeHtml(entry.sub) + "</span>" +
          "</a></li>"
        );
      })
      .join("");
    list.hidden = false;
    activeIndex = -1;
  }

  input.addEventListener("input", function () {
    var q = input.value.trim();
    if (!q) {
      closeSuggestions();
      return;
    }
    renderSuggestions(searchMatches(q));
  });

  input.addEventListener("keydown", function (e) {
    var items = list.querySelectorAll("a");
    if (!items.length || list.hidden) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
    } else if (e.key === "Escape") {
      closeSuggestions();
      return;
    } else {
      return;
    }

    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === activeIndex);
    });

    if (activeIndex >= 0) {
      items[activeIndex].scrollIntoView({ block: "nearest" });
    }
  });

  form.addEventListener("submit", function (e) {
    var activeLink = list.querySelector("a.is-active");
    if (activeLink) {
      // A suggestion is keyboard-highlighted — go straight there.
      e.preventDefault();
      window.location.href = activeLink.getAttribute("href");
      return;
    }

    // No suggestion picked — if the query unambiguously points to exactly
    // one page, jump straight there. Otherwise (nothing found, or several
    // pages match) fall through to the normal form submission, which loads
    // the dedicated search results page listing every match.
    var matches = searchMatches(input.value);
    if (matches.length === 1) {
      e.preventDefault();
      window.location.href = siteUrl(matches[0].url);
    }
  });

  document.addEventListener("click", function (e) {
    if (!form.contains(e.target)) {
      closeSuggestions();
    }
  });
}

function initSearchResultsPage() {
  var container = document.getElementById("search-results");
  var summary = document.getElementById("search-page-summary");
  if (!container || !summary) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var q = (params.get("q") || "").trim();

  var input = document.getElementById("site-search-input");
  if (input && q) {
    input.value = q;
  }

  if (!q) {
    summary.textContent = "Type a search term above to find sample files.";
    return;
  }

  var matches = searchMatches(q);

  if (!matches.length) {
    summary.textContent = 'No results for "' + q + '". Try a format name like "jpg", "pdf", or "zip".';
    return;
  }

  summary.textContent =
    matches.length === 1
      ? '1 result for "' + q + '"'
      : matches.length + ' results for "' + q + '"';

  container.innerHTML = matches
    .map(function (entry, i) {
      return (
        '<a class="search-result-card' + (i === 0 ? " is-best" : "") + '" href="' + searchEscapeHtml(siteUrl(entry.url)) + '">' +
        (i === 0 ? '<span class="search-result-badge">Best match</span>' : "") +
        '<span class="search-result-title">' + searchEscapeHtml(entry.title) + "</span>" +
        '<span class="search-result-sub">' + searchEscapeHtml(entry.sub) + "</span>" +
        "</a>"
      );
    })
    .join("");
}
