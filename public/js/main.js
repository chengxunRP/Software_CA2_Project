// Frontend-only UI enhancements. No business logic, validation, or data
// persistence is performed here - all filtering happens against elements
// already rendered from the server's sample data.

document.addEventListener("DOMContentLoaded", function () {
  initReservationDateGuard();
  initTooltips();
  initEquipmentFilters();
  initReservationFilters();
  initReservationViewModal();
  initReservationCancelButtons();
});

// Keep the "End Date" input from allowing a date earlier than "Start Date"
// on the reservation form. This is a UI convenience only.
function initReservationDateGuard() {
  var startDateInput = document.getElementById("start_date");
  var endDateInput = document.getElementById("end_date");

  if (startDateInput && endDateInput) {
    startDateInput.addEventListener("change", function () {
      endDateInput.min = startDateInput.value;
    });
  }
}

function initTooltips() {
  var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(function (el) {
    new bootstrap.Tooltip(el);
  });
}

// Equipment catalogue: search + category + availability filters.
function initEquipmentFilters() {
  var grid = document.getElementById("equipmentGrid");
  if (!grid) return;

  var searchInput = document.getElementById("equipmentSearch");
  var categorySelect = document.getElementById("categoryFilter");
  var statusSelect = document.getElementById("availabilityFilter");
  var resetBtn = document.getElementById("resetEquipmentFilters");
  var resultCount = document.getElementById("equipmentResultCount");
  var emptyState = document.getElementById("equipmentEmptyState");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".equipment-card-col"));

  function applyFilters() {
    var term = searchInput.value.trim().toLowerCase();
    var category = categorySelect.value;
    var status = statusSelect.value;
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchesTerm = !term ||
        card.dataset.name.indexOf(term) !== -1 ||
        card.dataset.code.indexOf(term) !== -1;
      var matchesCategory = !category || card.dataset.category === category;
      var matchesStatus = !status || card.dataset.status === status;
      var isVisible = matchesTerm && matchesCategory && matchesStatus;

      card.classList.toggle("d-none", !isVisible);
      if (isVisible) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = "Showing " + visibleCount + " of " + cards.length + " items";
    }
    if (emptyState) {
      emptyState.classList.toggle("d-none", visibleCount !== 0);
    }
  }

  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);
  statusSelect.addEventListener("change", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      searchInput.value = "";
      categorySelect.value = "";
      statusSelect.value = "";
      applyFilters();
    });
  }
}

// Reservations table: search + status + start-date filters.
function initReservationFilters() {
  var table = document.getElementById("reservationsTable");
  if (!table) return;

  var searchInput = document.getElementById("reservationSearch");
  var statusSelect = document.getElementById("reservationStatusFilter");
  var dateInput = document.getElementById("reservationDateFilter");
  var resetBtn = document.getElementById("resetReservationFilters");
  var resultCount = document.getElementById("reservationResultCount");
  var emptyState = document.getElementById("reservationsEmptyState");
  var rows = Array.prototype.slice.call(table.querySelectorAll(".reservation-row"));

  function applyFilters() {
    var term = searchInput.value.trim().toLowerCase();
    var status = statusSelect.value;
    var fromDate = dateInput.value;
    var visibleCount = 0;

    rows.forEach(function (row) {
      var matchesTerm = !term || row.dataset.search.indexOf(term) !== -1;
      var matchesStatus = !status || row.dataset.status === status;
      var matchesDate = !fromDate || row.dataset.start >= fromDate;
      var isVisible = matchesTerm && matchesStatus && matchesDate;

      row.classList.toggle("d-none", !isVisible);
      if (isVisible) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = "Showing " + visibleCount + " of " + rows.length + " reservations";
    }
    if (emptyState) {
      emptyState.classList.toggle("d-none", visibleCount !== 0);
    }
  }

  searchInput.addEventListener("input", applyFilters);
  statusSelect.addEventListener("change", applyFilters);
  dateInput.addEventListener("change", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      searchInput.value = "";
      statusSelect.value = "";
      dateInput.value = "";
      applyFilters();
    });
  }
}

// Populate the "View Reservation" modal from the clicked row's data attributes.
function initReservationViewModal() {
  var modal = document.getElementById("reservationViewModal");
  if (!modal) return;

  modal.addEventListener("show.bs.modal", function (event) {
    var button = event.relatedTarget;
    if (!button) return;

    document.getElementById("modalReservationId").textContent = "#" + button.dataset.id;
    document.getElementById("modalReservationEquipment").textContent = button.dataset.equipment;
    document.getElementById("modalReservationBorrower").textContent = button.dataset.borrower;
    document.getElementById("modalReservationStart").textContent = button.dataset.start;
    document.getElementById("modalReservationEnd").textContent = button.dataset.end;
    document.getElementById("modalReservationPurpose").textContent = button.dataset.purpose;
    document.getElementById("modalReservationStatus").textContent = button.dataset.status;
  });
}

// Sample-only cancel action: asks for confirmation and visually marks the
// row as cancelled in the browser. Nothing is sent to the server.
function initReservationCancelButtons() {
  var cancelButtons = document.querySelectorAll(".reservation-cancel-btn");

  cancelButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var confirmed = window.confirm(
        "Cancel reservation #" + btn.dataset.id + "? (Demo only - no data is changed)"
      );
      if (!confirmed) return;

      var row = btn.closest("tr");
      if (row) {
        row.style.opacity = "0.45";
      }
      btn.disabled = true;
      var viewBtn = row ? row.querySelector(".reservation-view-btn") : null;
      if (viewBtn) viewBtn.disabled = true;
    });
  });
}
