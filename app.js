require("dotenv").config();

const db = require("./config/database");
const express = require("express");
const path = require("path");

const {
  equipmentList,
  reservationList,
  equipmentStatusOptions
} = require("./data/sampleData");

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary test user until authentication and sessions are integrated.
// Later replace with: req.session.user.user_id
const userId = 1;

const reservationStatusOptionsFromDb = [
  "Pending",
  "Approved",
  "Rejected",
  "Waitlisted",
  "Cancelled",
  "Collected",
  "Returned",
  "Overdue"
];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function formatSqlDate(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadReservableEquipment(callback) {
  const sql = `
    SELECT
      equipment_id,
      equipment_name,
      asset_code,
      equipment_condition,
      status
    FROM equipment
    WHERE status NOT IN ('Maintenance', 'Damaged')
    ORDER BY equipment_name ASC
  `;

  db.query(sql, callback);
}

function renderReservationForm(res, options) {
  const {
    selectedId = "",
    formData = {},
    errorMessage = null,
    statusCode = 200
  } = options;

  loadReservableEquipment((err, equipmentList) => {
    if (err) {
      console.error("Error loading reservable equipment:", err);
      return res.status(500).send("Unable to load the reservation form right now.");
    }

    res.status(statusCode).render("reservation-form", {
      title: "New Reservation",
      currentPage: "reservations",
      equipmentList,
      selectedId,
      formData,
      errorMessage
    });
  });
}

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
  const sql = `
    SELECT
      r.reservation_id,
      r.start_date,
      r.end_date,
      r.purpose,
      r.status,
      r.queue_position,
      r.created_at,
      e.equipment_id,
      e.equipment_name,
      e.asset_code,
      u.name AS reserved_by
    FROM reservations r
    JOIN equipment e
      ON r.equipment_id = e.equipment_id
    JOIN users u
      ON r.user_id = u.user_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error retrieving reservations:", err);
      return res.status(500).render("reservations", {
        title: "Reservations",
        currentPage: "reservations",
        reservations: [],
        statistics: {
          pending: 0,
          approved: 0,
          borrowed: 0,
          overdue: 0
        },
        reservationStatusOptions: reservationStatusOptionsFromDb,
        errorMessage: "Unable to load reservations right now."
      });
    }

    const reservations = rows.map((row) => ({
      ...row,
      start_date: formatSqlDate(row.start_date),
      end_date: formatSqlDate(row.end_date)
    }));

    const statistics = {
      pending: reservations.filter(
        (reservation) => reservation.status === "Pending"
      ).length,
      approved: reservations.filter(
        (reservation) => reservation.status === "Approved"
      ).length,
      // Schema uses Collected (not Borrowed) for hand-out status.
      borrowed: reservations.filter(
        (reservation) => reservation.status === "Collected"
      ).length,
      overdue: reservations.filter(
        (reservation) => reservation.status === "Overdue"
      ).length
    };

    res.render("reservations", {
      title: "Reservations",
      currentPage: "reservations",
      reservations,
      statistics,
      reservationStatusOptions: reservationStatusOptionsFromDb,
      errorMessage: null
    });
  });
});

app.get("/reservations/new", (req, res) => {
  const requestedId = req.query.equipment_id ? Number(req.query.equipment_id) : NaN;

  loadReservableEquipment((err, equipmentList) => {
    if (err) {
      console.error("Error loading reservable equipment:", err);
      return res.status(500).send("Unable to load the reservation form right now.");
    }

    const selectedId = equipmentList.some(
      (item) => Number(item.equipment_id) === requestedId
    )
      ? requestedId
      : "";

    res.render("reservation-form", {
      title: "New Reservation",
      currentPage: "reservations",
      equipmentList,
      selectedId,
      formData: {},
      errorMessage: null
    });
  });
});

app.post("/reservations/add", (req, res) => {
  const equipment_id = req.body.equipment_id;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const purpose = typeof req.body.purpose === "string" ? req.body.purpose.trim() : "";

  const formData = {
    equipment_id,
    start_date,
    end_date,
    purpose
  };

  const selectedId = equipment_id ? Number(equipment_id) : "";

  function rejectWith(message) {
    return renderReservationForm(res, {
      selectedId,
      formData,
      errorMessage: message,
      statusCode: 400
    });
  }

  if (!equipment_id || !start_date || !end_date || !purpose) {
    return rejectWith("All fields are required.");
  }

  const equipmentIdNumber = Number(equipment_id);

  if (!Number.isInteger(equipmentIdNumber) || equipmentIdNumber <= 0) {
    return rejectWith("Please select a valid equipment item.");
  }

  const today = todayDateString();

  if (start_date < today) {
    return rejectWith("Start date cannot be before today.");
  }

  if (end_date < start_date) {
    return rejectWith("End date cannot be earlier than the start date.");
  }

  const equipmentSql = `
    SELECT
      equipment_id,
      equipment_name,
      status
    FROM equipment
    WHERE equipment_id = ?
    LIMIT 1
  `;

  db.query(equipmentSql, [equipmentIdNumber], (equipmentErr, equipmentRows) => {
    if (equipmentErr) {
      console.error("Error checking equipment:", equipmentErr);
      return renderReservationForm(res, {
        selectedId: equipmentIdNumber,
        formData,
        errorMessage: "Unable to create the reservation right now.",
        statusCode: 500
      });
    }

    if (!equipmentRows.length) {
      return rejectWith("Selected equipment was not found.");
    }

    const equipment = equipmentRows[0];

    if (equipment.status === "Maintenance" || equipment.status === "Damaged") {
      return rejectWith("Selected equipment is not available for reservation.");
    }

    const overlapSql = `
      SELECT reservation_id
      FROM reservations
      WHERE equipment_id = ?
        AND status IN ('Pending', 'Approved', 'Collected', 'Overdue')
        AND start_date <= ?
        AND end_date >= ?
      LIMIT 1
    `;

    db.query(
      overlapSql,
      [equipmentIdNumber, end_date, start_date],
      (overlapErr, overlapRows) => {
        if (overlapErr) {
          console.error("Error checking reservation overlap:", overlapErr);
          return renderReservationForm(res, {
            selectedId: equipmentIdNumber,
            formData,
            errorMessage: "Unable to create the reservation right now.",
            statusCode: 500
          });
        }

        if (overlapRows.length) {
          return rejectWith(
            "This equipment is already reserved for the selected dates."
          );
        }

        const insertSql = `
          INSERT INTO reservations (
            user_id,
            equipment_id,
            start_date,
            end_date,
            purpose,
            status
          ) VALUES (?, ?, ?, ?, ?, 'Pending')
        `;

        db.query(
          insertSql,
          [userId, equipmentIdNumber, start_date, end_date, purpose],
          (insertErr) => {
            if (insertErr) {
              console.error("Error creating reservation:", insertErr);
              return renderReservationForm(res, {
                selectedId: equipmentIdNumber,
                formData,
                errorMessage: "Unable to create the reservation right now.",
                statusCode: 500
              });
            }

            res.redirect("/reservations");
          }
        );
      }
    );
  });
});

// Temporary route to verify MySQL connectivity against the equipment table.
app.get("/db-test", (req, res) => {
  const sql = `
    SELECT
      equipment_id,
      equipment_name,
      asset_code,
      equipment_condition,
      status
    FROM equipment
    ORDER BY equipment_id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving equipment:", err);

      return res.status(500).json({
        error: "Failed to retrieve equipment"
      });
    }

    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Equipment Loan and Reservation System UI running at http://localhost:${PORT}`);
});
