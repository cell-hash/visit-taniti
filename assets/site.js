/* Visit Taniti prototype behavior: mobile menu, FAQ accordion, lodging and
   dining filters, and the booking and contact forms. No dependencies. */

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------ mobile menu --- */
  var toggle = $(".menu-toggle");
  var nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* --------------------------------------------------- FAQ accordion ---- */
  $$(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ------------------------------------------------------- filtering ---- */
  function applyFilters(items, test, countEl, emptyEl, noun) {
    var shown = 0;
    items.forEach(function (item) {
      var match = test(item);
      item.hidden = !match;
      if (match) { shown += 1; }
    });
    if (countEl) {
      countEl.textContent = "Showing " + shown + " of " + items.length + " " + noun;
    }
    if (emptyEl) { emptyEl.hidden = shown !== 0; }
  }

  var lodging = $$(".lodging");
  if (lodging.length) {
    var typeSel = $("#type-filter");
    var rateSel = $("#rate-filter");
    var run = function () {
      applyFilters(lodging, function (item) {
        var okType = typeSel.value === "all" || item.dataset.type === typeSel.value;
        var okRate = Number(item.dataset.rate) <= Number(rateSel.value);
        return okType && okRate;
      }, $("#lodging-count"), $("#lodging-empty"), "places to stay");
    };
    typeSel.addEventListener("change", run);
    rateSel.addEventListener("change", run);
    run();
  }

  var restaurants = $$(".restaurant");
  if (restaurants.length) {
    var cuisineSel = $("#cuisine-filter");
    var runDining = function () {
      applyFilters(restaurants, function (item) {
        return cuisineSel.value === "all" || item.dataset.cuisine === cuisineSel.value;
      }, $("#dining-count"), null, "restaurants");
    };
    cuisineSel.addEventListener("change", runDining);
    runDining();
  }

  /* -------------------------------------------------- form validation --- */
  function showError(field, message) {
    var msg = document.querySelector('[data-error-for="' + field.id + '"]');
    field.classList.add("is-flagged");
    field.setAttribute("aria-invalid", "true");
    if (msg) { msg.textContent = message; msg.hidden = false; }
  }

  function clearError(field) {
    var msg = document.querySelector('[data-error-for="' + field.id + '"]');
    field.classList.remove("is-flagged");
    field.removeAttribute("aria-invalid");
    if (msg) { msg.hidden = true; }
  }

  function validate(form) {
    var firstBad = null;
    $$("[required]", form).forEach(function (field) {
      clearError(field);
      var value = field.value.trim();
      if (!value) {
        showError(field, "This is required.");
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showError(field, "Enter an email address such as name@example.com.");
      } else {
        return;
      }
      if (!firstBad) { firstBad = field; }
    });
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  function reference() {
    return "TAN-" + Math.floor(100000 + Math.random() * 900000);
  }

  /* --------------------------------------------- booking: prefill ------- */
  var bookingForm = $("#booking-form");
  if (bookingForm) {
    var params = new URLSearchParams(window.location.search);
    var note = $("#prefill-note");
    var preselect = function (id, value) {
      var sel = document.getElementById(id);
      if (!sel || !value) { return null; }
      var hit = $$("option", sel).filter(function (o) { return o.value === value; })[0];
      if (!hit) { return null; }
      sel.value = value;
      return value;
    };
    var chosen = [
      preselect("activity", params.get("activity")),
      preselect("lodging", params.get("lodging")),
      preselect("transfer", params.get("transfer"))
    ].filter(Boolean);
    if (chosen.length && note) {
      note.textContent = "Carried over from the page you came from: " + chosen.join(", ") +
        ". You can change it below.";
      note.hidden = false;
    }

    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate(bookingForm)) { return; }

      var get = function (id) { return document.getElementById(id).value.trim(); };
      var rows = [
        ["Reference", reference()],
        ["Name", get("name")],
        ["Arrival", get("arrival")],
        ["Nights", get("nights") || "1"],
        ["Party size", get("party")],
        ["Lodging", get("lodging") || "None requested"],
        ["Activity", get("activity") || "None requested"],
        ["Airport transportation", get("transfer") || "Arranging my own"]
      ];
      if (get("notes")) { rows.push(["Notes", get("notes")]); }

      var dl = $("#confirmation-summary");
      dl.innerHTML = "";
      rows.forEach(function (row) {
        var dt = document.createElement("dt");
        dt.textContent = row[0];
        var dd = document.createElement("dd");
        dd.textContent = row[1];
        dl.appendChild(dt);
        dl.appendChild(dd);
      });

      $("#confirmation-line").textContent =
        "Thank you, " + get("name").split(" ")[0] + ". Here is what we have for your trip:";
      $("#confirmation-email").textContent = get("email");

      bookingForm.hidden = true;
      var confirmation = $("#confirmation");
      confirmation.hidden = false;
      confirmation.setAttribute("tabindex", "-1");
      confirmation.focus();
    });
  }

  /* --------------------------------------------- contact: submission ---- */
  var contactForm = $("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate(contactForm)) { return; }
      $("#contact-confirmation-line").textContent =
        "We have your question about " + $("#c-topic").value.toLowerCase() +
        ", and a copy has gone to " + $("#c-email").value.trim() +
        ". Your reference is " + reference() + ".";
      contactForm.hidden = true;
      var box = $("#contact-confirmation");
      box.hidden = false;
      box.setAttribute("tabindex", "-1");
      box.focus();
    });
  }
})();
