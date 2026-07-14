const express = require("express");
const path = require("path");
const {
  equipmentList,
  reservationList,
  equipmentStatusOptions,
  reservationStatusOptions
} = require("./data/sampleData");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login", currentPage: "login" });
});

// Presentational only: no authentication is performed here.
app.post("/login", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register", currentPage: "register" });
});

// Presentational only: no account creation is performed here.
app.post("/register", (req, res) => {
  res.redirect("/login");
});

app.get("/dashboard", (req, res) => {
  const summary = {
    total: equipmentList.length,
    available: equipmentList.filter(e => e.status === "Available").length,
    activeLoans: reservationList.filter(r => r.status === "Borrowed").length,
    overdue: reservationList.filter(r => r.status === "Overdue").length
  };

  const attentionEquipment = equipmentList.filter(
    e => e.status === "Maintenance" || e.status === "Damaged"
  );

  res.render("dashboard", {
    title: "Dashboard",
    currentPage: "dashboard",
    summary,
    recentReservations: reservationList.slice(0, 5),
    attentionEquipment
  });
});

app.get("/equipment", (req, res) => {
  const categories = [...new Set(equipmentList.map(e => e.category))];

  res.render("equipment", {
    title: "Equipment",
    currentPage: "equipment",
    equipmentList,
    statusOptions: equipmentStatusOptions,
    categories
  });
});

app.get("/equipment/:id", (req, res) => {
  const item = equipmentList.find(e => e.id === Number(req.params.id)) || equipmentList[0];
  res.render("equipment-details", {
    title: item.name,
    currentPage: "equipment",
    item
  });
});

app.get("/reservations", (req, res) => {
  const reservationSummary = {
    pending: reservationList.filter(r => r.status === "Pending").length,
    approved: reservationList.filter(r => r.status === "Approved").length,
    borrowed: reservationList.filter(r => r.status === "Borrowed").length,
    overdue: reservationList.filter(r => r.status === "Overdue").length
  };

  res.render("reservations", {
    title: "Reservations",
    currentPage: "reservations",
    reservationList,
    reservationSummary,
    reservationStatusOptions
  });
});

app.get("/reservations/new", (req, res) => {
  const selectedId = req.query.equipment_id ? Number(req.query.equipment_id) : "";
  res.render("reservation-form", {
    title: "New Reservation",
    currentPage: "reservations",
    equipmentList,
    selectedId
  });
});

// Presentational only: no validation, availability checks or persistence occur here.
app.post("/reservations/add", (req, res) => {
  res.redirect("/reservations");
});

app.listen(PORT, () => {
  console.log(`Equipment Loan and Reservation System UI running at http://localhost:${PORT}`);
});
